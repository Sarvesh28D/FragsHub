# FragsHub Backend - Hardcoded/Dummy Data Locations

## Overview
This document identifies all locations in the FragsHub backend where hardcoded or dummy data is being returned instead of fetching from a database. This analysis is crucial for database migration planning.

## Primary File: server-working.js (Main Production Backend)

### 1. Mock Data Object (Lines 28-135)
**Location**: `backend/server-working.js` lines 28-135
**Purpose**: Main in-memory data storage for all entities

#### Mock Data Structure:
```javascript
const mockData = {
  teams: [
    // 3 hardcoded teams: Fire Dragons, Ice Warriors, Lightning Bolts
  ],
  tournaments: [
    // 3 hardcoded tournaments: Summer Championship, Winter League, Spring Open
  ],
  payments: [
    // 2 hardcoded payment records
  ],
  users: [
    // Hardcoded admin user
  ]
}
```

### 2. API Endpoints Using Hardcoded Data

#### Teams Endpoints:
- **GET /api/teams** (Line 226)
  - Returns: `mockData.teams`
  - Usage: Frontend team listing and registration display

- **POST /api/teams** (Line 258)
  - Creates new team in: `mockData.teams.push()`
  - Usage: Team registration submissions

#### Tournaments Endpoints:
- **GET /api/tournaments** (Line 533)
  - Returns: `mockData.tournaments`
  - Usage: Tournament listing and bracket display

#### Payments Endpoints:
- **GET /api/payments** (Line 413)
  - Returns: `mockData.payments`
  - Usage: Payment history and transaction tracking

#### Admin Dashboard Endpoints:
- **GET /api/admin/dashboard** (Line 656)
  - Returns: Calculated stats from `mockData` arrays
  - Usage: Admin dashboard statistics display

### 3. Mock Data Generation Functions

#### Payment Trends Generator (Line 770-800)
**Function**: `generatePaymentTrends()`
**Purpose**: Creates fake payment trend data for admin charts
**Returns**: Array of 7 days of mock payment data with random amounts

```javascript
function generatePaymentTrends() {
  // Generates 7 days of fake payment data
  // Returns: [{ date: "YYYY-MM-DD", amount: randomAmount }]
}
```

## TypeScript Route Files (Firebase-based - NOT in use)

### Note: These files exist but are NOT being used in production
The following compiled JavaScript files in `backend/lib/routes/` contain Firebase Firestore database integration code, but are **NOT active** in the current deployment:

1. **team.js** - Firebase-based team management (inactive)
2. **tournament.js** - Firebase-based tournament management (inactive) 
3. **payment.js** - Firebase-based payment processing (inactive)
4. **admin.js** - Firebase-based admin functions (inactive)

These files are from a previous TypeScript implementation and contain proper database queries, but the current production system uses `server-working.js` with mock data instead.

## Data Models Requiring Database Migration

### 1. Teams Data Model
```javascript
{
  id: string,
  name: string,
  players: Array<{
    name: string,
    role: string,
    rank?: string
  }>,
  registrationDate: string,
  status: 'registered' | 'pending',
  paymentStatus: 'paid' | 'pending'
}
```

### 2. Tournaments Data Model
```javascript
{
  id: string,
  name: string,
  game: string,
  date: string,
  maxTeams: number,
  currentTeams: number,
  prizePool: string,
  status: 'upcoming' | 'ongoing' | 'completed',
  entryFee: number
}
```

### 3. Payments Data Model
```javascript
{
  id: string,
  teamId: string,
  teamName: string,
  amount: number,
  date: string,
  status: 'completed' | 'pending' | 'failed',
  tournamentId?: string
}
```

### 4. Users Data Model
```javascript
{
  id: string,
  username: string,
  email: string,
  role: 'admin' | 'user',
  passwordHash?: string
}
```

## Database Migration Strategy

### Priority 1: Core Data Endpoints
1. **Teams API** (`/api/teams`)
   - Replace `mockData.teams` with database queries
   - Implement CREATE, READ operations

2. **Tournaments API** (`/api/tournaments`)
   - Replace `mockData.tournaments` with database queries
   - Implement tournament management

### Priority 2: Transaction Data
3. **Payments API** (`/api/payments`)
   - Replace `mockData.payments` with database queries
   - Implement payment tracking and history

### Priority 3: Administrative Functions
4. **Admin Dashboard** (`/api/admin/dashboard`)
   - Replace calculated stats from mockData with database aggregations
   - Implement real-time analytics

5. **Payment Trends** (`generatePaymentTrends()`)
   - Replace mock trend data with actual payment history analysis
   - Implement date-range queries for trend calculations

## Recommended Database Schema

### Tables Needed:
1. **teams** - Team registrations and player information
2. **tournaments** - Tournament details and scheduling
3. **payments** - Payment transactions and status tracking
4. **users** - User accounts and authentication
5. **tournament_teams** - Many-to-many relationship between tournaments and teams

## Environment Variables Required
When migrating to database:
- Database connection strings
- API keys for payment processing
- Authentication secrets
- Google Sheets API credentials (already configured)

## Files Requiring Updates
1. **server-working.js** - Primary file requiring complete database integration
2. **package.json** - Add database driver dependencies (PostgreSQL, MongoDB, etc.)
3. **Environment configuration** - Database connection settings

## Current Status
✅ **Identified**: All hardcoded data locations documented
⏳ **Next Step**: Choose database technology (PostgreSQL, MongoDB, Firebase, etc.)
⏳ **Implementation**: Replace mockData with database queries
⏳ **Testing**: Ensure API compatibility during migration
