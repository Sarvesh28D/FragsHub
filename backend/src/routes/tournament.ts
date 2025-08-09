import { Router, Request, Response } from 'express';
import * as admin from 'firebase-admin';
import axios from 'axios';

const router = Router();
const db = admin.firestore();

// Challonge API configuration
const CHALLONGE_API_URL = 'https://api.challonge.com/v1';
const CHALLONGE_API_KEY = process.env.CHALLONGE_API_KEY;
const CHALLONGE_USERNAME = process.env.CHALLONGE_USERNAME;

// Create a new tournament
router.post('/create', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      entryFee,
      maxTeams,
      startDate,
      game,
    } = req.body;

    if (!name || !entryFee || !maxTeams) {
      res.status(400).json({
        error: 'Missing required fields: name, entryFee, maxTeams'
      });
      return;
    }

    // Create tournament in Challonge
    const challongeResponse = await axios.post(
      `${CHALLONGE_API_URL}/tournaments.json`,
      {
        api_key: CHALLONGE_API_KEY,
        tournament: {
          name,
          description,
          tournament_type: 'single elimination',
          url: `fragshub-${Date.now()}`,
          accept_attachments: false,
          hide_forum: true,
          show_rounds: true,
          private: false,
          signup_cap: maxTeams,
          start_at: startDate ? new Date(startDate).toISOString() : null,
        }
      }
    );

    const challongeTournament = (challongeResponse.data as any).tournament;

    // Create tournament document in Firestore
    const tournamentData = {
      id: challongeTournament.id.toString(),
      name,
      description: description || '',
      entryFee,
      maxTeams,
      startDate: startDate ? new Date(startDate) : null,
      game: game || 'Valorant',
      status: 'upcoming',
      challongeId: challongeTournament.id,
      challongeUrl: challongeTournament.url,
      teams: [],
      matches: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('tournaments').doc(tournamentData.id).set(tournamentData);

    res.status(201).json({
      success: true,
      tournament: tournamentData,
      message: 'Tournament created successfully'
    });
  } catch (error) {
    console.error('Error creating tournament:', error);
    res.status(500).json({
      error: 'Failed to create tournament'
    });
  }
});

// Get active tournament
router.get('/active', async (req: Request, res: Response) => {
  try {
    const tournamentSnapshot = await db.collection('tournaments')
      .where('status', 'in', ['upcoming', 'live'])
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (tournamentSnapshot.empty) {
      return res.json({
        success: true,
        tournament: null,
        message: 'No active tournament found'
      });
    }

    const tournament = tournamentSnapshot.docs[0].data();
    
    // Fetch latest bracket data from Challonge
    try {
      const challongeResponse = await axios.get(
        `${CHALLONGE_API_URL}/tournaments/${tournament.challongeId}.json?api_key=${CHALLONGE_API_KEY}&include_participants=1&include_matches=1`
      );
      
      const challongeData = (challongeResponse.data as any).tournament;
      
      // Update tournament with latest data
      tournament.participants = challongeData.participants || [];
      tournament.matches = challongeData.matches || [];
      tournament.state = challongeData.state;
    } catch (challongeError) {
      console.error('Error fetching Challonge data:', challongeError);
    }

    res.json({
      success: true,
      tournament
    });
  } catch (error) {
    console.error('Error fetching active tournament:', error);
    res.status(500).json({
      error: 'Failed to fetch active tournament'
    });
  }
});

// Get tournament by ID
router.get('/:tournamentId', async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;

    const tournamentDoc = await db.collection('tournaments').doc(tournamentId).get();

    if (!tournamentDoc.exists) {
      return res.status(404).json({
        error: 'Tournament not found'
      });
    }

    const tournament = tournamentDoc.data();

    // Fetch latest bracket data from Challonge
    try {
      const challongeResponse = await axios.get(
        `${CHALLONGE_API_URL}/tournaments/${tournament?.challongeId}.json?api_key=${CHALLONGE_API_KEY}&include_participants=1&include_matches=1`
      );
      
      const challongeData = (challongeResponse.data as any).tournament;
      
      tournament!.participants = challongeData.participants || [];
      tournament!.matches = challongeData.matches || [];
      tournament!.state = challongeData.state;
    } catch (challongeError) {
      console.error('Error fetching Challonge data:', challongeError);
    }

    res.json({
      success: true,
      tournament
    });
  } catch (error) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({
      error: 'Failed to fetch tournament'
    });
  }
});

// Start tournament
router.post('/:tournamentId/start', async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;

    // Get tournament
    const tournamentDoc = await db.collection('tournaments').doc(tournamentId).get();
    if (!tournamentDoc.exists) {
      return res.status(404).json({
        error: 'Tournament not found'
      });
    }

    const tournament = tournamentDoc.data();

    // Start tournament in Challonge
    await axios.post(
      `${CHALLONGE_API_URL}/tournaments/${tournament?.challongeId}/start.json`,
      {
        api_key: CHALLONGE_API_KEY,
      }
    );

    // Update tournament status
    await db.collection('tournaments').doc(tournamentId).update({
      status: 'live',
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: 'Tournament started successfully'
    });
  } catch (error) {
    console.error('Error starting tournament:', error);
    res.status(500).json({
      error: 'Failed to start tournament'
    });
  }
});

// Add team to tournament
router.post('/:tournamentId/teams', async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;
    const { teamId } = req.body;

    if (!teamId) {
      return res.status(400).json({
        error: 'teamId is required'
      });
    }

    // Get tournament and team
    const [tournamentDoc, teamDoc] = await Promise.all([
      db.collection('tournaments').doc(tournamentId).get(),
      db.collection('teams').doc(teamId).get()
    ]);

    if (!tournamentDoc.exists || !teamDoc.exists) {
      return res.status(404).json({
        error: 'Tournament or team not found'
      });
    }

    const tournament = tournamentDoc.data();
    const team = teamDoc.data();

    // Check if team is approved and payment is completed
    if (team?.registrationStatus !== 'approved' || team?.paymentStatus !== 'paid') {
      return res.status(400).json({
        error: 'Team must be approved and payment completed'
      });
    }

    // Add participant to Challonge tournament
    const participantResponse = await axios.post(
      `${CHALLONGE_API_URL}/tournaments/${tournament?.challongeId}/participants.json`,
      {
        api_key: CHALLONGE_API_KEY,
        participant: {
          name: team?.name,
          misc: teamId, // Store team ID for reference
        }
      }
    );

    const participant = (participantResponse.data as any).participant;

    // Update tournament teams list
    await db.collection('tournaments').doc(tournamentId).update({
      teams: admin.firestore.FieldValue.arrayUnion({
        teamId,
        participantId: participant.id,
        name: team?.name,
        addedAt: new Date(),
      }),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      participant,
      message: 'Team added to tournament successfully'
    });
  } catch (error) {
    console.error('Error adding team to tournament:', error);
    res.status(500).json({
      error: 'Failed to add team to tournament'
    });
  }
});

// Update match result
router.put('/:tournamentId/matches/:matchId', async (req: Request, res: Response) => {
  try {
    const { tournamentId, matchId } = req.params;
    const { winnerId, scores } = req.body;

    if (!winnerId) {
      return res.status(400).json({
        error: 'winnerId is required'
      });
    }

    // Get tournament
    const tournamentDoc = await db.collection('tournaments').doc(tournamentId).get();
    if (!tournamentDoc.exists) {
      return res.status(404).json({
        error: 'Tournament not found'
      });
    }

    const tournament = tournamentDoc.data();

    // Update match in Challonge
    await axios.put(
      `${CHALLONGE_API_URL}/tournaments/${tournament?.challongeId}/matches/${matchId}.json`,
      {
        api_key: CHALLONGE_API_KEY,
        match: {
          winner_id: winnerId,
          scores_csv: scores || '',
        }
      }
    );

    res.json({
      success: true,
      message: 'Match result updated successfully'
    });
  } catch (error) {
    console.error('Error updating match result:', error);
    res.status(500).json({
      error: 'Failed to update match result'
    });
  }
});

// Get tournament leaderboard
router.get('/:tournamentId/leaderboard', async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;

    const tournamentDoc = await db.collection('tournaments').doc(tournamentId).get();
    if (!tournamentDoc.exists) {
      return res.status(404).json({
        error: 'Tournament not found'
      });
    }

    const tournament = tournamentDoc.data();

    // Fetch participants with final rankings from Challonge
    const response = await axios.get(
      `${CHALLONGE_API_URL}/tournaments/${tournament?.challongeId}/participants.json?api_key=${CHALLONGE_API_KEY}`
    );

    const participants = (response.data as any).map((p: any) => p.participant)
      .sort((a: any, b: any) => (a.final_rank || 999) - (b.final_rank || 999));

    const leaderboard = participants.map((participant: any, index: number) => ({
      rank: participant.final_rank || index + 1,
      teamName: participant.name,
      teamId: participant.misc,
      participantId: participant.id,
      wins: participant.matches_won || 0,
      losses: participant.matches_lost || 0,
    }));

    res.json({
      success: true,
      leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      error: 'Failed to fetch leaderboard'
    });
  }
});

export { router as tournamentRoutes };
