"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var admin = require("firebase-admin");
var dotenv_1 = require("dotenv");
// Load environment variables
dotenv_1.default.config();
var app = (0, express_1.default)();
var PORT = process.env.PORT || 8080;
// Initialize Firebase Admin SDK
var initializeFirebase = function () {
    var _a;
    try {
        if (!admin.apps.length) {
            var serviceAccount = {
                type: "service_account",
                project_id: process.env.FIREBASE_PROJECT_ID,
                private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
                private_key: (_a = process.env.FIREBASE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n'),
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                client_id: process.env.FIREBASE_CLIENT_ID,
                auth_uri: "https://accounts.google.com/o/oauth2/auth",
                token_uri: "https://oauth2.googleapis.com/token",
                auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
                client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/".concat(process.env.FIREBASE_CLIENT_EMAIL)
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
// CORS configuration
var corsOptions = {
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
// Simple health check endpoint
app.get('/health', function (req, res) {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
// Simple API endpoint for testing
app.get('/api/test', function (req, res) {
    res.json({
        message: 'FragsHub Backend API is working!',
        timestamp: new Date().toISOString()
    });
});
// Start server
app.listen(PORT, function () {
    console.log("\uD83D\uDE80 FragsHub Backend server is running on port ".concat(PORT));
    console.log("\uD83D\uDCCA Health check: http://localhost:".concat(PORT, "/health"));
    console.log("\uD83D\uDD17 Test API: http://localhost:".concat(PORT, "/api/test"));
});
// Graceful shutdown
process.on('SIGINT', function () {
    console.log('\n🛑 Shutting down server gracefully...');
    process.exit(0);
});
process.on('SIGTERM', function () {
    console.log('\n🛑 Shutting down server gracefully...');
    process.exit(0);
});
