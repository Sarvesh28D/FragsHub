import { setGlobalOptions } from "firebase-functions";
import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';

// Import route handlers
import { paymentRoutes } from './routes/payment.js';
import { tournamentRoutes } from './routes/tournament.js';
import { teamRoutes } from './routes/team.js';
import { adminRoutes } from './routes/admin.js';

// Initialize Firebase Admin
admin.initializeApp();

// Set global options for cost control
setGlobalOptions({ maxInstances: 10 });

const app = express();

// CORS configuration - allow your Vercel frontend
const corsOptions = {
  origin: [
    'https://fragshub.vercel.app',
    'http://localhost:3000', // for local development
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes - keeping the /api prefix for compatibility
app.use('/api/payments', paymentRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req: express.Request, res: express.Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    message: 'FragsHub Backend API is running!'
  });
});

// Default route
app.get('/', (req: express.Request, res: express.Response) => {
  res.json({
    message: 'FragsHub API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      '/health',
      '/api/payments',
      '/api/tournaments', 
      '/api/teams',
      '/api/admin'
    ]
  });
});

// Export the API as a Firebase Function v2
export const api = onRequest({
  cors: true,
  region: 'us-central1'
}, app);

// Firestore triggers
export const onTeamCreate = onDocumentCreated({
  document: 'teams/{teamId}',
  region: 'us-central1'
}, async (event) => {
  const { onTeamCreateHandler } = await import('./triggers/firestore.js');
  return onTeamCreateHandler(event.data, { params: event.params });
});

export const onPaymentComplete = onDocumentUpdated({
  document: 'payments/{paymentId}',
  region: 'us-central1'
}, async (event) => {
  const { onPaymentCompleteHandler } = await import('./triggers/firestore.js');
  return onPaymentCompleteHandler(event, { params: event.params });
});

// Scheduled functions
export const cleanupExpiredPayments = onSchedule({
  schedule: 'every 24 hours',
  region: 'us-central1'
}, async (event) => {
  const { cleanupExpiredPaymentsHandler } = await import('./triggers/scheduled.js');
  return cleanupExpiredPaymentsHandler();
});

export const generateTournamentBrackets = onSchedule({
  schedule: 'every 1 hours',
  region: 'us-central1'
}, async (event) => {
  const { generateTournamentBracketsHandler } = await import('./triggers/scheduled.js');
  return generateTournamentBracketsHandler();
});
