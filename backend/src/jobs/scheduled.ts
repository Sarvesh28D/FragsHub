import * as admin from 'firebase-admin';
import axios from 'axios';

// Get firestore instance
const getDB = () => admin.firestore();

// Handler to cleanup expired payments (runs every hour)
export const cleanupExpiredPaymentsHandler = async (): Promise<void> => {
  try {
    console.log('Starting cleanup of expired payments...');

    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Query for payments that are older than 24 hours and still pending
    const expiredPaymentsQuery = await getDB().collection('payments')
      .where('status', '==', 'created')
      .where('createdAt', '<=', admin.firestore.Timestamp.fromDate(twentyFourHoursAgo))
      .get();

    if (expiredPaymentsQuery.empty) {
      console.log('No expired payments found');
      return;
    }

    console.log(`Found ${expiredPaymentsQuery.size} expired payments to cleanup`);

    // Batch delete expired payments
    const batch = getDB().batch();
    
    expiredPaymentsQuery.docs.forEach((doc: any) => {
      console.log(`Marking payment ${doc.id} as expired`);
      batch.update(doc.ref, {
        status: 'expired',
        expiredAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();
    console.log(`Successfully marked ${expiredPaymentsQuery.size} payments as expired`);

  } catch (error) {
    console.error('Error in cleanupExpiredPaymentsHandler:', error);
  }
};

// Handler to generate tournament brackets (runs daily at 9 AM)
export const generateTournamentBracketsHandler = async (): Promise<void> => {
  try {
    console.log('Starting tournament bracket generation...');

    // Get Challonge API key from environment
    const challongeApiKey = process.env.CHALLONGE_API_KEY;

    if (!challongeApiKey) {
      console.error('Challonge API key not found in environment variables');
      return;
    }

    // Find tournaments that need bracket generation
    const tournamentsQuery = await getDB().collection('tournaments')
      .where('status', '==', 'registration_closed')
      .where('bracketGenerated', '==', false)
      .get();

    if (tournamentsQuery.empty) {
      console.log('No tournaments need bracket generation');
      return;
    }

    console.log(`Found ${tournamentsQuery.size} tournaments for bracket generation`);

    for (const tournamentDoc of tournamentsQuery.docs) {
      const tournament = tournamentDoc.data();
      const tournamentId = tournamentDoc.id;

      try {
        console.log(`Generating bracket for tournament: ${tournament.name}`);

        // Get all approved teams for this tournament
        const teamsQuery = await getDB().collection('teams')
          .where('tournamentId', '==', tournamentId)
          .where('status', '==', 'approved')
          .where('paymentStatus', '==', 'paid')
          .get();

        if (teamsQuery.size < 2) {
          console.log(`Not enough teams for tournament ${tournamentId} (${teamsQuery.size} teams)`);
          continue;
        }

        // Create participants array for Challonge
        const participants = teamsQuery.docs.map(doc => {
          const team = doc.data();
          return {
            name: team.name,
            misc: team.id // Store team ID for reference
          };
        });

        // Create tournament on Challonge
        const challongeResponse = await axios.post(
          'https://api.challonge.com/v1/tournaments.json',
          {
            api_key: challongeApiKey,
            tournament: {
              name: tournament.name,
              tournament_type: 'single elimination',
              url: `fragshub-${tournamentId}`,
              description: tournament.description || 'FragsHub Tournament',
              game_name: tournament.game || 'Valorant',
              private: false
            }
          }
        );

        const challongeTournament = (challongeResponse.data as any).tournament;
        console.log(`Created Challonge tournament: ${challongeTournament.id}`);

        // Add participants to Challonge tournament
        for (const participant of participants) {
          await axios.post(
            `https://api.challonge.com/v1/tournaments/${challongeTournament.id}/participants.json`,
            {
              api_key: challongeApiKey,
              participant: participant
            }
          );
        }

        // Start the tournament (generate brackets)
        await axios.post(
          `https://api.challonge.com/v1/tournaments/${challongeTournament.id}/start.json`,
          {
            api_key: challongeApiKey
          }
        );

        // Update tournament document with bracket info
        await getDB().collection('tournaments').doc(tournamentId).update({
          bracketGenerated: true,
          challongeId: challongeTournament.id,
          challongeUrl: challongeTournament.full_challonge_url,
          bracketGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'ongoing',
          participantCount: participants.length
        });

        console.log(`Successfully generated bracket for tournament ${tournamentId}`);

      } catch (error) {
        console.error(`Error generating bracket for tournament ${tournamentId}:`, error);
        
        // Update tournament with error status
        await getDB().collection('tournaments').doc(tournamentId).update({
          bracketGenerationError: error instanceof Error ? error.message : 'Unknown error',
          bracketGenerationFailedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    console.log('Tournament bracket generation completed');

  } catch (error) {
    console.error('Error in generateTournamentBracketsHandler:', error);
  }
};
