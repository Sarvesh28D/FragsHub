import { Router, Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest } from '../types';

const router = Router();
const db = admin.firestore();

// Middleware to check admin privileges
const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Missing or invalid authorization header'
      });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Check if user has admin role
    if (!decodedToken.admin) {
      res.status(403).json({
        error: 'Admin access required'
      });
      return;
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying admin token:', error);
    res.status(401).json({
      error: 'Invalid authentication token'
    });
  }
};

// Apply admin middleware to all routes
router.use(requireAdmin);

// Approve team registration
router.post('/teams/:teamId/approve', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    // Check if payment is completed
    if (team?.paymentStatus !== 'paid') {
      res.status(400).json({
        error: 'Team payment must be completed before approval'
      });
      return;
    }

    // Update team status
    await db.collection('teams').doc(teamId).update({
      registrationStatus: 'approved',
      approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      approvedBy: req.user?.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Add team to active tournament if exists
    const activeTournamentSnapshot = await db.collection('tournaments')
      .where('status', '==', 'upcoming')
      .limit(1)
      .get();

    if (!activeTournamentSnapshot.empty) {
      const tournament = activeTournamentSnapshot.docs[0];
      const tournamentData = tournament.data();
      
      // Check if tournament has space
      const currentTeams = tournamentData.teams || [];
      if (currentTeams.length < tournamentData.maxTeams) {
        // Add team to tournament (this would call the tournament API)
        // For now, just add to the teams array
        await tournament.ref.update({
          teams: admin.firestore.FieldValue.arrayUnion({
            teamId,
            name: team?.name,
            addedAt: new Date(),
          }),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    res.json({
      success: true,
      message: 'Team approved successfully'
    });
  } catch (error) {
    console.error('Error approving team:', error);
    res.status(500).json({
      error: 'Failed to approve team'
    });
  }
});

// Reject team registration
router.post('/teams/:teamId/reject', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { teamId } = req.params;
    const { reason } = req.body;

    const teamDoc = await db.collection('teams').doc(teamId).get();
    if (!teamDoc.exists) {
      res.status(404).json({
        error: 'Team not found'
      });
      return;
    }

    const team = teamDoc.data();

    // Update team status
    await db.collection('teams').doc(teamId).update({
      registrationStatus: 'rejected',
      rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
      rejectedBy: req.user?.uid,
      rejectionReason: reason || 'No reason provided',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Process refund if payment was completed
    if (team?.paymentStatus === 'paid' && team?.paymentId) {
      // This would trigger the refund process
      // For now, just mark it for refund processing
      await db.collection('refund_queue').add({
        teamId,
        paymentId: team.paymentId,
        amount: team.entryFee,
        reason: 'Team registration rejected',
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.json({
      success: true,
      message: 'Team rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting team:', error);
    res.status(500).json({
      error: 'Failed to reject team'
    });
  }
});

// Get admin dashboard data
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Get team statistics
    const teamsSnapshot = await db.collection('teams').get();
    const teamStats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      paid: 0,
      unpaid: 0,
    };

    teamsSnapshot.docs.forEach(doc => {
      const team = doc.data();
      teamStats.total++;
      
      if (team.registrationStatus === 'pending') teamStats.pending++;
      else if (team.registrationStatus === 'approved') teamStats.approved++;
      else if (team.registrationStatus === 'rejected') teamStats.rejected++;
      
      if (team.paymentStatus === 'paid') teamStats.paid++;
      else teamStats.unpaid++;
    });

    // Get tournament statistics
    const tournamentsSnapshot = await db.collection('tournaments').get();
    const tournamentStats = {
      total: tournamentsSnapshot.size,
      upcoming: 0,
      live: 0,
      completed: 0,
    };

    tournamentsSnapshot.docs.forEach(doc => {
      const tournament = doc.data();
      if (tournament.status === 'upcoming') tournamentStats.upcoming++;
      else if (tournament.status === 'live') tournamentStats.live++;
      else if (tournament.status === 'completed') tournamentStats.completed++;
    });

    // Get recent activity
    const recentTeams = await db.collection('teams')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const recentActivity = recentTeams.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      type: 'team_registration'
    }));

    res.json({
      success: true,
      dashboard: {
        teamStats,
        tournamentStats,
        recentActivity,
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard data'
    });
  }
});

// Get all pending teams for review
router.get('/teams/pending', async (req: Request, res: Response) => {
  try {
    const pendingTeamsSnapshot = await db.collection('teams')
      .where('registrationStatus', '==', 'pending')
      .orderBy('createdAt', 'asc')
      .get();

    const pendingTeams = pendingTeamsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      teams: pendingTeams
    });
  } catch (error) {
    console.error('Error fetching pending teams:', error);
    res.status(500).json({
      error: 'Failed to fetch pending teams'
    });
  }
});

// Update match result (admin only)
router.put('/tournaments/:tournamentId/matches/:matchId/result', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { tournamentId, matchId } = req.params;
    const { winnerId, scores, notes } = req.body;

    if (!winnerId) {
      res.status(400).json({
        error: 'winnerId is required'
      });
      return;
    }

    // Record match result in Firestore
    await db.collection('match_results').doc(`${tournamentId}_${matchId}`).set({
      tournamentId,
      matchId,
      winnerId,
      scores: scores || '',
      notes: notes || '',
      updatedBy: req.user?.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

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

// Grant admin privileges to user
router.post('/users/:userId/grant-admin', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Set custom claims
    await admin.auth().setCustomUserClaims(userId, { admin: true });

    // Update user document
    await db.collection('users').doc(userId).update({
      isAdmin: true,
      adminGrantedAt: admin.firestore.FieldValue.serverTimestamp(),
      adminGrantedBy: req.user?.uid,
    });

    res.json({
      success: true,
      message: 'Admin privileges granted successfully'
    });
  } catch (error) {
    console.error('Error granting admin privileges:', error);
    res.status(500).json({
      error: 'Failed to grant admin privileges'
    });
  }
});

// Revoke admin privileges from user
router.post('/users/:userId/revoke-admin', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Remove custom claims
    await admin.auth().setCustomUserClaims(userId, { admin: false });

    // Update user document
    await db.collection('users').doc(userId).update({
      isAdmin: false,
      adminRevokedAt: admin.firestore.FieldValue.serverTimestamp(),
      adminRevokedBy: req.user?.uid,
    });

    res.json({
      success: true,
      message: 'Admin privileges revoked successfully'
    });
  } catch (error) {
    console.error('Error revoking admin privileges:', error);
    res.status(500).json({
      error: 'Failed to revoke admin privileges'
    });
  }
});

export { router as adminRoutes };
