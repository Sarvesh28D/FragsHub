"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const admin = __importStar(require("firebase-admin"));
const dotenv_1 = __importDefault(require("dotenv"));
const node_cron_1 = __importDefault(require("node-cron"));
// Load environment variables
dotenv_1.default.config();
// Import scheduled job handlers
// import { cleanupExpiredPaymentsHandler, generateTournamentBracketsHandler } from './jobs/scheduled';
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
// Initialize Firebase Admin SDK
const initializeFirebase = () => {
    var _a;
    try {
        if (!admin.apps.length) {
            const serviceAccount = {
                type: "service_account",
                project_id: process.env.FIREBASE_PROJECT_ID,
                private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
                private_key: (_a = process.env.FIREBASE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n'),
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                client_id: process.env.FIREBASE_CLIENT_ID,
                auth_uri: "https://accounts.google.com/o/oauth2/auth",
                token_uri: "https://oauth2.googleapis.com/token",
                auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
                client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
            };
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: process.env.FIREBASE_PROJECT_ID
            });
            console.log('Firebase Admin SDK initialized successfully');
        }
    }
    catch (error) {
        console.error('Error initializing Firebase Admin SDK:', error);
    }
};
// Initialize Firebase first
initializeFirebase();
// Import routes AFTER Firebase initialization
// import { paymentRoutes } from './routes/payment.js';
// import { tournamentRoutes } from './routes/tournament.js';
// import { teamRoutes } from './routes/team.js';
// import { adminRoutes } from './routes/admin.js';
// CORS configuration
const corsOptions = {
    origin: [
        process.env.FRONTEND_URL || 'https://fragshub.vercel.app',
        'http://localhost:3000', // for local development
        'http://localhost:3001'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
// Middleware
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Routes (temporarily commented out)
// app.use('/api/payments', paymentRoutes);
// app.use('/api/tournaments', tournamentRoutes);
// app.use('/api/teams', teamRoutes);
// app.use('/api/admin', adminRoutes);
// Health check endpoints
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
app.get('/', (req, res) => {
    res.json({
        message: 'FragsHub API Server',
        version: '2.0.0',
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
// Scheduled jobs using node-cron
// Cleanup expired payments every hour
node_cron_1.default.schedule('0 * * * *', async () => {
    console.log('Running scheduled job: cleanup expired payments');
    try {
        // await cleanupExpiredPaymentsHandler();
    }
    catch (error) {
        console.error('Error in cleanup expired payments job:', error);
    }
});
// Generate tournament brackets daily at 9 AM
node_cron_1.default.schedule('0 9 * * *', async () => {
    console.log('Running scheduled job: generate tournament brackets');
    try {
        // await generateTournamentBracketsHandler();
    }
    catch (error) {
        console.error('Error in generate tournament brackets job:', error);
    }
});
// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: `Route ${req.originalUrl} not found`
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 FragsHub API Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
exports.default = app;
//# sourceMappingURL=server.js.map