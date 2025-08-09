'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Calendar, MapPin, Clock, Eye } from 'lucide-react';
import BracketDisplay from '../../components/BracketDisplay';

export default function BracketPage() {
  const [selectedTournament, setSelectedTournament] = useState('valorant-championship-2025');
  const [loading, setLoading] = useState(true);

  // Mock tournament data
  const tournaments = [
    {
      id: 'valorant-championship-2025',
      name: 'Valorant Championship 2025',
      game: 'Valorant',
      status: 'live',
      startDate: '2025-08-15',
      endDate: '2025-08-17',
      prizePool: 50000,
      teams: 16,
      currentRound: 'Quarter Finals',
      location: 'Online',
      viewers: 12500
    },
    {
      id: 'cs2-masters',
      name: 'CS2 Masters',
      game: 'Counter-Strike 2',
      status: 'upcoming',
      startDate: '2025-09-01',
      endDate: '2025-09-03',
      prizePool: 75000,
      teams: 32,
      currentRound: 'Registration Open',
      location: 'Mumbai, India',
      viewers: 0
    }
  ];

  const currentTournament = tournaments.find(t => t.id === selectedTournament);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [selectedTournament]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Loading Tournament Bracket...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-black text-white mb-4 tracking-wider">
            TOURNAMENT
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              BRACKETS
            </span>
          </h1>
          <p className="text-xl text-gray-300 font-medium">
            Live tournament brackets and match results
          </p>
        </motion.div>

        {/* Tournament Selector */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-wrap gap-4 justify-center">
            {tournaments.map((tournament) => (
              <button
                key={tournament.id}
                onClick={() => setSelectedTournament(tournament.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  selectedTournament === tournament.id
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg scale-105'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white backdrop-blur-xl border border-white/20'
                }`}
              >
                {tournament.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tournament Info */}
        {currentTournament && (
          <motion.div
            className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-1">Prize Pool</h3>
                <p className="text-gray-300">₹{currentTournament.prizePool.toLocaleString()}</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-1">Teams</h3>
                <p className="text-gray-300">{currentTournament.teams} Teams</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-1">Current Round</h3>
                <p className="text-gray-300">{currentTournament.currentRound}</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-1">Live Viewers</h3>
                <p className="text-gray-300">{currentTournament.viewers.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bracket Display */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <BracketDisplay tournamentId={selectedTournament} />
        </motion.div>
      </div>
    </div>
  );
}
