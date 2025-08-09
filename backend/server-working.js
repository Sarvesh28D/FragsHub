const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// CORS configuration
const corsOptions = {
  origin: [
    'https://fragshub-frontend-rgv41gwie-sarvesh-daymas-projects.vercel.app',
    process.env.FRONTEND_URL || 'https://fragshub.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'FragsHub API',
    version: '1.0.0',
    description: 'FragsHub Esports Platform Backend API',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: '/api',
      teams: '/api/teams',
      tournaments: '/api/tournaments',
      payments: '/api/payments',
      admin: '/api/admin'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    message: 'FragsHub Backend is running!'
  });
});

// API test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'FragsHub API is working!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Basic team endpoints
app.get('/api/teams', (req, res) => {
  res.json({
    message: 'Teams endpoint working',
    teams: [],
    timestamp: new Date().toISOString()
  });
});

app.get('/api/teams/stats/overview', (req, res) => {
  res.json({
    message: 'Team stats endpoint working',
    stats: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      paid: 0,
      unpaid: 0
    },
    timestamp: new Date().toISOString()
  });
});

// Basic payment endpoints
app.get('/api/payments', (req, res) => {
  res.json({
    message: 'Payments endpoint working',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/payments/create-order', (req, res) => {
  res.json({
    message: 'Payment order endpoint working',
    timestamp: new Date().toISOString()
  });
});

// Basic tournament endpoints
app.get('/api/tournaments', (req, res) => {
  res.json({
    message: 'Tournaments endpoint working',
    tournaments: [],
    timestamp: new Date().toISOString()
  });
});

app.get('/api/tournaments/active', (req, res) => {
  res.json({
    message: 'Active tournaments endpoint working',
    tournaments: [],
    timestamp: new Date().toISOString()
  });
});

// Basic admin endpoints
app.get('/api/admin/dashboard', (req, res) => {
  res.json({
    message: 'Admin dashboard endpoint working',
    dashboard: {},
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FragsHub Backend server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API test: http://localhost:${PORT}/api/test`);
  console.log(`👥 Teams: http://localhost:${PORT}/api/teams`);
  console.log(`💳 Payments: http://localhost:${PORT}/api/payments`);
  console.log(`🏆 Tournaments: http://localhost:${PORT}/api/tournaments`);
  console.log(`⚙️  Admin: http://localhost:${PORT}/api/admin/dashboard`);
  console.log(`🌐 CORS enabled for: ${corsOptions.origin.join(', ')}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});

module.exports = app;
