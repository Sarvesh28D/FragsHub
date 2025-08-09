"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTournamentReminders = exports.generateTournamentBrackets = exports.cleanupExpiredPayments = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const axios_1 = __importDefault(require("axios"));
const db = admin.firestore();
// Cleanup expired payments (runs every hour)
exports.cleanupExpiredPayments = functions.pubsub
    .schedule('every 1 hours')
    .onRun(async (context) => {
    try {
        console.log('Running cleanup for expired payments...');
        // Get payment orders older than 24 hours that are still pending
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const expiredOrdersSnapshot = await db.collection('payment_orders')
            .where('status', '==', 'created')
            .where('createdAt', '<', oneDayAgo)
            .get();
        const batch = db.batch();
        let expiredCount = 0;
        expiredOrdersSnapshot.docs.forEach(doc => {
            const orderData = doc.data();
            // Mark payment order as expired
            batch.update(doc.ref, {
                status: 'expired',
                expiredAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            // Mark associated team payment as failed if it exists
            if (orderData.teamId) {
                const teamRef = db.collection('teams').doc(orderData.teamId);
                batch.update(teamRef, {
                    paymentStatus: 'expired',
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
            expiredCount++;
        });
        if (expiredCount > 0) {
            await batch.commit();
            console.log(`Marked ${expiredCount} payment orders as expired`);
        }
        else {
            console.log('No expired payment orders found');
        }
    }
    catch (error) {
        console.error('Error cleaning up expired payments:', error);
    }
});
// Generate tournament brackets (runs every 30 minutes)
exports.generateTournamentBrackets = functions.pubsub
    .schedule('every 30 minutes')
    .onRun(async (context) => {
    var _a;
    try {
        console.log('Checking for tournaments ready for bracket generation...');
        // Get upcoming tournaments
        const upcomingTournamentsSnapshot = await db.collection('tournaments')
            .where('status', '==', 'upcoming')
            .get();
        for (const tournamentDoc of upcomingTournamentsSnapshot.docs) {
            const tournament = tournamentDoc.data();
            // Check if tournament should start
            const now = new Date();
            const startDate = (_a = tournament.startDate) === null || _a === void 0 ? void 0 : _a.toDate();
            if (startDate && startDate <= now) {
                await processTournamentStart(tournamentDoc.id, tournament);
            }
            // Check if we have enough teams to generate brackets
            const approvedTeamsSnapshot = await db.collection('teams')
                .where('registrationStatus', '==', 'approved')
                .where('paymentStatus', '==', 'paid')
                .get();
            const approvedTeams = approvedTeamsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            // Auto-start tournament if we have enough teams (8+)
            if (approvedTeams.length >= 8 && tournament.status === 'upcoming') {
                console.log(`Tournament ${tournament.name} has ${approvedTeams.length} teams, starting...`);
                // Add teams to tournament
                await addTeamsToTournament(tournamentDoc.id, tournament, approvedTeams);
                // Start the tournament
                await startTournament(tournamentDoc.id, tournament);
            }
        }
    }
    catch (error) {
        console.error('Error generating tournament brackets:', error);
    }
});
// Helper function to process tournament start
async function processTournamentStart(tournamentId, tournament) {
    try {
        console.log(`Starting tournament: ${tournament.name} (${tournamentId})`);
        // Get all approved and paid teams
        const approvedTeamsSnapshot = await db.collection('teams')
            .where('registrationStatus', '==', 'approved')
            .where('paymentStatus', '==', 'paid')
            .get();
        const approvedTeams = approvedTeamsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        if (approvedTeams.length < 4) {
            console.log(`Not enough teams to start tournament (${approvedTeams.length}/4)`);
            // Postpone tournament start
            await db.collection('tournaments').doc(tournamentId).update({
                startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Postpone by 1 day
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return;
        }
        // Add teams to tournament
        await addTeamsToTournament(tournamentId, tournament, approvedTeams);
        // Start the tournament
        await startTournament(tournamentId, tournament);
    }
    catch (error) {
        console.error(`Error starting tournament ${tournamentId}:`, error);
    }
}
// Helper function to add teams to tournament
async function addTeamsToTournament(tournamentId, tournament, teams) {
    try {
        const CHALLONGE_API_URL = 'https://api.challonge.com/v1';
        const CHALLONGE_API_KEY = process.env.CHALLONGE_API_KEY;
        const participants = [];
        for (const team of teams) {
            try {
                // Add participant to Challonge tournament
                const participantResponse = await axios_1.default.post(`${CHALLONGE_API_URL}/tournaments/${tournament.challongeId}/participants.json`, {
                    api_key: CHALLONGE_API_KEY,
                    participant: {
                        name: team.name,
                        misc: team.id, // Store team ID for reference
                    }
                });
                participants.push({
                    teamId: team.id,
                    participantId: participantResponse.data.participant.id,
                    name: team.name,
                    addedAt: new Date(),
                });
            }
            catch (error) {
                console.error(`Error adding team ${team.name} to tournament:`, error);
            }
        }
        // Update tournament with participants
        await db.collection('tournaments').doc(tournamentId).update({
            teams: participants,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Added ${participants.length} teams to tournament ${tournament.name}`);
    }
    catch (error) {
        console.error('Error adding teams to tournament:', error);
    }
}
// Helper function to start tournament
async function startTournament(tournamentId, tournament) {
    var _a;
    try {
        const CHALLONGE_API_URL = 'https://api.challonge.com/v1';
        const CHALLONGE_API_KEY = process.env.CHALLONGE_API_KEY;
        // Start tournament in Challonge
        await axios_1.default.post(`${CHALLONGE_API_URL}/tournaments/${tournament.challongeId}/start.json`, {
            api_key: CHALLONGE_API_KEY,
        });
        // Update tournament status
        await db.collection('tournaments').doc(tournamentId).update({
            status: 'live',
            startedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Create notification
        await db.collection('notifications').add({
            type: 'tournament_started',
            title: 'Tournament Started',
            message: `Tournament "${tournament.name}" has started with ${((_a = tournament.teams) === null || _a === void 0 ? void 0 : _a.length) || 0} teams`,
            tournamentId,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Tournament ${tournament.name} started successfully`);
    }
    catch (error) {
        console.error('Error starting tournament:', error);
    }
}
// Send tournament reminders (runs daily at 9 AM)
exports.sendTournamentReminders = functions.pubsub
    .schedule('0 9 * * *')
    .timeZone('Asia/Kolkata')
    .onRun(async (context) => {
    try {
        console.log('Sending tournament reminders...');
        // Get tournaments starting in next 24 hours
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const dayAfter = new Date(Date.now() + 48 * 60 * 60 * 1000);
        const upcomingTournamentsSnapshot = await db.collection('tournaments')
            .where('status', '==', 'upcoming')
            .where('startDate', '>=', tomorrow)
            .where('startDate', '<=', dayAfter)
            .get();
        for (const tournamentDoc of upcomingTournamentsSnapshot.docs) {
            const tournament = tournamentDoc.data();
            // Get all registered teams for this tournament
            const teamsSnapshot = await db.collection('teams')
                .where('registrationStatus', '==', 'approved')
                .where('paymentStatus', '==', 'paid')
                .get();
            // Send reminder emails to team captains
            for (const teamDoc of teamsSnapshot.docs) {
                const team = teamDoc.data();
                await sendTournamentReminderEmail(team.captainEmail, team.name, tournament.name, tournament.startDate.toDate());
            }
            console.log(`Sent reminders for tournament: ${tournament.name}`);
        }
    }
    catch (error) {
        console.error('Error sending tournament reminders:', error);
    }
});
// Helper function to send tournament reminder email
async function sendTournamentReminderEmail(email, teamName, tournamentName, startDate) {
    console.log(`Sending tournament reminder to ${email} for team ${teamName}`);
    // This would integrate with EmailJS or another email service
    // const emailData = {
    //   to_email: email,
    //   team_name: teamName,
    //   tournament_name: tournamentName,
    //   start_date: startDate.toLocaleString('en-IN'),
    //   tournament_link: 'https://fragshub.com/bracket'
    // };
    // 
    // await sendEmailViaEmailJS('tournament_reminder_template', emailData);
}
//# sourceMappingURL=scheduled.js.map