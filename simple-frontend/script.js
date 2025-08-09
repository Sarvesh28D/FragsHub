// FragsHub - Complete JavaScript Implementation

// Global configuration
const CONFIG = {
    API_BASE_URL: 'http://localhost:5000',
    FRONTEND_URL: 'http://localhost:8080',
    DEFAULT_SPREADSHEET_ID: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms' // Example spreadsheet ID
};

// API Client
class APIClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Teams API
    async getTeams(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.request(`/api/teams?${params}`);
    }

    async createTeam(teamData) {
        return this.request('/api/teams', {
            method: 'POST',
            body: JSON.stringify(teamData)
        });
    }

    async updateTeam(teamId, updates) {
        return this.request(`/api/teams/${teamId}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }

    async getTeamStats() {
        return this.request('/api/teams/stats/overview');
    }

    // Export API
    async exportTeamsToGoogleSheets(spreadsheetId, sheetName = 'Teams Data') {
        return this.request('/api/teams/export/google-sheets', {
            method: 'POST',
            body: JSON.stringify({ spreadsheetId, sheetName })
        });
    }

    async exportTournamentsToGoogleSheets(spreadsheetId, sheetName = 'Tournaments Data') {
        return this.request('/api/export/tournaments/google-sheets', {
            method: 'POST',
            body: JSON.stringify({ spreadsheetId, sheetName })
        });
    }

    async exportAllToGoogleSheets(spreadsheetId) {
        return this.request('/api/export/all/google-sheets', {
            method: 'POST',
            body: JSON.stringify({ spreadsheetId })
        });
    }

    async exportTeamsToCSV() {
        const response = await fetch(`${this.baseURL}/api/teams/export/csv`);
        return response.blob();
    }
}

// Initialize API client
const api = new APIClient(CONFIG.API_BASE_URL);

// Global state management
const FragsHub = {
    currentUser: null,
    tournaments: [],
    teams: [],
    leaderboard: [],
    isAdmin: false
};

// Enhanced Global State
let currentView = 'home';
let currentUser = {
    id: null,
    name: '',
    email: '',
    role: 'player',
    permissions: [],
    isLoggedIn: false
};

// Navigation Router
const router = {
    routes: {
        'home': showHome,
        'tournaments': showTournaments, 
        'teams': showTeams,
        'leaderboard': showLeaderboard,
        'about': showAbout,
        'admin': showAdminPanel,
        'profile': showProfile,
        'register-team': showTeamRegistration,
        'my-teams': showMyTeams,
        'payments': showPayments,
        'bracket': showBracket
    },
    
    navigate(route, params = {}) {
        if (this.routes[route]) {
            currentView = route;
            this.hideAllSections();
            this.updateActiveNav(route);
            this.routes[route](params);
            this.updateURL(route);
        }
    },
    
    hideAllSections() {
        const sections = ['hero', 'tournaments', 'teams', 'leaderboard', 'about', 'admin-panel'];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) section.style.display = 'none';
        });
        
        // Clear main content area
        const mainContent = document.getElementById('main-content');
        if (mainContent) mainContent.innerHTML = '';
    },
    
    updateActiveNav(route) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${route}` || (href === '#home' && route === 'home')) {
                link.classList.add('active');
            }
        });
    },
    
    updateURL(route) {
        window.history.pushState({route}, '', `#${route}`);
    }
};

// Enhanced Navigation System
function initializeNavigation() {
    // Handle nav clicks
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const route = link.getAttribute('href').substring(1);
            router.navigate(route);
        });
    });
    
    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
        const route = window.location.hash.substring(1) || 'home';
        router.navigate(route);
    });
    
    // Handle initial load
    const initialRoute = window.location.hash.substring(1) || 'home';
    router.navigate(initialRoute);
}

// Page/View Functions
function showHome() {
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('home').style.display = 'block';
    document.getElementById('tournaments').style.display = 'block';
    document.getElementById('teams').style.display = 'block';
    document.getElementById('leaderboard').style.display = 'block';
    updateHeroStats();
}

function showTournaments() {
    const mainContent = document.getElementById('main-content');
    mainContent.style.display = 'block';
    mainContent.innerHTML = getTournamentsPageHTML();
    initializeTournamentsPage();
}

function showTeams() {
    const mainContent = document.getElementById('main-content');
    mainContent.style.display = 'block';
    mainContent.innerHTML = getTeamsPageHTML();
    initializeTeamsPage();
}

function showLeaderboard() {
    const mainContent = document.getElementById('main-content');
    mainContent.style.display = 'block';
    mainContent.innerHTML = getLeaderboardPageHTML();
    initializeLeaderboardPage();
}

function showAbout() {
    const mainContent = document.getElementById('main-content');
    mainContent.style.display = 'block';
    mainContent.innerHTML = getAboutPageHTML();
}

function showProfile() {
    if (!currentUser.isLoggedIn) {
        showAuthModal('login');
        return;
    }
    const mainContent = document.getElementById('main-content');
    mainContent.style.display = 'block';
    mainContent.innerHTML = getProfilePageHTML();
    initializeProfilePage();
}

function showTeamRegistration() {
    if (!currentUser.isLoggedIn) {
        showAuthModal('login');
        return;
    }
    const mainContent = document.getElementById('main-content');
    mainContent.style.display = 'block';
    mainContent.innerHTML = getTeamRegistrationHTML();
    initializeTeamRegistration();
}

function showMyTeams() {
    if (!currentUser.isLoggedIn) {
        showAuthModal('login');
        return;
    }
    const mainContent = document.getElementById('main-content');
    mainContent.style.display = 'block';
    mainContent.innerHTML = getMyTeamsHTML();
    initializeMyTeamsPage();
}

function showPayments() {
    if (!currentUser.isLoggedIn) {
        showAuthModal('login');
        return;
    }
    const mainContent = document.getElementById('main-content');
    mainContent.style.display = 'block';
    mainContent.innerHTML = getPaymentsHTML();
    initializePaymentsPage();
}

function showBracket(params = {}) {
    const mainContent = document.getElementById('main-content');
    mainContent.style.display = 'block';
    mainContent.innerHTML = getBracketPageHTML(params.tournamentId);
    initializeBracketPage(params.tournamentId);
}

function updateHeroStats() {
    const activeTournaments = mockData.tournaments.filter(t => t.status === 'active').length;
    const totalTeams = mockData.teams.length;
    const totalPrize = mockData.tournaments.reduce((sum, t) => {
        const prize = parseInt(t.prizePool.replace(/[^0-9]/g, ''));
        return sum + prize;
    }, 0);
    
    const activeTournamentsEl = document.getElementById('activeTournaments');
    const totalTeamsEl = document.getElementById('totalTeams');
    const totalPrizeEl = document.getElementById('totalPrize');
    
    if (activeTournamentsEl) activeTournamentsEl.textContent = activeTournaments;
    if (totalTeamsEl) totalTeamsEl.textContent = totalTeams;
    if (totalPrizeEl) totalPrizeEl.textContent = `$${totalPrize.toLocaleString()}`;
}

// Mock data to simulate backend
const mockData = {
    tournaments: [
        {
            id: 1,
            name: "VALORANT Champions Cup",
            game: "VALORANT",
            prizePool: "$10,000",
            maxTeams: 16,
            registeredTeams: 12,
            startDate: "2025-08-15",
            endDate: "2025-08-20",
            status: "active",
            description: "Elite VALORANT tournament featuring the best teams",
            rules: "5v5 format, best of 3 matches",
            entryFee: "$50",
            bracketGenerated: true,
            challongeId: "val_champ_2025",
            currentRound: "Quarter Finals",
            prizeDistribution: [
                { position: 1, percentage: 50, amount: 5000 },
                { position: 2, percentage: 30, amount: 3000 },
                { position: 3, percentage: 15, amount: 1500 },
                { position: 4, percentage: 5, amount: 500 }
            ]
        },
        {
            id: 2,
            name: "CS:GO Masters League",
            game: "CS:GO",
            prizePool: "$15,000",
            maxTeams: 32,
            registeredTeams: 28,
            startDate: "2025-08-25",
            endDate: "2025-08-30",
            status: "upcoming",
            description: "Professional CS:GO competition",
            rules: "5v5 format, MR30 competitive rules",
            entryFee: "$75",
            bracketGenerated: false,
            challongeId: null,
            currentRound: "Registration Open",
            prizeDistribution: [
                { position: 1, percentage: 40, amount: 6000 },
                { position: 2, percentage: 25, amount: 3750 },
                { position: 3, percentage: 20, amount: 3000 },
                { position: 4, percentage: 15, amount: 2250 }
            ]
        },
        {
            id: 3,
            name: "Apex Legends Battle Royale",
            game: "Apex Legends",
            prizePool: "$8,000",
            maxTeams: 20,
            registeredTeams: 20,
            startDate: "2025-07-30",
            endDate: "2025-08-05",
            status: "completed",
            description: "Battle Royale tournament with elimination rounds",
            rules: "3v3 format, 6 rounds per match",
            entryFee: "$30",
            bracketGenerated: true,
            challongeId: "apex_br_2025",
            currentRound: "Tournament Completed",
            winner: "Neon Strikers",
            prizeDistribution: [
                { position: 1, percentage: 50, amount: 4000 },
                { position: 2, percentage: 30, amount: 2400 },
                { position: 3, percentage: 20, amount: 1600 }
            ]
        },
        {
            id: 4,
            name: "Fortnite Championship Series",
            game: "Fortnite",
            prizePool: "$12,000",
            maxTeams: 100,
            registeredTeams: 85,
            startDate: "2025-09-01",
            endDate: "2025-09-03",
            status: "upcoming",
            description: "Massive Battle Royale tournament",
            rules: "Solo/Duo/Squad formats available",
            entryFee: "$25",
            bracketGenerated: false,
            challongeId: null,
            currentRound: "Registration Open"
        },
        {
            id: 5,
            name: "PUBG Mobile World Cup",
            game: "PUBG Mobile",
            prizePool: "$20,000",
            maxTeams: 64,
            registeredTeams: 45,
            startDate: "2025-09-15",
            endDate: "2025-09-18",
            status: "upcoming",
            description: "Mobile gaming championship",
            rules: "4v4 squad format, multiple rounds",
            entryFee: "$40",
            bracketGenerated: false,
            challongeId: null,
            currentRound: "Registration Open"
        }
    ],
    teams: [
        {
            id: 1,
            name: "Thunder Wolves",
            captain: "ProGamer123",
            members: ["ProGamer123", "SharpShooter", "TacticalMind", "QuickScope", "TeamPlayer"],
            wins: 15,
            losses: 3,
            points: 850,
            avatar: "🐺",
            game: "VALORANT",
            registrationStatus: "approved",
            paymentStatus: "paid",
            region: "Asia",
            tournamentId: 1,
            registeredAt: "2025-08-01",
            stats: {
                averageKills: 18.5,
                winRate: 83.3,
                bestMap: "Bind",
                totalEarnings: 2500
            }
        },
        {
            id: 2,
            name: "Cyber Knights",
            captain: "KnightRider",
            members: ["KnightRider", "SwordMaster", "ShieldBearer", "ArrowHawk", "MagicUser"],
            wins: 12,
            losses: 5,
            points: 720,
            avatar: "⚔️",
            game: "CS:GO",
            registrationStatus: "approved",
            paymentStatus: "paid",
            region: "Europe",
            tournamentId: 2,
            registeredAt: "2025-08-02",
            stats: {
                averageKills: 16.2,
                winRate: 70.6,
                bestMap: "Dust2",
                totalEarnings: 1800
            }
        },
        {
            id: 3,
            name: "Neon Strikers",
            captain: "LightSpeed",
            members: ["LightSpeed", "ElectricBolt", "PowerSurge", "VoltGaming", "EnergyBlast"],
            wins: 18,
            losses: 2,
            points: 920,
            avatar: "⚡",
            game: "Apex Legends",
            registrationStatus: "approved",
            paymentStatus: "paid",
            region: "North America",
            tournamentId: 3,
            registeredAt: "2025-07-25",
            stats: {
                averageKills: 22.1,
                winRate: 90.0,
                bestMap: "Kings Canyon",
                totalEarnings: 4200
            }
        },
        {
            id: 4,
            name: "Phoenix Rising",
            captain: "FireBird",
            members: ["FireBird", "FlameWing", "BurningSkull", "Inferno", "HeatWave"],
            wins: 10,
            losses: 8,
            points: 650,
            avatar: "🔥",
            game: "VALORANT",
            registrationStatus: "pending",
            paymentStatus: "pending",
            region: "Asia",
            tournamentId: 1,
            registeredAt: "2025-08-05",
            stats: {
                averageKills: 14.3,
                winRate: 55.6,
                bestMap: "Split",
                totalEarnings: 800
            }
        },
        {
            id: 5,
            name: "Shadow Assassins",
            captain: "NightHawk",
            members: ["NightHawk", "SilentBlade", "DarkStorm", "StealthMode", "ShadowStep"],
            wins: 14,
            losses: 4,
            points: 780,
            avatar: "🥷",
            game: "CS:GO",
            registrationStatus: "approved",
            paymentStatus: "paid",
            region: "Asia",
            tournamentId: 2,
            registeredAt: "2025-08-03"
        },
        {
            id: 6,
            name: "Ice Dragons",
            captain: "FrostBite",
            members: ["FrostBite", "IceBreaker", "ColdSnap", "Blizzard", "FrozenHeart"],
            wins: 8,
            losses: 6,
            points: 520,
            avatar: "🐉",
            game: "Fortnite",
            registrationStatus: "pending",
            paymentStatus: "pending",
            region: "Europe",
            tournamentId: 4,
            registeredAt: "2025-08-07"
        }
    ],
    users: [
        {
            id: 1,
            email: "admin@fragshub.com",
            password: "admin123",
            role: "admin",
            username: "FragsAdmin",
            permissions: ["manage_tournaments", "approve_teams", "manage_payments", "view_analytics", "manage_users"]
        },
        {
            id: 2,
            email: "player@example.com",
            password: "player123",
            role: "team_captain",
            username: "ProGamer123",
            permissions: ["register_team", "manage_team", "view_tournaments"]
        },
        {
            id: 3,
            email: "knight@example.com",
            password: "knight123",
            role: "team_captain",
            username: "KnightRider",
            permissions: ["register_team", "manage_team", "view_tournaments"]
        },
        {
            id: 4,
            email: "lightning@example.com",
            password: "light123",
            role: "team_captain",
            username: "LightSpeed",
            permissions: ["register_team", "manage_team", "view_tournaments"]
        }
    ],
    
    // Payment data for admin tracking
    payments: [
        {
            id: "pay_1",
            teamId: 1,
            tournamentId: 1,
            amount: 50,
            currency: "USD",
            status: "paid",
            razorpayPaymentId: "pay_razorpay_123",
            paidAt: "2025-08-01T10:30:00Z",
            method: "card"
        },
        {
            id: "pay_2",
            teamId: 2,
            tournamentId: 2,
            amount: 75,
            currency: "USD",
            status: "paid",
            razorpayPaymentId: "pay_razorpay_124",
            paidAt: "2025-08-02T14:15:00Z",
            method: "upi"
        },
        {
            id: "pay_3",
            teamId: 4,
            tournamentId: 1,
            amount: 50,
            currency: "USD",
            status: "pending",
            razorpayPaymentId: null,
            paidAt: null,
            method: null
        }
    ],
    
    // Match results for bracket system
    matches: [
        {
            id: "match_1",
            tournamentId: 1,
            round: "Quarter Finals",
            team1Id: 1,
            team2Id: 4,
            team1Score: 2,
            team2Score: 1,
            winnerId: 1,
            status: "completed",
            scheduledTime: "2025-08-15T15:00:00Z",
            completedAt: "2025-08-15T16:45:00Z"
        },
        {
            id: "match_2",
            tournamentId: 3,
            round: "Final",
            team1Id: 3,
            team2Id: 2,
            team1Score: 3,
            team2Score: 1,
            winnerId: 3,
            status: "completed",
            scheduledTime: "2025-08-05T18:00:00Z",
            completedAt: "2025-08-05T20:30:00Z"
        }
    ]
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeApp();
    loadTournaments();
    loadTeams();
    loadLeaderboard();
    setupEventListeners();
    setupNavigation();
});

function initializeApp() {
    // Load data from localStorage or use mock data
    FragsHub.tournaments = JSON.parse(localStorage.getItem('tournaments')) || mockData.tournaments;
    FragsHub.teams = JSON.parse(localStorage.getItem('teams')) || mockData.teams;
    FragsHub.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    
    // Update nav based on login status
    updateNavigation();
    
    // Generate leaderboard
    generateLeaderboard();
}

function setupEventListeners() {
    // Navigation smooth scrolling
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });

    // Mobile hamburger menu
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

function setupNavigation() {
    // Add active class to current section
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Tournament Management
function loadTournaments() {
    const tournamentGrid = document.getElementById('tournamentGrid');
    if (!tournamentGrid) return;
    
    tournamentGrid.innerHTML = '';
    
    FragsHub.tournaments.forEach(tournament => {
        const tournamentCard = createTournamentCard(tournament);
        tournamentGrid.appendChild(tournamentCard);
    });
}

function createTournamentCard(tournament) {
    const card = document.createElement('div');
    card.className = 'tournament-card fade-in-up';
    card.onclick = () => showTournamentDetails(tournament);
    
    card.innerHTML = `
        <h3>${tournament.name}</h3>
        <p><strong>Game:</strong> ${tournament.game}</p>
        <p><strong>Prize Pool:</strong> ${tournament.prizePool}</p>
        <p><strong>Teams:</strong> ${tournament.registeredTeams}/${tournament.maxTeams}</p>
        <p><strong>Entry Fee:</strong> ${tournament.entryFee}</p>
        <p><strong>Start Date:</strong> ${new Date(tournament.startDate).toLocaleDateString()}</p>
        <span class="tournament-status status-${tournament.status}">${tournament.status.toUpperCase()}</span>
    `;
    
    return card;
}

function showTournamentDetails(tournament) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>${tournament.name}</h2>
            <div class="tournament-details">
                <p><strong>Game:</strong> ${tournament.game}</p>
                <p><strong>Prize Pool:</strong> ${tournament.prizePool}</p>
                <p><strong>Entry Fee:</strong> ${tournament.entryFee}</p>
                <p><strong>Teams:</strong> ${tournament.registeredTeams}/${tournament.maxTeams}</p>
                <p><strong>Start Date:</strong> ${new Date(tournament.startDate).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> ${new Date(tournament.endDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> <span class="tournament-status status-${tournament.status}">${tournament.status.toUpperCase()}</span></p>
                <p><strong>Description:</strong> ${tournament.description}</p>
                <p><strong>Rules:</strong> ${tournament.rules}</p>
                <div class="tournament-actions">
                    ${tournament.status === 'active' || tournament.status === 'upcoming' ? 
                        `<button class="btn-primary" onclick="registerForTournament(${tournament.id})">Register Team</button>` : ''}
                    <button class="btn-secondary" onclick="viewBracket(${tournament.id})">View Bracket</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function registerForTournament(tournamentId) {
    if (!FragsHub.currentUser) {
        showAuthModal('login');
        return;
    }
    
    const tournament = FragsHub.tournaments.find(t => t.id === tournamentId);
    if (tournament && tournament.registeredTeams < tournament.maxTeams) {
        tournament.registeredTeams++;
        saveData();
        loadTournaments();
        showNotification('Successfully registered for tournament!', 'success');
    } else {
        showNotification('Tournament is full!', 'error');
    }
}

function viewBracket(tournamentId) {
    const tournament = FragsHub.tournaments.find(t => t.id === tournamentId);
    showBracketModal(tournament);
}

function showBracketModal(tournament) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content admin-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>${tournament.name} - Tournament Bracket</h2>
            <div class="bracket-container">
                ${generateBracket(tournament)}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function generateBracket(tournament) {
    // Simple bracket visualization
    const teams = FragsHub.teams.slice(0, tournament.registeredTeams);
    let bracketHTML = '<div class="bracket-rounds">';
    
    // Round 1
    bracketHTML += '<div class="bracket-round"><h4>Round 1</h4>';
    for (let i = 0; i < teams.length; i += 2) {
        const team1 = teams[i];
        const team2 = teams[i + 1];
        bracketHTML += `
            <div class="match">
                <div class="team">${team1 ? team1.name : 'TBD'}</div>
                <div class="vs">VS</div>
                <div class="team">${team2 ? team2.name : 'TBD'}</div>
            </div>
        `;
    }
    bracketHTML += '</div>';
    
    // Subsequent rounds
    let remainingTeams = Math.floor(teams.length / 2);
    let round = 2;
    while (remainingTeams > 1) {
        bracketHTML += `<div class="bracket-round"><h4>Round ${round}</h4>`;
        for (let i = 0; i < remainingTeams; i += 2) {
            bracketHTML += `
                <div class="match">
                    <div class="team">Winner ${i + 1}</div>
                    <div class="vs">VS</div>
                    <div class="team">Winner ${i + 2}</div>
                </div>
            `;
        }
        bracketHTML += '</div>';
        remainingTeams = Math.floor(remainingTeams / 2);
        round++;
    }
    
    // Final
    bracketHTML += '<div class="bracket-round final"><h4>Final</h4>';
    bracketHTML += `
        <div class="match">
            <div class="team">Finalist 1</div>
            <div class="vs">VS</div>
            <div class="team">Finalist 2</div>
        </div>
    `;
    bracketHTML += '</div></div>';
    
    return bracketHTML;
}

// Team Management
function loadTeams() {
    const teamGrid = document.getElementById('teamGrid');
    if (!teamGrid) return;
    
    teamGrid.innerHTML = '';
    
    FragsHub.teams.forEach(team => {
        const teamCard = createTeamCard(team);
        teamGrid.appendChild(teamCard);
    });
}

function createTeamCard(team) {
    const card = document.createElement('div');
    card.className = 'team-card fade-in-up';
    card.onclick = () => showTeamDetails(team);
    
    card.innerHTML = `
        <div class="team-avatar">${team.avatar}</div>
        <h3>${team.name}</h3>
        <p><strong>Captain:</strong> ${team.captain}</p>
        <p><strong>Game:</strong> ${team.game}</p>
        <p><strong>Record:</strong> ${team.wins}W - ${team.losses}L</p>
        <p><strong>Points:</strong> ${team.points}</p>
    `;
    
    return card;
}

function showTeamDetails(team) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <div style="text-align: center;">
                <div class="team-avatar" style="font-size: 4rem; margin: 20px auto;">${team.avatar}</div>
                <h2>${team.name}</h2>
            </div>
            <div class="team-details">
                <p><strong>Captain:</strong> ${team.captain}</p>
                <p><strong>Game:</strong> ${team.game}</p>
                <p><strong>Wins:</strong> ${team.wins}</p>
                <p><strong>Losses:</strong> ${team.losses}</p>
                <p><strong>Points:</strong> ${team.points}</p>
                <p><strong>Win Rate:</strong> ${((team.wins / (team.wins + team.losses)) * 100).toFixed(1)}%</p>
                <h4>Team Members:</h4>
                <ul style="list-style: none; padding: 0;">
                    ${team.members.map(member => `<li style="padding: 5px 0;">• ${member}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Leaderboard Management
function generateLeaderboard() {
    FragsHub.leaderboard = [...FragsHub.teams]
        .sort((a, b) => b.points - a.points)
        .map((team, index) => ({
            ...team,
            rank: index + 1
        }));
}

function loadLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboardBody');
    if (!leaderboardBody) return;
    
    leaderboardBody.innerHTML = '';
    
    FragsHub.leaderboard.forEach(team => {
        const row = document.createElement('tr');
        row.onclick = () => showTeamDetails(team);
        row.style.cursor = 'pointer';
        
        const rankClass = team.rank <= 3 ? `rank-${team.rank}` : '';
        
        row.innerHTML = `
            <td class="${rankClass}">#${team.rank}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.5rem;">${team.avatar}</span>
                    ${team.name}
                </div>
            </td>
            <td>${team.points}</td>
            <td>${team.wins}</td>
        `;
        
        leaderboardBody.appendChild(row);
    });
}

// Authentication System
function showAuthModal(mode = 'login') {
    const modal = document.getElementById('authModal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (mode === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
    
    modal.style.display = 'block';
}

// Role Switching System
function showRoleSwitcher() {
    const dropdown = document.getElementById('roleDropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function closeDropdown(e) {
        if (!e.target.closest('.role-switcher')) {
            dropdown.style.display = 'none';
            document.removeEventListener('click', closeDropdown);
        }
    });
}

function switchRole(newRole) {
    // Update current user role
    currentUser.role = newRole;
    
    // Update display
    const roleDisplay = document.getElementById('currentRoleDisplay');
    const roleIcons = {
        'admin': '🔧 Admin',
        'team_captain': '👑 Team Captain', 
        'player': '🎮 Player'
    };
    
    roleDisplay.textContent = roleIcons[newRole] || 'Player';
    
    // Hide dropdown
    document.getElementById('roleDropdown').style.display = 'none';
    
    // Update UI for the new role
    updateUIForRole();
    
    // Show notification
    showNotification(`Switched to ${roleIcons[newRole]} role`, 'success');
    
    // Refresh current view if needed
    if (currentView === 'admin' && newRole !== 'admin') {
        showContent('home');
    } else if (currentView !== 'admin' && newRole === 'admin') {
        // Don't auto-switch to admin, let user click admin button
    }
}

function updateUIForRole() {
    const { role } = currentUser;
    const adminButton = document.querySelector('.btn-admin');
    const navMenu = document.querySelector('.nav-menu');
    
    // Show/hide admin button based on role
    if (role === 'admin') {
        adminButton.style.display = 'inline-block';
    } else {
        adminButton.style.display = 'none';
    }
    
    // Update navigation based on role
    updateNavigationForRole(role);
    
    // Update content based on current view
    if (currentView) {
        refreshCurrentView();
    }
}

function updateNavigationForRole(role) {
    // This function can be extended to show/hide navigation items based on role
    // For now, we'll keep all navigation items visible but control content access
}

function refreshCurrentView() {
    // Refresh the current view with role-appropriate content
    if (currentView && typeof showContent === 'function') {
        showContent(currentView);
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize role switcher when user logs in
function simulateLogin() {
    // Mark as logged in
    document.body.classList.add('logged-in');
    
    // Show role switcher
    document.querySelector('.role-switcher').style.display = 'block';
    
    // Set default role if not already set
    if (!currentUser.role) {
        currentUser.role = 'player';
    }
    updateUIForRole();
    
    // Close auth modal
    closeModal();
    
    showNotification('Logged in successfully!', 'success');
}

// Quick login for demo purposes
function quickLogin() {
    // Use first admin user for quick login
    const adminUser = mockData.users.find(u => u.role === 'admin') || mockData.users[0];
    
    currentUser = adminUser;
    FragsHub.currentUser = adminUser;
    FragsHub.isAdmin = adminUser.role === 'admin';
    localStorage.setItem('currentUser', JSON.stringify(adminUser));
    
    // Enable role switcher UI
    simulateLogin();
    
    updateNavigation();
    showNotification(`Quick login as ${adminUser.name}!`, 'success');
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    modal.style.display = 'none';
}

function switchAuthMode(mode) {
    showAuthModal(mode);
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    const user = mockData.users.find(u => u.email === email && u.password === password);
    
    if (user) {
        FragsHub.currentUser = user;
        currentUser = user; // Update global currentUser
        FragsHub.isAdmin = user.role === 'admin';
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Enable role switcher UI
        simulateLogin();
        
// Page/View Functions
function showHome() {
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('home').style.display = 'block';
    document.getElementById('tournaments').style.display = 'block';
    document.getElementById('teams').style.display = 'block';
    document.getElementById('leaderboard').style.display = 'block';
    updateHeroStats();
}

function showTournaments() {
    const mainContent = document.getElementById('main-content');
    mainContent.style.display = 'block';
    mainContent.innerHTML = getTournamentsPageHTML();
    initializeTournamentsPage();
}

function showTeams() {
    const mainContent = document.getElementById('main-content');
    mainContent.style.display = 'block';
    mainContent.innerHTML = getTeamsPageHTML();
    initializeTeamsPage();
}

function showLeaderboard() {
    const mainContent = document.getElementById('main-content');
    mainContent.style.display = 'block';
    mainContent.innerHTML = getLeaderboardPageHTML();
    initializeLeaderboardPage();
}

function showAbout() {
    const mainContent = document.getElementById('main-content');
    mainContent.style.display = 'block';
    mainContent.innerHTML = getAboutPageHTML();
}

function showProfile() {
    if (!currentUser.isLoggedIn) {
        showAuthModal('login');
        return;
    }
    const mainContent = document.getElementById('main-content');
    mainContent.style.display = 'block';
    mainContent.innerHTML = getProfilePageHTML();
    initializeProfilePage();
}

function showTeamRegistration() {
    if (!currentUser.isLoggedIn) {
        showAuthModal('login');
        return;
    }
    const mainContent = document.getElementById('main-content');
    mainContent.style.display = 'block';
    mainContent.innerHTML = getTeamRegistrationHTML();
    initializeTeamRegistration();
}

function showMyTeams() {
    if (!currentUser.isLoggedIn) {
        showAuthModal('login');
        return;
    }
    const mainContent = document.getElementById('main-content');
    mainContent.style.display = 'block';
    mainContent.innerHTML = getMyTeamsHTML();
    initializeMyTeamsPage();
}

function showPayments() {
    if (!currentUser.isLoggedIn) {
        showAuthModal('login');
        return;
    }
    const mainContent = document.getElementById('main-content');
    mainContent.style.display = 'block';
    mainContent.innerHTML = getPaymentsHTML();
    initializePaymentsPage();
}

function showBracket(params = {}) {
    const mainContent = document.getElementById('main-content');
    mainContent.style.display = 'block';
    mainContent.innerHTML = getBracketPageHTML(params.tournamentId);
    initializeBracketPage(params.tournamentId);
}

function updateHeroStats() {
    const activeTournaments = mockData.tournaments.filter(t => t.status === 'active').length;
    const totalTeams = mockData.teams.length;
    const totalPrize = mockData.tournaments.reduce((sum, t) => {
        const prize = parseInt(t.prizePool.replace(/[^0-9]/g, ''));
        return sum + prize;
    }, 0);
    
    const activeTournamentsEl = document.getElementById('activeTournaments');
    const totalTeamsEl = document.getElementById('totalTeams');
    const totalPrizeEl = document.getElementById('totalPrize');
    
    if (activeTournamentsEl) activeTournamentsEl.textContent = activeTournaments;
    if (totalTeamsEl) totalTeamsEl.textContent = totalTeams;
    if (totalPrizeEl) totalPrizeEl.textContent = `$${totalPrize.toLocaleString()}`;
}
        closeAuthModal();
        showNotification(`Welcome back, ${user.username}!`, 'success');
    } else {
        showNotification('Invalid credentials', 'error');
    }
}

function handleRegister() {
    const teamName = document.getElementById('registerTeam').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    if (!teamName || !email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Check if email already exists
    if (mockData.users.find(u => u.email === email)) {
        showNotification('Email already registered', 'error');
        return;
    }
    
    // Create new user and team
    const newUser = {
        id: mockData.users.length + 1,
        email: email,
        password: password,
        role: 'player',
        username: teamName + 'Captain'
    };
    
    const newTeam = {
        id: FragsHub.teams.length + 1,
        name: teamName,
        captain: newUser.username,
        members: [newUser.username],
        wins: 0,
        losses: 0,
        points: 0,
        avatar: '🎮',
        game: 'Multi-Game'
    };
    
    mockData.users.push(newUser);
    FragsHub.teams.push(newTeam);
    FragsHub.currentUser = newUser;
    
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    localStorage.setItem('teams', JSON.stringify(FragsHub.teams));
    
    updateNavigation();
    loadTeams();
    generateLeaderboard();
    loadLeaderboard();
    closeAuthModal();
    showNotification(`Welcome to FragsHub, ${teamName}!`, 'success');
}

function logout() {
    FragsHub.currentUser = null;
    FragsHub.isAdmin = false;
    localStorage.removeItem('currentUser');
    updateNavigation();
    showNotification('Logged out successfully', 'success');
}

function updateNavigation() {
    const loginBtn = document.querySelector('.btn-login');
    const registerBtn = document.querySelector('.btn-register');
    const adminBtn = document.querySelector('.btn-admin');
    
    if (FragsHub.currentUser) {
        loginBtn.style.display = 'none';
        registerBtn.textContent = 'Logout';
        registerBtn.onclick = logout;
        
        if (FragsHub.isAdmin) {
            adminBtn.style.display = 'inline-block';
        }
    } else {
        loginBtn.style.display = 'inline-block';
        registerBtn.textContent = 'Register';
        registerBtn.onclick = () => showAuthModal('register');
        adminBtn.style.display = 'none';
    }
}

// Admin Panel
function showAdminPanel() {
    if (!FragsHub.isAdmin) {
        showNotification('Access denied', 'error');
        return;
    }
    
    const modal = document.getElementById('adminPanel');
    modal.style.display = 'block';
    showAdminTab('tournaments');
}

function closeAdminPanel() {
    const modal = document.getElementById('adminPanel');
    modal.style.display = 'none';
}

function showAdminTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const content = document.getElementById('adminContent');
    
    switch(tab) {
        case 'tournaments':
            content.innerHTML = getAdminTournamentsHTML();
            break;
        case 'teams':
            content.innerHTML = getAdminTeamsHTML();
            break;
        case 'users':
            content.innerHTML = getAdminUsersHTML();
            break;
    }
}

function getAdminTournamentsHTML() {
    return `
        <div class="admin-section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h4>Tournament Management</h4>
                <button class="btn-primary" onclick="showAddTournamentForm()">Add Tournament</button>
            </div>
            
            <!-- Tournament Statistics -->
            <div class="admin-stats-grid">
                <div class="stat-card">
                    <h5>Total Tournaments</h5>
                    <div class="stat-number">${FragsHub.tournaments.length}</div>
                </div>
                <div class="stat-card">
                    <h5>Active Tournaments</h5>
                    <div class="stat-number">${FragsHub.tournaments.filter(t => t.status === 'active').length}</div>
                </div>
                <div class="stat-card">
                    <h5>Upcoming</h5>
                    <div class="stat-number">${FragsHub.tournaments.filter(t => t.status === 'upcoming').length}</div>
                </div>
                <div class="stat-card">
                    <h5>Completed</h5>
                    <div class="stat-number">${FragsHub.tournaments.filter(t => t.status === 'completed').length}</div>
                </div>
            </div>
            
            <div class="admin-table">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Game</th>
                            <th>Prize Pool</th>
                            <th>Teams</th>
                            <th>Status</th>
                            <th>Bracket</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${FragsHub.tournaments.map(tournament => `
                            <tr>
                                <td>
                                    <div style="font-weight: bold;">${tournament.name}</div>
                                    <div style="font-size: 0.8rem; color: #888;">${tournament.description}</div>
                                </td>
                                <td>
                                    <span class="game-badge game-${tournament.game.toLowerCase().replace(/[^a-z]/g, '')}">${tournament.game}</span>
                                </td>
                                <td>${tournament.prizePool}</td>
                                <td>
                                    <div>${tournament.registeredTeams}/${tournament.maxTeams}</div>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${(tournament.registeredTeams/tournament.maxTeams)*100}%"></div>
                                    </div>
                                </td>
                                <td><span class="tournament-status status-${tournament.status}">${tournament.status}</span></td>
                                <td>
                                    ${tournament.bracketGenerated ? 
                                        '<span style="color: #27ae60;">✓ Generated</span>' : 
                                        `<button onclick="generateBracket(${tournament.id})" style="background: #f39c12; padding: 4px 8px; font-size: 0.8rem;">Generate</button>`
                                    }
                                </td>
                                <td>
                                    <div class="action-buttons">
                                        <button onclick="editTournament(${tournament.id})" title="Edit">✏️</button>
                                        <button onclick="viewTournamentStats(${tournament.id})" title="Stats">📊</button>
                                        <button onclick="manageTournamentTeams(${tournament.id})" title="Teams">👥</button>
                                        <button onclick="deleteTournament(${tournament.id})" style="background: #e74c3c;" title="Delete">🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function getAdminTeamsHTML() {
    const pendingTeams = FragsHub.teams.filter(t => t.registrationStatus === 'pending');
    const approvedTeams = FragsHub.teams.filter(t => t.registrationStatus === 'approved');
    const rejectedTeams = FragsHub.teams.filter(t => t.registrationStatus === 'rejected');
    
    return `
        <div class="admin-section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h4>Team Management</h4>
                <div class="export-actions">
                    <button class="btn-secondary" onclick="showExportModal()">
                        <i class="fas fa-download"></i> Export Data
                    </button>
                    <button class="btn-primary" onclick="exportToGoogleSheets()">
                        <i class="fab fa-google"></i> Export to Google Sheets
                    </button>
                </div>
            </div>
            
            <!-- Team Statistics -->
            <div class="admin-stats-grid">
                <div class="stat-card">
                    <h5>Total Teams</h5>
                    <div class="stat-number">${FragsHub.teams.length}</div>
                </div>
                <div class="stat-card pending">
                    <h5>Pending Approval</h5>
                    <div class="stat-number">${pendingTeams.length}</div>
                </div>
                <div class="stat-card approved">
                    <h5>Approved</h5>
                    <div class="stat-number">${approvedTeams.length}</div>
                </div>
                <div class="stat-card rejected">
                    <h5>Rejected</h5>
                    <div class="stat-number">${rejectedTeams.length}</div>
                </div>
            </div>
            
            <!-- Export Status Display -->
            <div id="exportStatus" class="export-status" style="display: none;">
                <div class="status-message"></div>
                <div class="status-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                </div>
            </div>
            
            <!-- Pending Teams Section -->
            ${pendingTeams.length > 0 ? `
                <div class="pending-teams-section">
                    <h5 style="color: #f39c12; margin-bottom: 15px;">⏳ Teams Awaiting Approval</h5>
                    <div class="pending-teams-grid">
                        ${pendingTeams.map(team => `
                            <div class="pending-team-card">
                                <div class="team-header">
                                    <span class="team-avatar">${team.avatar}</span>
                                    <div>
                                        <h6>${team.name}</h6>
                                        <p>Captain: ${team.captain}</p>
                                        <p>Game: ${team.game}</p>
                                        <p>Region: ${team.region || 'Not specified'}</p>
                                    </div>
                                </div>
                                <div class="team-actions">
                                    <button class="approve-btn" onclick="approveTeam(${team.id})">✓ Approve</button>
                                    <button class="reject-btn" onclick="rejectTeam(${team.id})">✗ Reject</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : '<p style="color: #27ae60;">✅ No teams pending approval</p>'}
            
            <div class="admin-table">
                <table>
                    <thead>
                        <tr>
                            <th>Team</th>
                            <th>Captain</th>
                            <th>Game</th>
                            <th>Record</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Registration Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${FragsHub.teams.map(team => `
                            <tr class="team-row status-${team.registrationStatus}">
                                <td>
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <span style="font-size: 1.5rem;">${team.avatar}</span>
                                        <div>
                                            <div style="font-weight: bold;">${team.name}</div>
                                            <div style="font-size: 0.8rem; color: #888;">${team.region || 'Unknown region'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>${team.captain}</td>
                                <td><span class="game-badge game-${team.game.toLowerCase().replace(/[^a-z]/g, '')}">${team.game}</span></td>
                                <td>
                                    <div>${team.wins}W - ${team.losses}L</div>
                                    <div style="font-size: 0.8rem; color: #888;">${team.points} pts</div>
                                </td>
                                <td>
                                    <span class="status-badge status-${team.registrationStatus}">${team.registrationStatus}</span>
                                </td>
                                <td>
                                    <span class="payment-badge payment-${team.paymentStatus || 'pending'}">${team.paymentStatus || 'pending'}</span>
                                </td>
                                <td>${team.registeredAt ? new Date(team.registeredAt).toLocaleDateString() : 'N/A'}</td>
                                <td>
                                    <div class="action-buttons">
                                        <button onclick="viewTeamDetails(${team.id})" title="View Details">👁️</button>
                                        <button onclick="editTeam(${team.id})" title="Edit">✏️</button>
                                        ${team.registrationStatus === 'pending' ? `
                                            <button onclick="approveTeam(${team.id})" style="background: #27ae60;" title="Approve">✓</button>
                                            <button onclick="rejectTeam(${team.id})" style="background: #e74c3c;" title="Reject">✗</button>
                                        ` : ''}
                                        <button onclick="deleteTeam(${team.id})" style="background: #e74c3c;" title="Delete">🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function getAdminUsersHTML() {
    return `
        <div class="admin-section">
            <h4>User Management</h4>
            
            <!-- User Statistics -->
            <div class="admin-stats-grid">
                <div class="stat-card">
                    <h5>Total Users</h5>
                    <div class="stat-number">${mockData.users.length}</div>
                </div>
                <div class="stat-card">
                    <h5>Administrators</h5>
                    <div class="stat-number">${mockData.users.filter(u => u.role === 'admin').length}</div>
                </div>
                <div class="stat-card">
                    <h5>Team Captains</h5>
                    <div class="stat-number">${mockData.users.filter(u => u.role === 'team_captain').length}</div>
                </div>
                <div class="stat-card">
                    <h5>Players</h5>
                    <div class="stat-number">${mockData.users.filter(u => u.role === 'player').length}</div>
                </div>
            </div>
            
            <div class="admin-table">
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Permissions</th>
                            <th>Last Active</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${mockData.users.map(user => `
                            <tr>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <div class="user-avatar">${user.role === 'admin' ? '👑' : user.role === 'team_captain' ? '🎮' : '👤'}</div>
                                        <div>
                                            <div style="font-weight: bold;">${user.username}</div>
                                            <div style="font-size: 0.8rem; color: #888;">ID: ${user.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>${user.email}</td>
                                <td><span class="role-badge role-${user.role.replace('_', '-')}">${user.role.replace('_', ' ')}</span></td>
                                <td>
                                    <div class="permissions-list">
                                        ${(user.permissions || []).slice(0, 2).map(perm => 
                                            `<span class="permission-tag">${perm.replace('_', ' ')}</span>`
                                        ).join('')}
                                        ${(user.permissions || []).length > 2 ? `<span class="more-permissions">+${(user.permissions || []).length - 2}</span>` : ''}
                                    </div>
                                </td>
                                <td>
                                    <div style="font-size: 0.9rem; color: #888;">
                                        ${user.id === FragsHub.currentUser?.id ? 'Currently Active' : 'Unknown'}
                                    </div>
                                </td>
                                <td>
                                    <div class="action-buttons">
                                        <button onclick="viewUserProfile(${user.id})" title="View Profile">👁️</button>
                                        <button onclick="editUserPermissions(${user.id})" title="Edit Permissions">⚙️</button>
                                        <button onclick="toggleUserRole(${user.id})" style="margin-right: 5px;" title="Change Role">
                                            ${user.role === 'admin' ? '👤' : '👑'}
                                        </button>
                                        ${user.id !== 1 ? `<button onclick="deleteUser(${user.id})" style="background: #e74c3c;" title="Delete">🗑️</button>` : ''}
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <!-- Add User Section -->
            <div class="add-user-section">
                <h5>Add New User</h5>
                <div class="add-user-form">
                    <input type="text" id="newUserUsername" placeholder="Username">
                    <input type="email" id="newUserEmail" placeholder="Email">
                    <select id="newUserRole">
                        <option value="player">Player</option>
                        <option value="team_captain">Team Captain</option>
                        <option value="admin">Administrator</option>
                    </select>
                    <button onclick="addNewUser()">Add User</button>
                </div>
            </div>
        </div>
    `;
}

// Admin functions
function showAddTournamentForm() {
    const form = document.createElement('div');
    form.className = 'modal';
    form.style.display = 'block';
    
    form.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h3>Add New Tournament</h3>
            <div class="auth-form">
                <input type="text" id="tournamentName" placeholder="Tournament Name">
                <input type="text" id="tournamentGame" placeholder="Game">
                <input type="text" id="tournamentPrize" placeholder="Prize Pool (e.g., $10,000)">
                <input type="number" id="tournamentMaxTeams" placeholder="Max Teams">
                <input type="text" id="tournamentEntryFee" placeholder="Entry Fee (e.g., $50)">
                <input type="date" id="tournamentStartDate">
                <input type="date" id="tournamentEndDate">
                <textarea id="tournamentDescription" placeholder="Description" style="min-height: 80px;"></textarea>
                <textarea id="tournamentRules" placeholder="Rules" style="min-height: 80px;"></textarea>
                <button onclick="addTournament()">Add Tournament</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(form);
}

function addTournament() {
    const newTournament = {
        id: FragsHub.tournaments.length + 1,
        name: document.getElementById('tournamentName').value,
        game: document.getElementById('tournamentGame').value,
        prizePool: document.getElementById('tournamentPrize').value,
        maxTeams: parseInt(document.getElementById('tournamentMaxTeams').value),
        registeredTeams: 0,
        entryFee: document.getElementById('tournamentEntryFee').value,
        startDate: document.getElementById('tournamentStartDate').value,
        endDate: document.getElementById('tournamentEndDate').value,
        description: document.getElementById('tournamentDescription').value,
        rules: document.getElementById('tournamentRules').value,
        status: 'upcoming'
    };
    
    FragsHub.tournaments.push(newTournament);
    saveData();
    loadTournaments();
    showAdminTab('tournaments');
    document.querySelector('.modal').remove();
    showNotification('Tournament added successfully!', 'success');
}

function deleteTournament(id) {
    if (confirm('Are you sure you want to delete this tournament?')) {
        FragsHub.tournaments = FragsHub.tournaments.filter(t => t.id !== id);
        saveData();
        loadTournaments();
        showAdminTab('tournaments');
        showNotification('Tournament deleted successfully!', 'success');
    }
}

function deleteTeam(id) {
    if (confirm('Are you sure you want to delete this team?')) {
        FragsHub.teams = FragsHub.teams.filter(t => t.id !== id);
        saveData();
        loadTeams();
        generateLeaderboard();
        loadLeaderboard();
        showAdminTab('teams');
        showNotification('Team deleted successfully!', 'success');
    }
}

function toggleUserRole(id) {
    const user = mockData.users.find(u => u.id === id);
    if (user && user.id !== 1) { // Don't allow changing main admin
        user.role = user.role === 'admin' ? 'player' : 'admin';
        showAdminTab('users');
        showNotification(`User role updated to ${user.role}!`, 'success');
    }
}

function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        mockData.users = mockData.users.filter(u => u.id !== id);
        showAdminTab('users');
        showNotification('User deleted successfully!', 'success');
    }
}

// Utility functions
function saveData() {
    localStorage.setItem('tournaments', JSON.stringify(FragsHub.tournaments));
    localStorage.setItem('teams', JSON.stringify(FragsHub.teams));
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
    `;
    
    switch(type) {
        case 'success':
            notification.style.background = '#27ae60';
            break;
        case 'error':
            notification.style.background = '#e74c3c';
            break;
        case 'warning':
            notification.style.background = '#f39c12';
            break;
        default:
            notification.style.background = '#3498db';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .admin-table {
        overflow-x: auto;
        margin-top: 20px;
    }
    
    .admin-table table {
        width: 100%;
        border-collapse: collapse;
    }
    
    .admin-table th,
    .admin-table td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .admin-table th {
        background: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
    }
    
    .admin-table button {
        padding: 5px 10px;
        border: none;
        border-radius: 3px;
        background: #3498db;
        color: white;
        cursor: pointer;
        font-size: 0.9rem;
    }
    
    .admin-table button:hover {
        opacity: 0.8;
    }
    
    .bracket-container {
        overflow-x: auto;
        padding: 20px;
    }
    
    .bracket-rounds {
        display: flex;
        gap: 50px;
        align-items: flex-start;
    }
    
    .bracket-round {
        display: flex;
        flex-direction: column;
        gap: 20px;
        min-width: 200px;
    }
    
    .bracket-round h4 {
        text-align: center;
        color: #e74c3c;
        margin-bottom: 20px;
    }
    
    .match {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        padding: 15px;
        border: 1px solid rgba(231, 76, 60, 0.3);
    }
    
    .match .team {
        padding: 8px 0;
        color: #fff;
        font-weight: 500;
    }
    
    .match .vs {
        text-align: center;
        color: #e74c3c;
        font-weight: bold;
        padding: 5px 0;
    }
    
    .final .match {
        border: 2px solid #f39c12;
        background: rgba(243, 156, 18, 0.1);
    }
    
    .nav-menu.active {
        display: flex !important;
        flex-direction: column;
        position: absolute;
        top: 70px;
        left: 0;
        width: 100%;
        background: rgba(0, 0, 0, 0.95);
        padding: 20px;
    }
    
    .hamburger.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }
    
    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }
    
    .hamburger.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }
`;
document.head.appendChild(style);

// Payment Integration (Mock)
function processPayment(tournamentId, amount) {
    // Mock payment processing
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true, transactionId: 'TXN' + Date.now() });
        }, 2000);
    });
}

// Real-time updates simulation
function simulateRealTimeUpdates() {
    setInterval(() => {
        // Randomly update team scores
        if (Math.random() > 0.95) {
            const randomTeam = FragsHub.teams[Math.floor(Math.random() * FragsHub.teams.length)];
            if (Math.random() > 0.5) {
                randomTeam.wins++;
                randomTeam.points += 50;
            } else {
                randomTeam.losses++;
                randomTeam.points = Math.max(0, randomTeam.points - 20);
            }
            generateLeaderboard();
            loadLeaderboard();
            saveData();
        }
    }, 10000); // Update every 10 seconds
}

// Tournament Bracket System
function generateTournamentBracket(tournamentId) {
    const tournament = mockData.tournaments.find(t => t.id === tournamentId);
    if (!tournament || tournament.status !== 'active') {
        alert('Tournament is not active or does not exist');
        return;
    }

    // Get registered teams for this tournament
    const tournamentTeams = mockData.teams.filter(t => 
        t.tournaments.includes(tournamentId) && t.status === 'approved'
    );

    if (tournamentTeams.length < 2) {
        alert('Not enough teams registered for bracket generation');
        return;
    }

    // Generate bracket structure
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(tournamentTeams.length)));
    const bracket = {
        id: `bracket_${tournamentId}_${Date.now()}`,
        tournamentId: tournamentId,
        teams: tournamentTeams,
        rounds: []
    };

    // Create initial round
    const initialRound = {
        roundNumber: 1,
        matches: []
    };

    // Shuffle teams for random seeding
    const shuffledTeams = [...tournamentTeams].sort(() => Math.random() - 0.5);
    
    // Create matches for first round
    for (let i = 0; i < shuffledTeams.length; i += 2) {
        const match = {
            id: `match_${Date.now()}_${i}`,
            team1: shuffledTeams[i],
            team2: shuffledTeams[i + 1] || null, // Handle odd number of teams
            winner: null,
            score: null,
            status: 'scheduled'
        };
        initialRound.matches.push(match);
    }

    bracket.rounds.push(initialRound);

    // Generate subsequent rounds
    let currentRoundTeams = shuffledTeams.length;
    let roundNumber = 2;
    
    while (currentRoundTeams > 1) {
        currentRoundTeams = Math.ceil(currentRoundTeams / 2);
        if (currentRoundTeams === 1) break;
        
        const round = {
            roundNumber: roundNumber,
            matches: []
        };
        
        for (let i = 0; i < currentRoundTeams / 2; i++) {
            const match = {
                id: `match_${Date.now()}_${roundNumber}_${i}`,
                team1: null, // Will be filled as previous rounds complete
                team2: null,
                winner: null,
                score: null,
                status: 'pending'
            };
            round.matches.push(match);
        }
        
        bracket.rounds.push(round);
        roundNumber++;
    }

    // Store bracket in mockData
    if (!mockData.brackets) mockData.brackets = [];
    mockData.brackets.push(bracket);
    
    // Update tournament status
    tournament.bracketGenerated = true;
    tournament.currentRound = 1;
    
    alert('Tournament bracket generated successfully!');
    if (currentView === 'admin') {
        showAdminContent('tournaments');
    }
}

function getBracketHTML(tournamentId) {
    const bracket = mockData.brackets?.find(b => b.tournamentId === tournamentId);
    if (!bracket) {
        return '<p>No bracket generated yet</p>';
    }

    let html = `
        <div class="bracket-container">
            <h4>Tournament Bracket</h4>
            <div class="bracket-rounds">
    `;

    bracket.rounds.forEach((round, roundIndex) => {
        html += `
            <div class="bracket-round">
                <h5>Round ${round.roundNumber}</h5>
                <div class="round-matches">
        `;

        round.matches.forEach(match => {
            const team1Name = match.team1?.name || 'TBD';
            const team2Name = match.team2?.name || 'TBD';
            const winnerClass = match.winner ? 'completed' : match.status;
            
            html += `
                <div class="bracket-match ${winnerClass}">
                    <div class="match-team ${match.winner?.id === match.team1?.id ? 'winner' : ''}">
                        ${team1Name}
                    </div>
                    <div class="match-vs">VS</div>
                    <div class="match-team ${match.winner?.id === match.team2?.id ? 'winner' : ''}">
                        ${team2Name}
                    </div>
                    ${match.score ? `<div class="match-score">${match.score}</div>` : ''}
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    return html;
}

function showTournamentBracket(tournamentId) {
    const modal = document.getElementById('adminModal');
    const title = document.getElementById('adminModalTitle');
    const body = document.getElementById('adminModalBody');
    
    title.textContent = 'Tournament Bracket';
    body.innerHTML = getBracketHTML(tournamentId);
    
    modal.style.display = 'block';
}

function simulateMatchResult(matchId, winner, score) {
    const bracket = mockData.brackets?.find(b => 
        b.rounds.some(round => round.matches.some(match => match.id === matchId))
    );
    
    if (!bracket) return;
    
    // Find and update the match
    bracket.rounds.forEach(round => {
        const match = round.matches.find(m => m.id === matchId);
        if (match) {
            match.winner = winner;
            match.score = score;
            match.status = 'completed';
            
            // Advance winner to next round if exists
            const nextRound = bracket.rounds.find(r => r.roundNumber === round.roundNumber + 1);
            if (nextRound) {
                // Logic to advance team to next round
                // This would be more complex in a real implementation
            }
        }
    });
}

function showPaymentModal(teamId, tournamentId, amount) {
    const modal = document.getElementById('adminModal');
    const title = document.getElementById('adminModalTitle');
    const body = document.getElementById('adminModalBody');
    
    title.textContent = 'Complete Payment';
    body.innerHTML = `
        <div class="payment-modal">
            <div class="payment-header">
                <h4>Tournament Registration Fee</h4>
                <div class="payment-amount">₹${amount}</div>
            </div>
            
            <div class="payment-details">
                <div class="payment-item">
                    <span>Registration Fee:</span>
                    <span>₹${amount - 50}</span>
                </div>
                <div class="payment-item">
                    <span>Platform Fee:</span>
                    <span>₹50</span>
                </div>
                <div class="payment-total">
                    <span>Total Amount:</span>
                    <span>₹${amount}</span>
                </div>
            </div>
            
            <div class="payment-methods">
                <h5>Payment Methods</h5>
                <div class="payment-options">
                    <div class="payment-option selected" onclick="selectPaymentMethod('upi')">
                        <i class="fas fa-mobile-alt"></i>
                        <span>UPI / QR Code</span>
                    </div>
                    <div class="payment-option" onclick="selectPaymentMethod('card')">
                        <i class="fas fa-credit-card"></i>
                        <span>Credit/Debit Card</span>
                    </div>
                    <div class="payment-option" onclick="selectPaymentMethod('netbanking')">
                        <i class="fas fa-university"></i>
                        <span>Net Banking</span>
                    </div>
                    <div class="payment-option" onclick="selectPaymentMethod('wallet')">
                        <i class="fas fa-wallet"></i>
                        <span>Digital Wallet</span>
                    </div>
                </div>
            </div>
            
            <div class="payment-actions">
                <button class="cancel-payment" onclick="closeModal()">Cancel</button>
                <button class="proceed-payment" onclick="processPayment('${teamId}', '${tournamentId}', ${amount})">
                    <i class="fas fa-lock"></i>
                    Pay Securely
                </button>
            </div>
            
            <div class="payment-security">
                <i class="fas fa-shield-alt"></i>
                <span>Your payment is secured by 256-bit SSL encryption</span>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function selectPaymentMethod(method) {
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });
    event.target.closest('.payment-option').classList.add('selected');
}

function processPayment(teamId, tournamentId, amount) {
    const paymentButton = document.querySelector('.proceed-payment');
    paymentButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    paymentButton.disabled = true;
    
    // Simulate payment processing
    setTimeout(() => {
        initializeRazorpayPayment(amount, teamId, tournamentId);
        closeModal();
    }, 2000);
}
    // Mock Razorpay integration
    const paymentData = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        receipt: `receipt_${teamId}_${tournamentId}_${Date.now()}`,
        payment_capture: 1
    };

    // Simulate payment process
    setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate
        
        if (success) {
            // Update team payment status
            const team = mockData.teams.find(t => t.id === teamId);
            if (team) {
                team.paymentStatus = 'paid';
                team.paymentDate = new Date().toISOString();
            }
            
            // Add payment record
            if (!mockData.payments) mockData.payments = [];
            mockData.payments.push({
                id: `payment_${Date.now()}`,
                teamId: teamId,
                tournamentId: tournamentId,
                amount: amount,
                status: 'completed',
                timestamp: new Date().toISOString(),
                paymentMethod: 'razorpay'
            });
            
            alert('Payment successful! Your team registration is now complete.');
        } else {
            alert('Payment failed. Please try again.');
        }
        
        // Refresh UI
        if (currentView === 'teams') {
            showContent('teams');
        } else if (currentView === 'admin') {
            showAdminContent('teams');
        }
    }, 2000);
}

// Page HTML Generators
function getTournamentsPageHTML() {
    return `
        <div class="page-container">
            <div class="page-header">
                <h2>Active Tournaments</h2>
                <p>Join exciting esports tournaments and compete for amazing prizes</p>
            </div>
            
            <div class="tournaments-grid" id="tournamentsGrid">
                <!-- Tournaments will be loaded here -->
            </div>
            
            <div class="tournaments-filters">
                <div class="filter-group">
                    <label>Game:</label>
                    <select id="gameFilter">
                        <option value="">All Games</option>
                        <option value="VALORANT">VALORANT</option>
                        <option value="CS2">Counter-Strike 2</option>
                        <option value="PUBG">PUBG Mobile</option>
                        <option value="APEX">Apex Legends</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Status:</label>
                    <select id="statusFilter">
                        <option value="">All Status</option>
                        <option value="active">Registration Open</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Prize Range:</label>
                    <select id="prizeFilter">
                        <option value="">Any Prize</option>
                        <option value="low">Under ₹10,000</option>
                        <option value="medium">₹10,000 - ₹50,000</option>
                        <option value="high">Above ₹50,000</option>
                    </select>
                </div>
            </div>
        </div>
    `;
}

function getTeamsPageHTML() {
    return `
        <div class="page-container">
            <div class="page-header">
                <h2>Teams</h2>
                <p>Discover and join competitive esports teams</p>
                <div class="page-actions">
                    <button class="btn-primary" onclick="showTeamRegistration()">
                        <i class="fas fa-plus"></i> Create Team
                    </button>
                </div>
            </div>
            
            <div class="teams-tabs">
                <div class="tab active" onclick="switchTeamsTab('all')">All Teams</div>
                <div class="tab" onclick="switchTeamsTab('my')">My Teams</div>
                <div class="tab" onclick="switchTeamsTab('invitations')">Invitations</div>
            </div>
            
            <div class="teams-content">
                <div id="teamsGrid" class="teams-grid">
                    <!-- Teams will be loaded here -->
                </div>
            </div>
        </div>
    `;
}

function getLeaderboardPageHTML() {
    return `
        <div class="page-container">
            <div class="page-header">
                <h2>Leaderboard</h2>
                <p>Top performing teams and players across all tournaments</p>
            </div>
            
            <div class="leaderboard-tabs">
                <div class="tab active" onclick="switchLeaderboardTab('teams')">Team Rankings</div>
                <div class="tab" onclick="switchLeaderboardTab('players')">Player Rankings</div>
                <div class="tab" onclick="switchLeaderboardTab('tournaments')">Tournament Winners</div>
            </div>
            
            <div class="leaderboard-content">
                <div id="leaderboardTable" class="leaderboard-table">
                    <!-- Leaderboard will be loaded here -->
                </div>
            </div>
        </div>
    `;
}

function getAboutPageHTML() {
    return `
        <div class="page-container">
            <div class="page-header">
                <h2>About FragsHub</h2>
                <p>The ultimate destination for competitive esports tournaments</p>
            </div>
            
            <div class="about-content">
                <div class="about-section">
                    <h3>Our Mission</h3>
                    <p>FragsHub is dedicated to providing the best competitive gaming experience for esports enthusiasts. We organize professional tournaments with fair play, exciting prizes, and a community-driven approach.</p>
                </div>
                
                <div class="about-section">
                    <h3>What We Offer</h3>
                    <div class="features-grid">
                        <div class="feature-card">
                            <i class="fas fa-trophy"></i>
                            <h4>Professional Tournaments</h4>
                            <p>Organized competitions with substantial prize pools and professional oversight</p>
                        </div>
                        <div class="feature-card">
                            <i class="fas fa-users"></i>
                            <h4>Team Management</h4>
                            <p>Complete team creation, management, and collaboration tools</p>
                        </div>
                        <div class="feature-card">
                            <i class="fas fa-chart-line"></i>
                            <h4>Performance Tracking</h4>
                            <p>Detailed statistics and performance analytics for teams and players</p>
                        </div>
                        <div class="feature-card">
                            <i class="fas fa-shield-alt"></i>
                            <h4>Secure Payments</h4>
                            <p>Safe and secure payment processing for all transactions</p>
                        </div>
                    </div>
                </div>
                
                <div class="about-section">
                    <h3>Contact Us</h3>
                    <div class="contact-info">
                        <div class="contact-item">
                            <i class="fas fa-envelope"></i>
                            <span>support@fragshub.com</span>
                        </div>
                        <div class="contact-item">
                            <i class="fas fa-phone"></i>
                            <span>+1 (555) 123-4567</span>
                        </div>
                        <div class="contact-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>123 Gaming Street, Esports City, EC 12345</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getProfilePageHTML() {
    const user = currentUser;
    return `
        <div class="page-container">
            <div class="page-header">
                <h2>My Profile</h2>
                <p>Manage your account settings and gaming preferences</p>
            </div>
            
            <div class="profile-content">
                <div class="profile-sidebar">
                    <div class="profile-avatar">
                        <img src="https://via.placeholder.com/120/667eea/ffffff?text=${user.name.charAt(0)}" alt="Profile">
                        <button class="change-avatar">Change Photo</button>
                    </div>
                    
                    <div class="profile-stats">
                        <div class="stat">
                            <span class="stat-value">12</span>
                            <span class="stat-label">Tournaments</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">8</span>
                            <span class="stat-label">Wins</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">₹25,000</span>
                            <span class="stat-label">Earnings</span>
                        </div>
                    </div>
                </div>
                
                <div class="profile-main">
                    <div class="profile-section">
                        <h3>Personal Information</h3>
                        <form class="profile-form">
                            <div class="form-group">
                                <label>Display Name</label>
                                <input type="text" value="${user.name}" id="profileName">
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" value="${user.email}" id="profileEmail">
                            </div>
                            <div class="form-group">
                                <label>Gaming Handle</label>
                                <input type="text" value="${user.gamingHandle || user.name}" id="gamingHandle">
                            </div>
                            <div class="form-group">
                                <label>Preferred Games</label>
                                <select multiple id="preferredGames">
                                    <option value="VALORANT">VALORANT</option>
                                    <option value="CS2">Counter-Strike 2</option>
                                    <option value="PUBG">PUBG Mobile</option>
                                    <option value="APEX">Apex Legends</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    
                    <div class="profile-section">
                        <h3>Account Settings</h3>
                        <div class="settings-options">
                            <div class="setting-item">
                                <span>Email Notifications</span>
                                <label class="switch">
                                    <input type="checkbox" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <div class="setting-item">
                                <span>Tournament Reminders</span>
                                <label class="switch">
                                    <input type="checkbox" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <div class="setting-item">
                                <span>Team Invitations</span>
                                <label class="switch">
                                    <input type="checkbox" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-actions">
                        <button class="btn-primary" onclick="saveProfile()">Save Changes</button>
                        <button class="btn-secondary" onclick="changePassword()">Change Password</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getTeamRegistrationHTML() {
    return `
        <div class="page-container">
            <div class="page-header">
                <h2>Create New Team</h2>
                <p>Start your esports journey by creating a competitive team</p>
            </div>
            
            <div class="team-registration-content">
                <form class="team-form" id="teamRegistrationForm">
                    <div class="form-section">
                        <h3>Team Information</h3>
                        <div class="form-group">
                            <label>Team Name *</label>
                            <input type="text" id="teamName" required placeholder="Enter your team name">
                        </div>
                        <div class="form-group">
                            <label>Team Tag *</label>
                            <input type="text" id="teamTag" required placeholder="3-5 character tag" maxlength="5">
                        </div>
                        <div class="form-group">
                            <label>Primary Game *</label>
                            <select id="primaryGame" required>
                                <option value="">Select a game</option>
                                <option value="VALORANT">VALORANT</option>
                                <option value="CS2">Counter-Strike 2</option>
                                <option value="PUBG">PUBG Mobile</option>
                                <option value="APEX">Apex Legends</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Team Description</label>
                            <textarea id="teamDescription" placeholder="Tell us about your team..."></textarea>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>Team Members</h3>
                        <div class="members-list" id="membersList">
                            <div class="member-item captain">
                                <i class="fas fa-crown"></i>
                                <span>${currentUser.name} (Captain)</span>
                            </div>
                        </div>
                        <div class="add-member">
                            <input type="email" id="memberEmail" placeholder="Enter member email">
                            <button type="button" onclick="addTeamMember()">Add Member</button>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="router.navigate('teams')">Cancel</button>
                        <button type="submit" class="btn-primary">Create Team</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function getMyTeamsHTML() {
    return `
        <div class="page-container">
            <div class="page-header">
                <h2>My Teams</h2>
                <p>Manage your teams and view performance statistics</p>
                <div class="page-actions">
                    <button class="btn-primary" onclick="showTeamRegistration()">
                        <i class="fas fa-plus"></i> Create Team
                    </button>
                </div>
            </div>
            
            <div class="my-teams-content">
                <div class="teams-tabs">
                    <div class="tab active" onclick="switchMyTeamsTab('owned')">Teams I Own</div>
                    <div class="tab" onclick="switchMyTeamsTab('member')">Teams I'm In</div>
                    <div class="tab" onclick="switchMyTeamsTab('invites')">Invitations</div>
                </div>
                
                <div id="myTeamsGrid" class="teams-grid">
                    <!-- Teams will be loaded here -->
                </div>
            </div>
        </div>
    `;
}

function getPaymentsHTML() {
    return `
        <div class="page-container">
            <div class="page-header">
                <h2>Payment History</h2>
                <p>View all your tournament payments and transactions</p>
            </div>
            
            <div class="payments-content">
                <div class="payment-summary">
                    <div class="summary-card">
                        <h3>Total Spent</h3>
                        <div class="amount">₹2,500</div>
                    </div>
                    <div class="summary-card">
                        <h3>Total Winnings</h3>
                        <div class="amount earnings">₹8,750</div>
                    </div>
                    <div class="summary-card">
                        <h3>Net Earnings</h3>
                        <div class="amount profit">₹6,250</div>
                    </div>
                </div>
                
                <div class="payments-table">
                    <h3>Recent Transactions</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Tournament</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="paymentsTableBody">
                            <!-- Payment history will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function getBracketPageHTML(tournamentId) {
    const tournament = mockData.tournaments.find(t => t.id === tournamentId);
    if (!tournament) {
        return `
            <div class="page-container">
                <div class="error-message">
                    <h3>Tournament not found</h3>
                    <p>The requested tournament bracket could not be loaded.</p>
                    <button class="btn-primary" onclick="router.navigate('tournaments')">Back to Tournaments</button>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="page-container">
            <div class="page-header">
                <h2>${tournament.name} - Bracket</h2>
                <p>Live tournament bracket and match results</p>
                <div class="tournament-info">
                    <span class="tournament-game">${tournament.game}</span>
                    <span class="tournament-prize">${tournament.prizePool}</span>
                    <span class="tournament-status ${tournament.status}">${tournament.status}</span>
                </div>
            </div>
            
            <div class="bracket-container">
                <div class="bracket-controls">
                    <button class="btn-secondary" onclick="refreshBracket('${tournamentId}')">
                        <i class="fas fa-sync-alt"></i> Refresh
                    </button>
                    <button class="btn-primary" onclick="downloadBracket('${tournamentId}')">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
                
                <div id="bracketDisplay" class="bracket-display">
                    <!-- Bracket will be loaded here -->
                </div>
            </div>
        </div>
    `;
}

// Page Initialization Functions
function initializeTournamentsPage() {
    loadTournaments();
    setupTournamentFilters();
}

function initializeTeamsPage() {
    loadTeams();
    setupTeamsTab();
}

function initializeLeaderboardPage() {
    loadLeaderboard('teams');
}

function initializeProfilePage() {
    setupProfileForm();
}

function initializeTeamRegistration() {
    setupTeamRegistrationForm();
}

function initializeMyTeamsPage() {
    loadMyTeams();
}

function initializePaymentsPage() {
    loadPaymentHistory();
}

function initializeBracketPage(tournamentId) {
    loadBracket(tournamentId);
}

// Tournament Page Functions
function loadTournaments() {
    const grid = document.getElementById('tournamentsGrid');
    if (!grid) return;
    
    let filteredTournaments = mockData.tournaments;
    
    // Apply filters
    const gameFilter = document.getElementById('gameFilter')?.value;
    const statusFilter = document.getElementById('statusFilter')?.value;
    const prizeFilter = document.getElementById('prizeFilter')?.value;
    
    if (gameFilter) {
        filteredTournaments = filteredTournaments.filter(t => t.game === gameFilter);
    }
    
    if (statusFilter) {
        filteredTournaments = filteredTournaments.filter(t => t.status === statusFilter);
    }
    
    if (prizeFilter) {
        filteredTournaments = filteredTournaments.filter(t => {
            const prize = parseInt(t.prizePool.replace(/[^0-9]/g, ''));
            switch (prizeFilter) {
                case 'low': return prize < 10000;
                case 'medium': return prize >= 10000 && prize <= 50000;
                case 'high': return prize > 50000;
                default: return true;
            }
        });
    }
    
    grid.innerHTML = filteredTournaments.map(tournament => `
        <div class="tournament-card">
            <div class="tournament-header">
                <h3>${tournament.name}</h3>
                <span class="tournament-game">${tournament.game}</span>
            </div>
            <div class="tournament-details">
                <div class="detail-item">
                    <i class="fas fa-trophy"></i>
                    <span>${tournament.prizePool}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-users"></i>
                    <span>${tournament.teams}/${tournament.maxTeams} teams</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-calendar"></i>
                    <span>${new Date(tournament.date).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="tournament-actions">
                <button class="btn-secondary" onclick="router.navigate('bracket', {tournamentId: '${tournament.id}'})">
                    View Bracket
                </button>
                ${tournament.status === 'active' ? 
                    `<button class="btn-primary" onclick="registerForTournament('${tournament.id}')">Register</button>` :
                    `<span class="status-badge ${tournament.status}">${tournament.status}</span>`
                }
            </div>
        </div>
    `).join('');
}

function setupTournamentFilters() {
    const gameFilter = document.getElementById('gameFilter');
    const statusFilter = document.getElementById('statusFilter');
    const prizeFilter = document.getElementById('prizeFilter');
    
    [gameFilter, statusFilter, prizeFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', loadTournaments);
        }
    });
}

// Teams Page Functions
function loadTeams() {
    const grid = document.getElementById('teamsGrid');
    if (!grid) return;
    
    grid.innerHTML = mockData.teams.map(team => `
        <div class="team-card">
            <div class="team-header">
                <h3>${team.name}</h3>
                <span class="team-tag">[${team.tag}]</span>
            </div>
            <div class="team-info">
                <div class="team-game">${team.game}</div>
                <div class="team-members">
                    <i class="fas fa-users"></i>
                    ${team.members.length} members
                </div>
                <div class="team-wins">
                    <i class="fas fa-trophy"></i>
                    ${team.wins || 0} wins
                </div>
            </div>
            <div class="team-actions">
                <button class="btn-secondary" onclick="viewTeamDetails('${team.id}')">View Details</button>
                <button class="btn-primary" onclick="requestToJoinTeam('${team.id}')">Request to Join</button>
            </div>
        </div>
    `).join('');
}

function setupTeamsTab() {
    // Default to all teams tab
    switchTeamsTab('all');
}

function switchTeamsTab(tab) {
    document.querySelectorAll('.teams-tabs .tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.teams-tabs .tab:nth-child(${tab === 'all' ? 1 : tab === 'my' ? 2 : 3})`).classList.add('active');
    
    switch (tab) {
        case 'all':
            loadTeams();
            break;
        case 'my':
            loadMyTeams();
            break;
        case 'invitations':
            loadTeamInvitations();
            break;
    }
}

// Leaderboard Functions
function loadLeaderboard(type) {
    const table = document.getElementById('leaderboardTable');
    if (!table) return;
    
    let data = [];
    let headers = [];
    
    switch (type) {
        case 'teams':
            headers = ['Rank', 'Team', 'Game', 'Wins', 'Tournaments', 'Prize Money'];
            data = mockData.teams
                .sort((a, b) => (b.wins || 0) - (a.wins || 0))
                .map((team, index) => [
                    index + 1,
                    `${team.name} [${team.tag}]`,
                    team.game,
                    team.wins || 0,
                    team.tournaments || 0,
                    `₹${team.earnings || 0}`
                ]);
            break;
        case 'players':
            headers = ['Rank', 'Player', 'Team', 'Wins', 'K/D Ratio', 'Prize Money'];
            // Mock player data
            data = [
                [1, 'ProGamer123', 'Team Alpha [ALPH]', 15, '2.4', '₹50,000'],
                [2, 'EliteShooter', 'Team Beta [BETA]', 12, '2.1', '₹35,000'],
                [3, 'CyberWarrior', 'Team Gamma [GAMM]', 10, '1.9', '₹25,000']
            ];
            break;
        case 'tournaments':
            headers = ['Rank', 'Tournament', 'Winner', 'Prize Pool', 'Date'];
            data = mockData.tournaments
                .filter(t => t.status === 'completed')
                .map((tournament, index) => [
                    index + 1,
                    tournament.name,
                    tournament.winner || 'TBD',
                    tournament.prizePool,
                    new Date(tournament.date).toLocaleDateString()
                ]);
            break;
    }
    
    table.innerHTML = `
        <table>
            <thead>
                <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
                ${data.map(row => `
                    <tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function switchLeaderboardTab(type) {
    document.querySelectorAll('.leaderboard-tabs .tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    loadLeaderboard(type);
}

// Profile Functions
function setupProfileForm() {
    // Setup form validation and handlers
    const form = document.querySelector('.profile-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveProfile();
        });
    }
}

function saveProfile() {
    const name = document.getElementById('profileName')?.value;
    const email = document.getElementById('profileEmail')?.value;
    const gamingHandle = document.getElementById('gamingHandle')?.value;
    
    if (name) currentUser.name = name;
    if (email) currentUser.email = email;
    if (gamingHandle) currentUser.gamingHandle = gamingHandle;
    
    alert('Profile updated successfully!');
}

function changePassword() {
    const modal = document.getElementById('adminModal');
    const title = document.getElementById('adminModalTitle');
    const body = document.getElementById('adminModalBody');
    
    title.textContent = 'Change Password';
    body.innerHTML = `
        <form class="password-form">
            <div class="form-group">
                <label>Current Password</label>
                <input type="password" id="currentPassword" required>
            </div>
            <div class="form-group">
                <label>New Password</label>
                <input type="password" id="newPassword" required>
            </div>
            <div class="form-group">
                <label>Confirm New Password</label>
                <input type="password" id="confirmPassword" required>
            </div>
            <div class="form-actions">
                <button type="button" onclick="closeModal()">Cancel</button>
                <button type="submit">Update Password</button>
            </div>
        </form>
    `;
    
    modal.style.display = 'block';
}

// Team Registration Functions
function setupTeamRegistrationForm() {
    const form = document.getElementById('teamRegistrationForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            createTeam();
        });
    }
}

function addTeamMember() {
    const email = document.getElementById('memberEmail')?.value;
    if (!email) return;
    
    const membersList = document.getElementById('membersList');
    const memberDiv = document.createElement('div');
    memberDiv.className = 'member-item';
    memberDiv.innerHTML = `
        <span>${email}</span>
        <button type="button" onclick="removeMember(this)">Remove</button>
    `;
    
    membersList.appendChild(memberDiv);
    document.getElementById('memberEmail').value = '';
}

function removeMember(button) {
    button.parentElement.remove();
}

function createTeam() {
    const teamName = document.getElementById('teamName')?.value;
    const teamTag = document.getElementById('teamTag')?.value;
    const primaryGame = document.getElementById('primaryGame')?.value;
    const description = document.getElementById('teamDescription')?.value;
    
    if (!teamName || !teamTag || !primaryGame) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Create new team
    const newTeam = {
        id: `team_${Date.now()}`,
        name: teamName,
        tag: teamTag,
        game: primaryGame,
        description: description,
        captain: currentUser.id,
        members: [currentUser.id],
        wins: 0,
        tournaments: 0,
        earnings: 0,
        createdAt: new Date().toISOString()
    };
    
    mockData.teams.push(newTeam);
    alert('Team created successfully!');
    router.navigate('teams');
}

// My Teams Functions
function loadMyTeams() {
    const grid = document.getElementById('myTeamsGrid');
    if (!grid) return;
    
    const myTeams = mockData.teams.filter(team => 
        team.captain === currentUser.id || team.members.includes(currentUser.id)
    );
    
    grid.innerHTML = myTeams.map(team => `
        <div class="team-card owned">
            <div class="team-header">
                <h3>${team.name}</h3>
                <span class="team-tag">[${team.tag}]</span>
                ${team.captain === currentUser.id ? '<i class="fas fa-crown captain-badge"></i>' : ''}
            </div>
            <div class="team-info">
                <div class="team-game">${team.game}</div>
                <div class="team-stats">
                    <span>${team.wins || 0} wins</span>
                    <span>${team.tournaments || 0} tournaments</span>
                    <span>₹${team.earnings || 0} earned</span>
                </div>
            </div>
            <div class="team-actions">
                <button class="btn-secondary" onclick="manageTeam('${team.id}')">Manage</button>
                <button class="btn-primary" onclick="viewTeamDetails('${team.id}')">View Details</button>
            </div>
        </div>
    `).join('');
}

function switchMyTeamsTab(tab) {
    document.querySelectorAll('.teams-tabs .tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    switch (tab) {
        case 'owned':
            loadMyTeams();
            break;
        case 'member':
            loadMemberTeams();
            break;
        case 'invites':
            loadTeamInvitations();
            break;
    }
}

// Payment Functions
function loadPaymentHistory() {
    const tbody = document.getElementById('paymentsTableBody');
    if (!tbody) return;
    
    // Mock payment history
    const payments = [
        {
            date: '2024-01-15',
            tournament: 'VALORANT Champions Cup',
            type: 'Registration Fee',
            amount: '₹500',
            status: 'completed'
        },
        {
            date: '2024-01-10',
            tournament: 'CS2 Winter Championship',
            type: 'Registration Fee',
            amount: '₹750',
            status: 'completed'
        },
        {
            date: '2024-01-05',
            tournament: 'PUBG Mobile Masters',
            type: 'Prize Winning',
            amount: '+₹2,500',
            status: 'completed'
        }
    ];
    
    tbody.innerHTML = payments.map(payment => `
        <tr>
            <td>${payment.date}</td>
            <td>${payment.tournament}</td>
            <td>${payment.type}</td>
            <td class="${payment.amount.startsWith('+') ? 'earning' : ''}">${payment.amount}</td>
            <td><span class="status-badge ${payment.status}">${payment.status}</span></td>
            <td>
                <button class="btn-link" onclick="downloadReceipt('${payment.date}')">
                    <i class="fas fa-download"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Bracket Functions
function loadBracket(tournamentId) {
    const display = document.getElementById('bracketDisplay');
    if (!display) return;
    
    display.innerHTML = getBracketHTML(tournamentId);
}

function refreshBracket(tournamentId) {
    loadBracket(tournamentId);
    alert('Bracket refreshed!');
}

function downloadBracket(tournamentId) {
    alert('Bracket download started!');
}

// Utility Functions
function registerForTournament(tournamentId) {
    if (!currentUser.isLoggedIn) {
        showAuthModal('login');
        return;
    }
    
    // Show team selection for tournament registration
    const modal = document.getElementById('adminModal');
    const title = document.getElementById('adminModalTitle');
    const body = document.getElementById('adminModalBody');
    
    const userTeams = mockData.teams.filter(team => 
        team.captain === currentUser.id || team.members.includes(currentUser.id)
    );
    
    title.textContent = 'Register for Tournament';
    body.innerHTML = `
        <div class="tournament-registration">
            <h4>Select a team to register:</h4>
            <div class="teams-selection">
                ${userTeams.map(team => `
                    <div class="team-option" onclick="selectTeamForTournament('${team.id}', '${tournamentId}')">
                        <h5>${team.name} [${team.tag}]</h5>
                        <p>${team.game} - ${team.members.length} members</p>
                    </div>
                `).join('')}
            </div>
            ${userTeams.length === 0 ? 
                '<p>You need to create or join a team first. <a href="#" onclick="closeModal(); showTeamRegistration();">Create Team</a></p>' : 
                ''
            }
        </div>
    `;
    
    modal.style.display = 'block';
}

function selectTeamForTournament(teamId, tournamentId) {
    closeModal();
    showPaymentModal(teamId, tournamentId, 500); // Default registration fee
}

function viewTeamDetails(teamId) {
    const team = mockData.teams.find(t => t.id === teamId);
    if (!team) return;
    
    const modal = document.getElementById('adminModal');
    const title = document.getElementById('adminModalTitle');
    const body = document.getElementById('adminModalBody');
    
    title.textContent = `${team.name} [${team.tag}]`;
    body.innerHTML = `
        <div class="team-details">
            <div class="team-info">
                <h4>Team Information</h4>
                <p><strong>Game:</strong> ${team.game}</p>
                <p><strong>Description:</strong> ${team.description || 'No description available'}</p>
                <p><strong>Created:</strong> ${new Date(team.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
            
            <div class="team-stats">
                <h4>Statistics</h4>
                <div class="stats-grid">
                    <div class="stat">
                        <span class="stat-value">${team.wins || 0}</span>
                        <span class="stat-label">Wins</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${team.tournaments || 0}</span>
                        <span class="stat-label">Tournaments</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">₹${team.earnings || 0}</span>
                        <span class="stat-label">Earnings</span>
                    </div>
                </div>
            </div>
            
            <div class="team-members">
                <h4>Members</h4>
                <div class="members-list">
                    ${team.members.map(memberId => {
                        const member = mockData.users?.find(u => u.id === memberId) || 
                                     { name: memberId === currentUser.id ? currentUser.name : 'Player' };
                        const isCaptain = team.captain === memberId;
                        return `
                            <div class="member-item ${isCaptain ? 'captain' : ''}">
                                ${isCaptain ? '<i class="fas fa-crown"></i>' : '<i class="fas fa-user"></i>'}
                                <span>${member.name}${isCaptain ? ' (Captain)' : ''}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function requestToJoinTeam(teamId) {
    if (!currentUser.isLoggedIn) {
        showAuthModal('login');
        return;
    }
    
    alert('Join request sent! The team captain will be notified.');
}

function manageTeam(teamId) {
    const team = mockData.teams.find(t => t.id === teamId);
    if (!team || team.captain !== currentUser.id) {
        alert('You can only manage teams you own.');
        return;
    }
    
    // Navigate to team management page (would be implemented)
    alert('Team management interface would open here.');
}

function downloadReceipt(date) {
    alert(`Downloading receipt for ${date}...`);
}

// Google Sheets Export Functions
function showExportModal() {
    const modal = document.getElementById('adminModal');
    const title = document.getElementById('adminModalTitle');
    const body = document.getElementById('adminModalBody');
    
    title.textContent = 'Export Data Options';
    body.innerHTML = `
        <div class="export-modal">
            <h4>Choose Export Format</h4>
            
            <div class="export-options">
                <div class="export-option" onclick="exportToCSV()">
                    <i class="fas fa-file-csv"></i>
                    <h5>Export to CSV</h5>
                    <p>Download teams data as CSV file</p>
                </div>
                
                <div class="export-option" onclick="showGoogleSheetsForm()">
                    <i class="fab fa-google"></i>
                    <h5>Export to Google Sheets</h5>
                    <p>Export directly to Google Spreadsheet</p>
                </div>
                
                <div class="export-option" onclick="exportToJSON()">
                    <i class="fas fa-code"></i>
                    <h5>Export to JSON</h5>
                    <p>Download raw data as JSON file</p>
                </div>
            </div>
            
            <div class="export-actions">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function showGoogleSheetsForm() {
    const modal = document.getElementById('adminModal');
    const title = document.getElementById('adminModalTitle');
    const body = document.getElementById('adminModalBody');
    
    title.textContent = 'Export to Google Sheets';
    body.innerHTML = `
        <div class="google-sheets-form">
            <h4>Google Sheets Export Configuration</h4>
            
            <div class="form-group">
                <label>Google Spreadsheet ID *</label>
                <input type="text" id="spreadsheetId" value="${CONFIG.DEFAULT_SPREADSHEET_ID}" placeholder="Enter Google Spreadsheet ID">
                <small>Find this in your Google Sheets URL: docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit</small>
            </div>
            
            <div class="export-options">
                <h5>Select Data to Export:</h5>
                <div class="checkbox-group">
                    <label>
                        <input type="checkbox" id="exportTeams" checked>
                        Teams Data
                    </label>
                    <label>
                        <input type="checkbox" id="exportTournaments">
                        Tournaments Data
                    </label>
                    <label>
                        <input type="checkbox" id="exportPayments">
                        Payments Data
                    </label>
                    <label>
                        <input type="checkbox" id="exportAll">
                        All Data (Separate Sheets)
                    </label>
                </div>
            </div>
            
            <div class="form-group">
                <label>Sheet Name (for single export)</label>
                <input type="text" id="sheetName" value="FragsHub Teams Data" placeholder="Sheet name">
            </div>
            
            <div class="export-warning">
                <i class="fas fa-info-circle"></i>
                <p>Make sure you have edit permissions on the Google Spreadsheet. The data will be exported to the specified sheet.</p>
            </div>
            
            <div class="export-actions">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn-primary" onclick="executeGoogleSheetsExport()">
                    <i class="fab fa-google"></i> Export to Sheets
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

async function executeGoogleSheetsExport() {
    const spreadsheetId = document.getElementById('spreadsheetId')?.value;
    const sheetName = document.getElementById('sheetName')?.value || 'FragsHub Data';
    const exportTeams = document.getElementById('exportTeams')?.checked;
    const exportTournaments = document.getElementById('exportTournaments')?.checked;
    const exportPayments = document.getElementById('exportPayments')?.checked;
    const exportAll = document.getElementById('exportAll')?.checked;
    
    if (!spreadsheetId) {
        alert('Please enter a Google Spreadsheet ID');
        return;
    }
    
    showExportProgress('Preparing export...');
    
    try {
        let result;
        
        if (exportAll) {
            updateExportProgress('Exporting all data to multiple sheets...', 25);
            result = await api.exportAllToGoogleSheets(spreadsheetId);
        } else if (exportTeams) {
            updateExportProgress('Exporting teams data...', 50);
            result = await api.exportTeamsToGoogleSheets(spreadsheetId, sheetName);
        } else if (exportTournaments) {
            updateExportProgress('Exporting tournaments data...', 50);
            result = await api.exportTournamentsToGoogleSheets(spreadsheetId, sheetName);
        } else if (exportPayments) {
            updateExportProgress('Exporting payments data...', 50);
            result = await api.exportPaymentsToGoogleSheets(spreadsheetId, sheetName);
        } else {
            alert('Please select at least one data type to export');
            hideExportProgress();
            return;
        }
        
        updateExportProgress('Export completed successfully!', 100);
        
        setTimeout(() => {
            hideExportProgress();
            closeModal();
            showExportSuccessModal(result);
        }, 1500);
        
    } catch (error) {
        console.error('Export failed:', error);
        hideExportProgress();
        alert(`Export failed: ${error.message}`);
    }
}

function showExportSuccessModal(result) {
    const modal = document.getElementById('adminModal');
    const title = document.getElementById('adminModalTitle');
    const body = document.getElementById('adminModalBody');
    
    title.textContent = 'Export Successful!';
    body.innerHTML = `
        <div class="export-success">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            
            <h4>Data exported successfully!</h4>
            
            <div class="export-details">
                ${result.exports ? `
                    <h5>Exported Data:</h5>
                    <ul>
                        ${result.exports.map(exp => `
                            <li>${exp.type}: ${exp.exported || 'N/A'} records</li>
                        `).join('')}
                    </ul>
                ` : `
                    <p><strong>Exported:</strong> ${result.exportData?.exported || result.exported} records</p>
                    <p><strong>Sheet:</strong> ${result.exportData?.sheetName || result.sheetName}</p>
                `}
            </div>
            
            <div class="export-link">
                <a href="${result.spreadsheetUrl || result.exportData?.url || `https://docs.google.com/spreadsheets/d/${result.spreadsheetId || result.exportData?.spreadsheetId}/edit`}" 
                   target="_blank" class="btn-primary">
                    <i class="fas fa-external-link-alt"></i> Open Google Sheets
                </a>
            </div>
            
            <div class="export-actions">
                <button class="btn-secondary" onclick="closeModal()">Close</button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

async function exportToCSV() {
    try {
        showExportProgress('Generating CSV file...');
        updateExportProgress('Downloading teams data...', 50);
        
        const blob = await api.exportTeamsToCSV();
        
        updateExportProgress('Preparing download...', 75);
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fragshub-teams-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        updateExportProgress('Download started!', 100);
        
        setTimeout(() => {
            hideExportProgress();
            closeModal();
        }, 1500);
        
    } catch (error) {
        console.error('CSV export failed:', error);
        hideExportProgress();
        alert(`CSV export failed: ${error.message}`);
    }
}

function exportToJSON() {
    try {
        showExportProgress('Generating JSON file...');
        updateExportProgress('Preparing data...', 50);
        
        const data = {
            teams: mockData.teams,
            tournaments: mockData.tournaments,
            payments: mockData.payments,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
        
        updateExportProgress('Creating download...', 75);
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fragshub-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        updateExportProgress('Download started!', 100);
        
        setTimeout(() => {
            hideExportProgress();
            closeModal();
        }, 1500);
        
    } catch (error) {
        console.error('JSON export failed:', error);
        hideExportProgress();
        alert(`JSON export failed: ${error.message}`);
    }
}

function showExportProgress(message) {
    const statusDiv = document.getElementById('exportStatus');
    if (statusDiv) {
        statusDiv.style.display = 'block';
        statusDiv.querySelector('.status-message').textContent = message;
        statusDiv.querySelector('.progress-fill').style.width = '0%';
    }
}

function updateExportProgress(message, percentage) {
    const statusDiv = document.getElementById('exportStatus');
    if (statusDiv) {
        statusDiv.querySelector('.status-message').textContent = message;
        statusDiv.querySelector('.progress-fill').style.width = `${percentage}%`;
    }
}

function hideExportProgress() {
    const statusDiv = document.getElementById('exportStatus');
    if (statusDiv) {
        statusDiv.style.display = 'none';
    }
}

async function exportToGoogleSheets() {
    try {
        const spreadsheetId = prompt('Enter Google Spreadsheet ID:', CONFIG.DEFAULT_SPREADSHEET_ID);
        if (!spreadsheetId) return;
        
        showExportProgress('Exporting to Google Sheets...');
        updateExportProgress('Connecting to Google Sheets API...', 25);
        
        const result = await api.exportTeamsToGoogleSheets(spreadsheetId, 'FragsHub Teams');
        
        updateExportProgress('Export completed!', 100);
        
        setTimeout(() => {
            hideExportProgress();
            alert(`Export successful! ${result.exported} teams exported to Google Sheets.`);
            if (result.url) {
                window.open(result.url, '_blank');
            }
        }, 1500);
        
    } catch (error) {
        console.error('Google Sheets export failed:', error);
        hideExportProgress();
        alert(`Export failed: ${error.message}`);
    }
}

// Start real-time updates
setTimeout(() => {
    simulateRealTimeUpdates();
}, 5000);
