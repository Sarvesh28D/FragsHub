// Admin configuration and settings that can be edited from the dashboard
export const adminConfig = {
  // Tournament Settings
  tournament: {
    prizePool: 50000,
    currency: 'INR',
    registrationFee: 500,
    maxTeams: 32,
    teamSize: 5,
    tournamentName: 'FragsHub Championship 2025',
    description: 'The ultimate gaming tournament experience',
    startDate: '2025-08-15',
    endDate: '2025-08-17',
    registrationDeadline: '2025-08-10',
    status: 'upcoming' // upcoming, live, completed
  },
  
  // Prize Distribution
  prizeDistribution: [
    { position: 1, percentage: 50, amount: 25000 },
    { position: 2, percentage: 30, amount: 15000 },
    { position: 3, percentage: 15, amount: 7500 },
    { position: 4, percentage: 5, amount: 2500 }
  ],
  
  // Site Content
  content: {
    heroTitle: 'FRAGSHUB',
    heroSubtitle: 'The Ultimate Gaming Tournament Platform',
    aboutTitle: 'About FragsHub',
    aboutDescription: 'FragsHub is the premier destination for competitive gaming tournaments.',
    contactEmail: 'admin@fragshub.com',
    socialLinks: {
      discord: 'https://discord.gg/fragshub',
      youtube: 'https://youtube.com/fragshub',
      twitch: 'https://twitch.tv/fragshub'
    }
  },
  
  // Games Configuration
  games: [
    {
      id: 'valorant',
      name: 'Valorant',
      active: true,
      teamSize: 5,
      mapPool: ['Bind', 'Haven', 'Split', 'Ascent', 'Icebox', 'Breeze', 'Fracture']
    },
    {
      id: 'csgo',
      name: 'CS:GO',
      active: true,
      teamSize: 5,
      mapPool: ['Dust2', 'Mirage', 'Inferno', 'Cache', 'Overpass', 'Train', 'Nuke']
    }
  ],
  
  // Tournament Rules
  rules: [
    'All players must be present 15 minutes before match time',
    'No cheating or exploiting allowed',
    'Disputes will be resolved by tournament administrators',
    'All matches are best of 3 format',
    'Default win awarded after 15 minutes of no-show'
  ],
  
  // Payment Settings
  payment: {
    razorpayEnabled: true,
    paypalEnabled: false,
    bankTransferEnabled: true,
    refundPolicy: '48 hours before tournament start'
  }
};

// Function to update admin config
export const updateAdminConfig = (section, updates) => {
  // This would typically save to Firebase/database
  console.log('Updating admin config:', section, updates);
  return { ...adminConfig[section], ...updates };
};
