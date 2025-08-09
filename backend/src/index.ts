import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';

// Import route handlers
import { paymentRoutes } from './routes/payment';
import { tournamentRoutes } from './routes/tournament';
import { teamRoutes } from './routes/team';
import { adminRoutes } from './routes/admin';

// Initialize Firebase Admin
admin.initializeApp();

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Routes
app.use('/payments', paymentRoutes);
app.use('/tournaments', tournamentRoutes);
app.use('/teams', teamRoutes);
app.use('/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req: express.Request, res: express.Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Default route
app.get('/', (req: express.Request, res: express.Response) => {
  res.json({
    message: 'FragsHub API',
    version: '1.0.0',
    endpoints: [
      '/payments',
      '/tournaments',
      '/teams',
      '/admin',
      '/health'
    ]
  });
});

// Export the API as a Firebase Function
export const api = functions.https.onRequest(app);

// Firestore triggers
export { onTeamCreate, onPaymentComplete } from './triggers/firestore';

// Scheduled functions
export { cleanupExpiredPayments, generateTournamentBrackets } from './triggers/scheduled';
