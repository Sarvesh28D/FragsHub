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
exports.generateTournamentBrackets = exports.cleanupExpiredPayments = exports.onPaymentComplete = exports.onTeamCreate = exports.api = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// Import route handlers
const payment_1 = require("./routes/payment");
const tournament_1 = require("./routes/tournament");
const team_1 = require("./routes/team");
const admin_1 = require("./routes/admin");
// Initialize Firebase Admin
admin.initializeApp();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
// Routes
app.use('/payments', payment_1.paymentRoutes);
app.use('/tournaments', tournament_1.tournamentRoutes);
app.use('/teams', team_1.teamRoutes);
app.use('/admin', admin_1.adminRoutes);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
// Default route
app.get('/', (req, res) => {
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
exports.api = functions.https.onRequest(app);
// Firestore triggers
var firestore_1 = require("./triggers/firestore");
Object.defineProperty(exports, "onTeamCreate", { enumerable: true, get: function () { return firestore_1.onTeamCreate; } });
Object.defineProperty(exports, "onPaymentComplete", { enumerable: true, get: function () { return firestore_1.onPaymentComplete; } });
// Scheduled functions
var scheduled_1 = require("./triggers/scheduled");
Object.defineProperty(exports, "cleanupExpiredPayments", { enumerable: true, get: function () { return scheduled_1.cleanupExpiredPayments; } });
Object.defineProperty(exports, "generateTournamentBrackets", { enumerable: true, get: function () { return scheduled_1.generateTournamentBrackets; } });
//# sourceMappingURL=index.js.map