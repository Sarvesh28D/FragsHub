import express, { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { TeamRegistrationData } from '../types';

const router = express.Router();
const db = admin.firestore();

// Register a new team
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      teamName,
      players,
      captainEmail,
      entryFee,
      logo,
    } = req.body;

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
    const existingTeam = await db.collection('teams')
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
      players: players.map((player: any, index: number) => ({
        name: player.name,
        role: player.role || '',
        isCaptain: index === 0, // First player is captain
      })),
      captainEmail,
      entryFee,
      logo: logo || '',
      paymentStatus: 'pending',
      registrationStatus: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('teams').doc(teamId).set(teamData);

    res.status(201).json({
      success: true,
      teamId,
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

// Get team by ID
router.get('/:teamId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { teamId } = req.params;

    const teamDoc = await db.collection('teams').doc(teamId).get();

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
    console.error('Error fetching team:', error);
    res.status(500).json({
      error: 'Failed to fetch team'
    });
  }
});

// Get all teams with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      status,
      paymentStatus,
      limit = '50',
      offset = '0'
    } = req.query;

    let query = db.collection('teams') as any;

    // Apply filters
    if (status) {
      query = query.where('registrationStatus', '==', status);
    }

    if (paymentStatus) {
      query = query.where('paymentStatus', '==', paymentStatus);
    }

    // Apply pagination
    query = query
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    const snapshot = await query.get();
    const teams = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      teams,
      total: teams.length
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({
      error: 'Failed to fetch teams'
    });
  }
});

// Update team
router.put('/:teamId', async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.createdAt;
    delete updates.paymentStatus; // Only updated through payment flow
    
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await db.collection('teams').doc(teamId).update(updates);

    res.json({
      success: true,
      message: 'Team updated successfully'
    });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({
      error: 'Failed to update team'
    });
  }
});

// Delete team
router.delete('/:teamId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { teamId } = req.params;

    // Check if team exists
    const teamDoc = await db.collection('teams').doc(teamId).get();
    if (!teamDoc.exists) {
      res.status(404).json({
        error: 'Team not found'
      });
      return;
    }

    const team = teamDoc.data();

    // Don't allow deletion if payment is completed
    if (team?.paymentStatus === 'paid') {
      res.status(400).json({
        error: 'Cannot delete team with completed payment. Process refund first.'
      });
      return;
    }

    await db.collection('teams').doc(teamId).delete();

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

// Get team statistics
router.get('/stats/overview', async (req: Request, res: Response) => {
  try {
    const teamsSnapshot = await db.collection('teams').get();
    
    const stats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      paid: 0,
      unpaid: 0,
    };

    teamsSnapshot.docs.forEach(doc => {
      const team = doc.data();
      stats.total++;
      
      // Registration status
      if (team.registrationStatus === 'pending') stats.pending++;
      else if (team.registrationStatus === 'approved') stats.approved++;
      else if (team.registrationStatus === 'rejected') stats.rejected++;
      
      // Payment status
      if (team.paymentStatus === 'paid') stats.paid++;
      else stats.unpaid++;
    });

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching team stats:', error);
    res.status(500).json({
      error: 'Failed to fetch team statistics'
    });
  }
});

export { router as teamRoutes };
