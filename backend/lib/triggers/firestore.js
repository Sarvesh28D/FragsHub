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
Object.defineProperty(exports, "__esModule", { value: true });
exports.onPaymentComplete = exports.onTeamCreate = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
// Trigger when a new team is created
exports.onTeamCreate = functions.firestore
    .document('teams/{teamId}')
    .onCreate(async (snap, context) => {
    const teamData = snap.data();
    const teamId = context.params.teamId;
    try {
        console.log(`New team created: ${teamData.name} (${teamId})`);
        // Send welcome email to team captain
        // This would integrate with EmailJS or similar service
        await sendTeamRegistrationEmail(teamData.captainEmail, teamData.name, teamId);
        // Create notification for admins
        await db.collection('notifications').add({
            type: 'new_team_registration',
            title: 'New Team Registration',
            message: `Team "${teamData.name}" has registered for the tournament`,
            teamId,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Welcome email sent to ${teamData.captainEmail}`);
    }
    catch (error) {
        console.error('Error processing team creation:', error);
    }
});
// Trigger when payment is completed
exports.onPaymentComplete = functions.firestore
    .document('teams/{teamId}')
    .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const teamId = context.params.teamId;
    // Check if payment status changed to 'paid'
    if ((beforeData === null || beforeData === void 0 ? void 0 : beforeData.paymentStatus) !== 'paid' && (afterData === null || afterData === void 0 ? void 0 : afterData.paymentStatus) === 'paid') {
        try {
            console.log(`Payment completed for team: ${afterData.name} (${teamId})`);
            // Send payment confirmation email
            await sendPaymentConfirmationEmail(afterData.captainEmail, afterData.name, afterData.entryFee, afterData.paymentId);
            // Create notification for admins
            await db.collection('notifications').add({
                type: 'payment_completed',
                title: 'Payment Completed',
                message: `Team "${afterData.name}" has completed payment of ₹${afterData.entryFee}`,
                teamId,
                read: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            // Auto-approve team if payment is completed (optional)
            const autoApprove = process.env.AUTO_APPROVE_TEAMS === 'true';
            if (autoApprove) {
                await change.after.ref.update({
                    registrationStatus: 'approved',
                    approvedAt: admin.firestore.FieldValue.serverTimestamp(),
                    approvedBy: 'system_auto',
                });
                console.log(`Team ${afterData.name} auto-approved after payment`);
            }
        }
        catch (error) {
            console.error('Error processing payment completion:', error);
        }
    }
});
// Helper function to send team registration email
async function sendTeamRegistrationEmail(email, teamName, teamId) {
    // This would integrate with EmailJS or another email service
    // For now, just log the action
    console.log(`Sending registration email to ${email} for team ${teamName} (${teamId})`);
    // Example integration with EmailJS would look like:
    // const emailData = {
    //   to_email: email,
    //   team_name: teamName,
    //   team_id: teamId,
    //   registration_link: `https://fragshub.com/team/${teamId}`
    // };
    // 
    // await sendEmailViaEmailJS('team_registration_template', emailData);
}
// Helper function to send payment confirmation email
async function sendPaymentConfirmationEmail(email, teamName, amount, paymentId) {
    console.log(`Sending payment confirmation email to ${email} for team ${teamName}`);
    // Example integration with EmailJS:
    // const emailData = {
    //   to_email: email,
    //   team_name: teamName,
    //   amount: amount,
    //   payment_id: paymentId,
    //   tournament_link: 'https://fragshub.com/bracket'
    // };
    // 
    // await sendEmailViaEmailJS('payment_confirmation_template', emailData);
}
//# sourceMappingURL=firestore.js.map