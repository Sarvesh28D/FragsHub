import express, { Request, Response } from 'express';
import * as admin from 'firebase-admin';

const router = express.Router();

// Get firestore instance (will be available after admin.initializeApp() is called)
const getDB = () => admin.firestore();

// Interface for team registration data
interface TeamRegistrationData {
  teamName: string;
  players: Array<{
    name: string;
    email: string;
    valorantId: string;
    role: string;
  }>;
  captainEmail: string;
  entryFee: number;
  logo?: string;
}

// Register a new team
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      teamName,
      players,
      captainEmail,
      entryFee,
      logo,
    } = req.body as TeamRegistrationData;

    // Validation
    if (!teamName || !players || !captainEmail || !entryFee) {
      res.status(400).json({
        error: 'Missing required fields: teamName, players, captainEmail, entryFee'
      });
      return;
    }

    if (players.length < 5 || players.length > 6) {
      res.status(400).json({
        error: 'Team must have 5-6 players'
      });
      return;
    }

    // Check if team name already exists
    const existingTeam = await getDB().collection('teams')
      .where('name', '==', teamName)
      .get();

    if (!existingTeam.empty) {
      res.status(400).json({
        error: 'Team name already exists'
      });
      return;
    }

    // Generate team ID
    const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create team document
    const teamData = {
      id: teamId,
      name: teamName,
      players,
      captainEmail,
      entryFee,
      logo: logo || null,
      status: 'pending',
      paymentStatus: 'pending',
      registeredAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await getDB().collection('teams').doc(teamId).set(teamData);

    res.status(201).json({
      success: true,
      team: teamData,
      message: 'Team registered successfully'
    });
  } catch (error) {
    console.error('Error registering team:', error);
    res.status(500).json({
      error: 'Failed to register team'
    });
  }
});

// Get all teams
router.get('/', async (req: Request, res: Response) => {
  try {
    const teamsSnapshot = await getDB().collection('teams')
      .orderBy('registeredAt', 'desc')
      .get();

    const teams = teamsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      teams,
      count: teams.length
    });
  } catch (error) {
    console.error('Error getting teams:', error);
    res.status(500).json({
      error: 'Failed to get teams'
    });
  }
});

// Get team by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const teamDoc = await getDB().collection('teams').doc(id).get();

    if (!teamDoc.exists) {
      res.status(404).json({
        error: 'Team not found'
      });
      return;
    }

    const team = teamDoc.data();
    res.json({
      success: true,
      team
    });
  } catch (error) {
    console.error('Error getting team:', error);
    res.status(500).json({
      error: 'Failed to get team'
    });
  }
});

// Update team status
router.put('/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      res.status(400).json({
        error: 'Invalid status. Must be: pending, approved, or rejected'
      });
      return;
    }

    await getDB().collection('teams').doc(id).update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: `Team status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating team status:', error);
    res.status(500).json({
      error: 'Failed to update team status'
    });
  }
});

// Update team payment status
router.put('/:id/payment-status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus || !['pending', 'paid', 'refunded'].includes(paymentStatus)) {
      res.status(400).json({
        error: 'Invalid payment status. Must be: pending, paid, or refunded'
      });
      return;
    }

    await getDB().collection('teams').doc(id).update({
      paymentStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: `Team payment status updated to ${paymentStatus}`
    });
  } catch (error) {
    console.error('Error updating team payment status:', error);
    res.status(500).json({
      error: 'Failed to update team payment status'
    });
  }
});

// Delete team
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if team exists
    const teamDoc = await getDB().collection('teams').doc(id).get();
    if (!teamDoc.exists) {
      res.status(404).json({
        error: 'Team not found'
      });
      return;
    }

    await getDB().collection('teams').doc(id).delete();

    res.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({
      error: 'Failed to delete team'
    });
  }
});

// Get teams by status
router.get('/status/:status', async (req: Request, res: Response) => {
  try {
    const { status } = req.params;

    const teamsSnapshot = await getDB().collection('teams')
      .where('status', '==', status)
      .orderBy('registeredAt', 'desc')
      .get();

    const teams = teamsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      teams,
      count: teams.length,
      status
    });
  } catch (error) {
    console.error('Error getting teams by status:', error);
    res.status(500).json({
      error: 'Failed to get teams by status'
    });
  }
});

export { router as teamRoutes };
