import { Router, Request, Response } from 'express';
import axios from 'axios';
import * as admin from 'firebase-admin';

const router = Router();

// Challonge API configuration
const CHALLONGE_API_URL = 'https://api.challonge.com/v1';
const CHALLONGE_API_KEY = process.env.CHALLONGE_API_KEY || '';

// Get firestore instance (will be available after admin.initializeApp() is called)
const getDB = () => admin.firestore();

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

    await getDB().collection('tournaments').doc(tournamentData.id).set(tournamentData);

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
router.get('/active', async (req: Request, res: Response): Promise<void> => {
  try {
    const tournamentSnapshot = await getDB().collection('tournaments')
      .where('status', 'in', ['upcoming', 'live'])
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (tournamentSnapshot.empty) {
      res.json({
        success: true,
        tournament: null,
        message: 'No active tournament found'
      });
      return;
    }

    const tournament = tournamentSnapshot.docs[0].data();
    res.json({
      success: true,
      tournament,
      message: 'Active tournament retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting active tournament:', error);
    res.status(500).json({
      error: 'Failed to get active tournament'
    });
  }
});

// Get all tournaments
router.get('/', async (req: Request, res: Response) => {
  try {
    const tournamentSnapshot = await getDB().collection('tournaments')
      .orderBy('createdAt', 'desc')
      .get();

    const tournaments = tournamentSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      tournaments,
      count: tournaments.length
    });
  } catch (error) {
    console.error('Error getting tournaments:', error);
    res.status(500).json({
      error: 'Failed to get tournaments'
    });
  }
});

// Get tournament by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const tournamentDoc = await getDB().collection('tournaments').doc(id).get();

    if (!tournamentDoc.exists) {
      res.status(404).json({
        error: 'Tournament not found'
      });
      return;
    }

    const tournament = tournamentDoc.data();
    res.json({
      success: true,
      tournament
    });
  } catch (error) {
    console.error('Error getting tournament:', error);
    res.status(500).json({
      error: 'Failed to get tournament'
    });
  }
});

// Start tournament
router.post('/:id/start', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Start tournament in Challonge
    await axios.post(`${CHALLONGE_API_URL}/tournaments/${id}/start.json`, {
      api_key: CHALLONGE_API_KEY
    });

    // Update tournament status in Firestore
    await getDB().collection('tournaments').doc(id).update({
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

// Generate brackets
router.post('/:id/brackets', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get tournament from Firestore
    const tournamentDoc = await getDB().collection('tournaments').doc(id).get();
    if (!tournamentDoc.exists) {
      res.status(404).json({
        error: 'Tournament not found'
      });
      return;
    }

    const tournament = tournamentDoc.data();
    const challongeId = tournament?.challongeId;

    // Get matches from Challonge
    const matchesResponse = await axios.get(
      `${CHALLONGE_API_URL}/tournaments/${challongeId}/matches.json?api_key=${CHALLONGE_API_KEY}`
    );

    const matches = matchesResponse.data.map((match: any) => ({
      id: match.match.id,
      round: match.match.round,
      player1Id: match.match.player1_id,
      player2Id: match.match.player2_id,
      winnerId: match.match.winner_id,
      state: match.match.state,
      scheduledTime: match.match.scheduled_time,
    }));

    // Update tournament with matches
    await getDB().collection('tournaments').doc(id).update({
      matches,
      bracketsGenerated: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      matches,
      message: 'Brackets generated successfully'
    });
  } catch (error) {
    console.error('Error generating brackets:', error);
    res.status(500).json({
      error: 'Failed to generate brackets'
    });
  }
});

// Update match result
router.put('/matches/:matchId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { matchId } = req.params;
    const { winnerId, scores } = req.body;

    if (!winnerId) {
      res.status(400).json({
        error: 'winnerId is required'
      });
      return;
    }

    // Update match in Challonge
    await axios.put(
      `${CHALLONGE_API_URL}/tournaments/matches/${matchId}.json`,
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

// Delete tournament
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get tournament to get Challonge ID
    const tournamentDoc = await getDB().collection('tournaments').doc(id).get();
    if (!tournamentDoc.exists) {
      res.status(404).json({
        error: 'Tournament not found'
      });
      return;
    }

    const tournament = tournamentDoc.data();
    const challongeId = tournament?.challongeId;

    // Delete tournament from Challonge
    try {
      await axios.delete(`${CHALLONGE_API_URL}/tournaments/${challongeId}.json?api_key=${CHALLONGE_API_KEY}`);
    } catch (challongeError) {
      console.warn('Failed to delete tournament from Challonge:', challongeError);
    }

    // Delete tournament from Firestore
    await getDB().collection('tournaments').doc(id).delete();

    res.json({
      success: true,
      message: 'Tournament deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tournament:', error);
    res.status(500).json({
      error: 'Failed to delete tournament'
    });
  }
});

export { router as tournamentRoutes };
