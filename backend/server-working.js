const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: [
    'https://fragshub-frontend-rgv41gwie-sarvesh-daymas-projects.vercel.app',
    process.env.FRONTEND_URL || 'https://fragshub.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:8080'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// In-memory data store (production should use real database)
let mockData = {
  teams: [
    {
      id: 'team_1',
      name: 'Team Alpha',
      tag: 'ALPH',
      game: 'VALORANT',
      captain: 'user_1',
      members: ['user_1', 'user_2', 'user_3', 'user_4', 'user_5'],
      wins: 12,
      tournaments: 5,
      earnings: 25000,
      paymentStatus: 'paid',
      status: 'approved',
      createdAt: '2024-01-15T10:00:00Z',
      description: 'Professional VALORANT team with 2+ years experience'
    },
    {
      id: 'team_2',
      name: 'Cyber Warriors',
      tag: 'CYBR',
      game: 'CS2',
      captain: 'user_6',
      members: ['user_6', 'user_7', 'user_8', 'user_9', 'user_10'],
      wins: 8,
      tournaments: 3,
      earnings: 15000,
      paymentStatus: 'pending',
      status: 'pending',
      createdAt: '2024-01-20T14:30:00Z',
      description: 'Competitive CS2 team looking for tournament victories'
    },
    {
      id: 'team_3',
      name: 'Elite Esports',
      tag: 'ELIT',
      game: 'PUBG',
      captain: 'user_11',
      members: ['user_11', 'user_12', 'user_13', 'user_14'],
      wins: 15,
      tournaments: 7,
      earnings: 35000,
      paymentStatus: 'paid',
      status: 'approved',
      createdAt: '2024-01-10T09:15:00Z',
      description: 'Top PUBG Mobile squad with multiple championship wins'
    }
  ],
  tournaments: [
    {
      id: 'tournament_1',
      name: 'VALORANT Champions Cup 2024',
      game: 'VALORANT',
      prizePool: '₹50,000',
      teams: 16,
      maxTeams: 32,
      status: 'active',
      date: '2024-02-15T18:00:00Z',
      registrationFee: 500,
      winner: null
    },
    {
      id: 'tournament_2',
      name: 'CS2 Winter Championship',
      game: 'CS2',
      prizePool: '₹75,000',
      teams: 12,
      maxTeams: 24,
      status: 'active',
      date: '2024-02-20T16:00:00Z',
      registrationFee: 750,
      winner: null
    },
    {
      id: 'tournament_3',
      name: 'PUBG Mobile Masters',
      game: 'PUBG',
      prizePool: '₹100,000',
      teams: 20,
      maxTeams: 40,
      status: 'upcoming',
      date: '2024-03-01T19:00:00Z',
      registrationFee: 1000,
      winner: null
    }
  ],
  payments: [
    {
      id: 'payment_1',
      teamId: 'team_1',
      tournamentId: 'tournament_1',
      amount: 500,
      status: 'completed',
      timestamp: '2024-01-15T11:30:00Z',
      paymentMethod: 'razorpay',
      transactionId: 'txn_1234567890'
    },
    {
      id: 'payment_2',
      teamId: 'team_3',
      tournamentId: 'tournament_3',
      amount: 1000,
      status: 'completed',
      timestamp: '2024-01-22T15:45:00Z',
      paymentMethod: 'razorpay',
      transactionId: 'txn_0987654321'
    }
  ],
  users: [
    { id: 'user_1', name: 'ProGamer123', email: 'progamer@example.com', role: 'user' },
    { id: 'user_2', name: 'EliteShooter', email: 'elite@example.com', role: 'user' },
    { id: 'admin_1', name: 'Admin User', email: 'admin@fragshub.com', role: 'admin' }
  ]
};

// Google Sheets API configuration
let googleSheetsAuth = null;
let sheetsService = null;

// Initialize Google Sheets API
async function initializeGoogleSheets() {
  try {
    // For production, use service account credentials
    if (process.env.GOOGLE_SHEETS_CREDENTIALS) {
      const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
      googleSheetsAuth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });
    } else {
      // For development, create mock credentials
      console.log('📊 Google Sheets: Using mock credentials for development');
      googleSheetsAuth = 'mock';
    }
    
    if (googleSheetsAuth !== 'mock') {
      sheetsService = google.sheets({ version: 'v4', auth: googleSheetsAuth });
    }
    
    console.log('📊 Google Sheets API initialized successfully');
  } catch (error) {
    console.error('❌ Google Sheets API initialization failed:', error.message);
    googleSheetsAuth = 'mock';
  }
}

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
  try {
    const { status, game, paymentStatus } = req.query;
    let filteredTeams = [...mockData.teams];
    
    if (status) {
      filteredTeams = filteredTeams.filter(team => team.status === status);
    }
    
    if (game) {
      filteredTeams = filteredTeams.filter(team => team.game === game);
    }
    
    if (paymentStatus) {
      filteredTeams = filteredTeams.filter(team => team.paymentStatus === paymentStatus);
    }
    
    res.json({
      success: true,
      teams: filteredTeams,
      total: filteredTeams.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch teams',
      message: error.message
    });
  }
});

app.post('/api/teams', (req, res) => {
  try {
    const { name, tag, game, description, captain, members } = req.body;
    
    if (!name || !tag || !game || !captain) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['name', 'tag', 'game', 'captain']
      });
    }
    
    const newTeam = {
      id: `team_${Date.now()}`,
      name,
      tag: tag.toUpperCase(),
      game,
      description: description || '',
      captain,
      members: members || [captain],
      wins: 0,
      tournaments: 0,
      earnings: 0,
      paymentStatus: 'pending',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    mockData.teams.push(newTeam);
    
    res.status(201).json({
      success: true,
      team: newTeam,
      message: 'Team created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create team',
      message: error.message
    });
  }
});

app.put('/api/teams/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const teamIndex = mockData.teams.findIndex(team => team.id === id);
    if (teamIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }
    
    mockData.teams[teamIndex] = {
      ...mockData.teams[teamIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      team: mockData.teams[teamIndex],
      message: 'Team updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update team',
      message: error.message
    });
  }
});

app.get('/api/teams/stats/overview', (req, res) => {
  try {
    const stats = {
      total: mockData.teams.length,
      pending: mockData.teams.filter(t => t.status === 'pending').length,
      approved: mockData.teams.filter(t => t.status === 'approved').length,
      rejected: mockData.teams.filter(t => t.status === 'rejected').length,
      paid: mockData.teams.filter(t => t.paymentStatus === 'paid').length,
      unpaid: mockData.teams.filter(t => t.paymentStatus === 'pending').length,
      totalEarnings: mockData.teams.reduce((sum, team) => sum + (team.earnings || 0), 0),
      gameDistribution: {}
    };
    
    // Calculate game distribution
    mockData.teams.forEach(team => {
      stats.gameDistribution[team.game] = (stats.gameDistribution[team.game] || 0) + 1;
    });
    
    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch team stats',
      message: error.message
    });
  }
});

// Google Sheets Export Endpoints
app.post('/api/teams/export/google-sheets', async (req, res) => {
  try {
    const { spreadsheetId, sheetName = 'Teams Data' } = req.body;
    
    if (!spreadsheetId) {
      return res.status(400).json({
        success: false,
        error: 'Spreadsheet ID is required'
      });
    }
    
    const exportData = await exportTeamsToGoogleSheets(spreadsheetId, sheetName);
    
    res.json({
      success: true,
      message: 'Teams data exported to Google Sheets successfully',
      exportData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to export to Google Sheets',
      message: error.message
    });
  }
});

app.get('/api/teams/export/csv', (req, res) => {
  try {
    const csvData = generateTeamsCSV();
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="fragshub-teams.csv"');
    res.send(csvData);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate CSV',
      message: error.message
    });
  }
});

// Enhanced payment endpoints
app.get('/api/payments', (req, res) => {
  try {
    const { status, teamId, tournamentId } = req.query;
    let filteredPayments = [...mockData.payments];
    
    if (status) {
      filteredPayments = filteredPayments.filter(payment => payment.status === status);
    }
    
    if (teamId) {
      filteredPayments = filteredPayments.filter(payment => payment.teamId === teamId);
    }
    
    if (tournamentId) {
      filteredPayments = filteredPayments.filter(payment => payment.tournamentId === tournamentId);
    }
    
    res.json({
      success: true,
      payments: filteredPayments,
      total: filteredPayments.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payments',
      message: error.message
    });
  }
});

app.post('/api/payments/create-order', (req, res) => {
  try {
    const { teamId, tournamentId, amount } = req.body;
    
    if (!teamId || !tournamentId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['teamId', 'tournamentId', 'amount']
      });
    }
    
    // Mock Razorpay order creation
    const orderId = `order_${Date.now()}`;
    const order = {
      id: orderId,
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${teamId}_${tournamentId}`,
      status: 'created',
      created_at: Math.floor(Date.now() / 1000)
    };
    
    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key',
      message: 'Payment order created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create payment order',
      message: error.message
    });
  }
});

app.post('/api/payments/verify', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, teamId, tournamentId } = req.body;
    
    // Mock payment verification (in production, verify with Razorpay)
    const isValid = razorpay_payment_id && razorpay_signature;
    
    if (isValid) {
      const payment = {
        id: `payment_${Date.now()}`,
        teamId,
        tournamentId,
        amount: 500, // Default amount
        status: 'completed',
        timestamp: new Date().toISOString(),
        paymentMethod: 'razorpay',
        transactionId: razorpay_payment_id,
        orderId: razorpay_order_id
      };
      
      mockData.payments.push(payment);
      
      // Update team payment status
      const team = mockData.teams.find(t => t.id === teamId);
      if (team) {
        team.paymentStatus = 'paid';
        team.status = 'approved';
      }
      
      res.json({
        success: true,
        payment,
        message: 'Payment verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment verification failed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Payment verification error',
      message: error.message
    });
  }
});

// Enhanced tournament endpoints
app.get('/api/tournaments', (req, res) => {
  try {
    const { status, game } = req.query;
    let filteredTournaments = [...mockData.tournaments];
    
    if (status) {
      filteredTournaments = filteredTournaments.filter(tournament => tournament.status === status);
    }
    
    if (game) {
      filteredTournaments = filteredTournaments.filter(tournament => tournament.game === game);
    }
    
    res.json({
      success: true,
      tournaments: filteredTournaments,
      total: filteredTournaments.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tournaments',
      message: error.message
    });
  }
});

app.get('/api/tournaments/active', (req, res) => {
  try {
    const activeTournaments = mockData.tournaments.filter(t => t.status === 'active');
    
    res.json({
      success: true,
      tournaments: activeTournaments,
      total: activeTournaments.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active tournaments',
      message: error.message
    });
  }
});

app.post('/api/tournaments', (req, res) => {
  try {
    const { name, game, prizePool, maxTeams, date, registrationFee } = req.body;
    
    if (!name || !game || !prizePool || !maxTeams || !date) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['name', 'game', 'prizePool', 'maxTeams', 'date']
      });
    }
    
    const newTournament = {
      id: `tournament_${Date.now()}`,
      name,
      game,
      prizePool,
      teams: 0,
      maxTeams,
      status: 'upcoming',
      date,
      registrationFee: registrationFee || 500,
      winner: null,
      createdAt: new Date().toISOString()
    };
    
    mockData.tournaments.push(newTournament);
    
    res.status(201).json({
      success: true,
      tournament: newTournament,
      message: 'Tournament created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create tournament',
      message: error.message
    });
  }
});

app.put('/api/tournaments/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const tournamentIndex = mockData.tournaments.findIndex(tournament => tournament.id === id);
    if (tournamentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Tournament not found'
      });
    }
    
    mockData.tournaments[tournamentIndex] = {
      ...mockData.tournaments[tournamentIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      tournament: mockData.tournaments[tournamentIndex],
      message: 'Tournament updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update tournament',
      message: error.message
    });
  }
});

// Enhanced admin endpoints
app.get('/api/admin/dashboard', (req, res) => {
  try {
    const dashboard = {
      stats: {
        totalTeams: mockData.teams.length,
        totalTournaments: mockData.tournaments.length,
        totalPayments: mockData.payments.length,
        totalRevenue: mockData.payments
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0),
        pendingTeams: mockData.teams.filter(t => t.status === 'pending').length,
        activeTournaments: mockData.tournaments.filter(t => t.status === 'active').length
      },
      recentActivity: [
        { type: 'team_registration', message: 'New team "Team Alpha" registered', timestamp: new Date().toISOString() },
        { type: 'payment', message: 'Payment completed for tournament registration', timestamp: new Date().toISOString() },
        { type: 'tournament', message: 'Tournament "VALORANT Cup" started', timestamp: new Date().toISOString() }
      ],
      gameDistribution: {},
      paymentTrends: generatePaymentTrends()
    };
    
    // Calculate game distribution
    mockData.teams.forEach(team => {
      dashboard.gameDistribution[team.game] = (dashboard.gameDistribution[team.game] || 0) + 1;
    });
    
    res.json({
      success: true,
      dashboard,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin dashboard',
      message: error.message
    });
  }
});

app.get('/api/admin/teams', (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let filteredTeams = [...mockData.teams];
    
    if (status) {
      filteredTeams = filteredTeams.filter(team => team.status === status);
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTeams = filteredTeams.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      teams: paginatedTeams,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredTeams.length,
        totalPages: Math.ceil(filteredTeams.length / limit)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin teams',
      message: error.message
    });
  }
});

app.put('/api/admin/teams/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
        validStatuses: ['pending', 'approved', 'rejected']
      });
    }
    
    const team = mockData.teams.find(t => t.id === id);
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }
    
    team.status = status;
    team.updatedAt = new Date().toISOString();
    
    res.json({
      success: true,
      team,
      message: `Team status updated to ${status}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update team status',
      message: error.message
    });
  }
});

// Helper function for payment trends
function generatePaymentTrends() {
  const trends = [];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    trends.push({
      date: date.toISOString().split('T')[0],
      amount: Math.floor(Math.random() * 5000) + 1000 // Mock data
    });
  }
  
  return trends;
}

// Google Sheets Export Functions
async function exportTeamsToGoogleSheets(spreadsheetId, sheetName = 'Teams Data') {
  try {
    if (googleSheetsAuth === 'mock') {
      // Return mock data for development
      return {
        spreadsheetId,
        sheetName,
        totalRows: mockData.teams.length + 1, // +1 for header
        exported: mockData.teams.length,
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=0`
      };
    }

    // Prepare data for Google Sheets
    const headers = [
      'Team ID',
      'Team Name',
      'Tag',
      'Game',
      'Captain',
      'Members Count',
      'Members',
      'Wins',
      'Tournaments',
      'Earnings (₹)',
      'Payment Status',
      'Team Status',
      'Created Date',
      'Description'
    ];

    const rows = mockData.teams.map(team => [
      team.id,
      team.name,
      team.tag,
      team.game,
      team.captain,
      team.members.length,
      team.members.join(', '),
      team.wins || 0,
      team.tournaments || 0,
      team.earnings || 0,
      team.paymentStatus,
      team.status,
      new Date(team.createdAt).toLocaleDateString(),
      team.description || ''
    ]);

    const values = [headers, ...rows];

    // Create or update the sheet
    const request = {
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      resource: {
        values
      }
    };

    const response = await sheetsService.spreadsheets.values.update(request);

    return {
      spreadsheetId,
      sheetName,
      totalRows: values.length,
      exported: rows.length,
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=0`,
      response: response.data
    };
  } catch (error) {
    console.error('Google Sheets export error:', error);
    throw new Error(`Failed to export to Google Sheets: ${error.message}`);
  }
}

function generateTeamsCSV() {
  const headers = [
    'Team ID',
    'Team Name',
    'Tag',
    'Game',
    'Captain',
    'Members Count',
    'Members',
    'Wins',
    'Tournaments',
    'Earnings',
    'Payment Status',
    'Team Status',
    'Created Date',
    'Description'
  ];

  const csvRows = [headers.join(',')];

  mockData.teams.forEach(team => {
    const row = [
      team.id,
      `"${team.name}"`,
      team.tag,
      team.game,
      team.captain,
      team.members.length,
      `"${team.members.join(', ')}"`,
      team.wins || 0,
      team.tournaments || 0,
      team.earnings || 0,
      team.paymentStatus,
      team.status,
      new Date(team.createdAt).toLocaleDateString(),
      `"${team.description || ''}"`
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

// Additional export endpoints
app.post('/api/export/tournaments/google-sheets', async (req, res) => {
  try {
    const { spreadsheetId, sheetName = 'Tournaments Data' } = req.body;
    
    if (!spreadsheetId) {
      return res.status(400).json({
        success: false,
        error: 'Spreadsheet ID is required'
      });
    }

    if (googleSheetsAuth === 'mock') {
      return res.json({
        success: true,
        message: 'Tournaments data exported to Google Sheets successfully (Mock)',
        exportData: {
          spreadsheetId,
          sheetName,
          totalRows: mockData.tournaments.length + 1,
          exported: mockData.tournaments.length,
          url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=0`
        }
      });
    }

    const headers = [
      'Tournament ID',
      'Name',
      'Game',
      'Prize Pool',
      'Teams Registered',
      'Max Teams',
      'Status',
      'Date',
      'Registration Fee',
      'Winner'
    ];

    const rows = mockData.tournaments.map(tournament => [
      tournament.id,
      tournament.name,
      tournament.game,
      tournament.prizePool,
      tournament.teams,
      tournament.maxTeams,
      tournament.status,
      new Date(tournament.date).toLocaleDateString(),
      tournament.registrationFee,
      tournament.winner || 'TBD'
    ]);

    const values = [headers, ...rows];

    const request = {
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      resource: {
        values
      }
    };

    const response = await sheetsService.spreadsheets.values.update(request);

    res.json({
      success: true,
      message: 'Tournaments data exported to Google Sheets successfully',
      exportData: {
        spreadsheetId,
        sheetName,
        totalRows: values.length,
        exported: rows.length,
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=0`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to export tournaments to Google Sheets',
      message: error.message
    });
  }
});

app.post('/api/export/payments/google-sheets', async (req, res) => {
  try {
    const { spreadsheetId, sheetName = 'Payments Data' } = req.body;
    
    if (!spreadsheetId) {
      return res.status(400).json({
        success: false,
        error: 'Spreadsheet ID is required'
      });
    }

    if (googleSheetsAuth === 'mock') {
      return res.json({
        success: true,
        message: 'Payments data exported to Google Sheets successfully (Mock)',
        exportData: {
          spreadsheetId,
          sheetName,
          totalRows: mockData.payments.length + 1,
          exported: mockData.payments.length,
          url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=0`
        }
      });
    }

    const headers = [
      'Payment ID',
      'Team ID',
      'Tournament ID',
      'Amount (₹)',
      'Status',
      'Payment Method',
      'Transaction ID',
      'Date'
    ];

    const rows = mockData.payments.map(payment => [
      payment.id,
      payment.teamId,
      payment.tournamentId,
      payment.amount,
      payment.status,
      payment.paymentMethod,
      payment.transactionId,
      new Date(payment.timestamp).toLocaleDateString()
    ]);

    const values = [headers, ...rows];

    const request = {
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      resource: {
        values
      }
    };

    const response = await sheetsService.spreadsheets.values.update(request);

    res.json({
      success: true,
      message: 'Payments data exported to Google Sheets successfully',
      exportData: {
        spreadsheetId,
        sheetName,
        totalRows: values.length,
        exported: rows.length,
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=0`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to export payments to Google Sheets',
      message: error.message
    });
  }
});

// Bulk export endpoint
app.post('/api/export/all/google-sheets', async (req, res) => {
  try {
    const { spreadsheetId } = req.body;
    
    if (!spreadsheetId) {
      return res.status(400).json({
        success: false,
        error: 'Spreadsheet ID is required'
      });
    }

    const exports = [];

    // Export teams
    try {
      const teamsExport = await exportTeamsToGoogleSheets(spreadsheetId, 'Teams');
      exports.push({ type: 'teams', ...teamsExport });
    } catch (error) {
      exports.push({ type: 'teams', error: error.message });
    }

    // Mock exports for tournaments and payments
    if (googleSheetsAuth === 'mock') {
      exports.push({
        type: 'tournaments',
        spreadsheetId,
        sheetName: 'Tournaments',
        exported: mockData.tournaments.length
      });
      exports.push({
        type: 'payments',
        spreadsheetId,
        sheetName: 'Payments',
        exported: mockData.payments.length
      });
    }

    res.json({
      success: true,
      message: 'All data exported to Google Sheets successfully',
      exports,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to export all data to Google Sheets',
      message: error.message
    });
  }
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

// Initialize Google Sheets API on startup
initializeGoogleSheets();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FragsHub Backend server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API test: http://localhost:${PORT}/api/test`);
  console.log(`👥 Teams: http://localhost:${PORT}/api/teams`);
  console.log(`💳 Payments: http://localhost:${PORT}/api/payments`);
  console.log(`🏆 Tournaments: http://localhost:${PORT}/api/tournaments`);
  console.log(`⚙️  Admin: http://localhost:${PORT}/api/admin/dashboard`);
  console.log(`📈 Google Sheets Export: http://localhost:${PORT}/api/teams/export/google-sheets`);
  console.log(`📋 CSV Export: http://localhost:${PORT}/api/teams/export/csv`);
  console.log(`🌐 CORS enabled for: ${corsOptions.origin.join(', ')}`);
  console.log(`📊 Sample data loaded: ${mockData.teams.length} teams, ${mockData.tournaments.length} tournaments, ${mockData.payments.length} payments`);
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
