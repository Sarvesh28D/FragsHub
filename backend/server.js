const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin (from env vars if provided)
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  try {
    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });
    } else {
      admin.initializeApp();
    }
  } catch (e) {
    console.warn('Firebase Admin init warning:', e && e.message ? e.message : e);
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Mount compiled API routes if available
try {
  // Note: Routes require proper environment setup (Razorpay keys, etc.)
  // const { paymentRoutes } = require('./lib/routes/payment');
  // const { tournamentRoutes } = require('./lib/routes/tournament');
  // const { teamRoutes } = require('./lib/routes/team');
  // const { adminRoutes } = require('./lib/routes/admin');
  // app.use('/api/payments', paymentRoutes);
  // app.use('/api/tournaments', tournamentRoutes);
  // app.use('/api/teams', teamRoutes);
  // app.use('/api/admin', adminRoutes);
  console.log('API routes available but not mounted (requires env configuration)');
} catch (err) {
  console.warn('Routes not mounted (build may be missing):', err && err.message ? err.message : err);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    message: 'FragsHub Backend API is running!'
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'FragsHub API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      '/health',
  '/api/payments (coming soon)',
  '/api/tournaments (coming soon)', 
  '/api/teams (coming soon)',
  '/api/admin (coming soon)'
    ],
    note: 'Firebase Functions routes will be added after configuration'
  });
});

// Placeholder API routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'API endpoints ready for integration',
    backend: 'compiled and ready',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 FragsHub API Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🎮 Ready for esports tournaments!`);
});

module.exports = app;
