import { Request } from 'express';
import * as admin from 'firebase-admin';

// Extend Express Request to include user property
export interface AuthenticatedRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

// Common response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Team registration data
export interface TeamRegistrationData {
  name: string;
  captainName: string;
  captainEmail: string;
  player1: string;
  player2: string;
  player3: string;
  player4: string;
  player5: string;
}

// Tournament data
export interface TournamentData {
  name: string;
  description: string;
  maxTeams: number;
  entryFee: number;
  prizePool: number;
  startDate: Date;
  gameMode: string;
  rules: string;
}

// Payment data
export interface PaymentOrderData {
  amount: number;
  currency: string;
  teamId?: string;
  tournamentId?: string;
  description?: string;
}
