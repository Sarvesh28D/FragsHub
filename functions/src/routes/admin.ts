import express, { Request, Response } from 'express';
import * as admin from 'firebase-admin';

const router = express.Router();

// Get firestore instance (will be available after admin.initializeApp() is called)
const getDB = () => admin.firestore();

// Verify admin access middleware
const verifyAdmin = async (req: Request, res: Response, next: any): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Check if user has admin claim
    if (!decodedToken.admin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    (req as any).user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying admin token:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get dashboard stats
router.get('/dashboard', verifyAdmin, async (req: Request, res: Response) => {
  try {
    // Get teams count by status
    const teamsSnapshot = await getDB().collection('teams').get();
    const teams = teamsSnapshot.docs.map(doc => doc.data());
    
    const teamStats = {
      total: teams.length,
      pending: teams.filter(team => team.status === 'pending').length,
      approved: teams.filter(team => team.status === 'approved').length,
      rejected: teams.filter(team => team.status === 'rejected').length,
    };

    // Get payment stats
    const paymentsSnapshot = await getDB().collection('payments').get();
    const payments = paymentsSnapshot.docs.map(doc => doc.data());
    
    const paymentStats = {
      total: payments.length,
      completed: payments.filter(payment => payment.status === 'captured').length,
      pending: payments.filter(payment => payment.status === 'created').length,
      failed: payments.filter(payment => payment.status === 'failed').length,
      totalAmount: payments
        .filter(payment => payment.status === 'captured')
        .reduce((sum, payment) => sum + (payment.amount || 0), 0),
    };

    // Get tournaments count
    const tournamentsSnapshot = await getDB().collection('tournaments').get();
    const tournamentStats = {
      total: tournamentsSnapshot.size,
      active: 0, // Will be calculated based on tournament dates
      completed: 0,
    };

    res.json({
      success: true,
      dashboard: {
        teams: teamStats,
        payments: paymentStats,
        tournaments: tournamentStats,
        lastUpdated: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      error: 'Failed to get dashboard stats'
    });
  }
});

// Set admin claim for user
router.post('/users/:uid/admin', verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { uid } = req.params;
    const { isAdmin } = req.body;

    await admin.auth().setCustomUserClaims(uid, {
      admin: Boolean(isAdmin)
    });

    res.json({
      success: true,
      message: `Admin claim ${isAdmin ? 'granted' : 'revoked'} for user ${uid}`
    });
  } catch (error) {
    console.error('Error setting admin claim:', error);
    res.status(500).json({
      error: 'Failed to set admin claim'
    });
  }
});

// Get all users with admin info
router.get('/users', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const listUsersResult = await admin.auth().listUsers();
    
    const users = listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      disabled: user.disabled,
      emailVerified: user.emailVerified,
      customClaims: user.customClaims,
      creationTime: user.metadata.creationTime,
      lastSignInTime: user.metadata.lastSignInTime,
    }));

    res.json({
      success: true,
      users,
      count: users.length
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      error: 'Failed to get users'
    });
  }
});

// Approve team
router.post('/teams/:id/approve', verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await getDB().collection('teams').doc(id).update({
      status: 'approved',
      approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

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

// Reject team
router.post('/teams/:id/reject', verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    await getDB().collection('teams').doc(id).update({
      status: 'rejected',
      rejectionReason: reason || 'No reason provided',
      rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

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

// Get payment details
router.get('/payments/:id', verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const paymentDoc = await getDB().collection('payments').doc(id).get();

    if (!paymentDoc.exists) {
      res.status(404).json({
        error: 'Payment not found'
      });
      return;
    }

    const payment = paymentDoc.data();
    res.json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Error getting payment:', error);
    res.status(500).json({
      error: 'Failed to get payment'
    });
  }
});

// Process refund
router.post('/payments/:id/refund', verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    // Get payment details
    const paymentDoc = await getDB().collection('payments').doc(id).get();
    if (!paymentDoc.exists) {
      res.status(404).json({
        error: 'Payment not found'
      });
      return;
    }

    const payment = paymentDoc.data();
    
    // Create refund record
    const refundData = {
      paymentId: id,
      originalAmount: payment?.amount,
      refundAmount: amount || payment?.amount,
      reason: reason || 'Admin refund',
      status: 'processed',
      processedBy: (req as any).user.uid,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await getDB().collection('refunds').add(refundData);

    // Update payment status
    await getDB().collection('payments').doc(id).update({
      status: 'refunded',
      refundedAt: admin.firestore.FieldValue.serverTimestamp(),
      refundAmount: amount || payment?.amount,
      refundReason: reason || 'Admin refund',
    });

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refund: refundData
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      error: 'Failed to process refund'
    });
  }
});

// Send announcement
router.post('/announcements', verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, message, type, targetAudience } = req.body;

    if (!title || !message) {
      res.status(400).json({
        error: 'Title and message are required'
      });
      return;
    }

    const announcementData = {
      title,
      message,
      type: type || 'general',
      targetAudience: targetAudience || 'all',
      createdBy: (req as any).user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
    };

    const docRef = await getDB().collection('announcements').add(announcementData);

    res.json({
      success: true,
      message: 'Announcement created successfully',
      announcementId: docRef.id
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({
      error: 'Failed to create announcement'
    });
  }
});

// System settings
router.get('/settings', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const settingsDoc = await getDB().collection('settings').doc('system').get();
    
    let settings = {};
    if (settingsDoc.exists) {
      settings = settingsDoc.data() || {};
    }

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({
      error: 'Failed to get settings'
    });
  }
});

// Update system settings
router.put('/settings', verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = req.body;

    await getDB().collection('settings').doc('system').set({
      ...settings,
      updatedBy: (req as any).user.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      error: 'Failed to update settings'
    });
  }
});

export { router as adminRoutes };
