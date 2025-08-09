'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Star, TrendingUp, Users, Target, Zap } from 'lucide-react';

export default function LeaderboardPage() {
  const [selectedCategory, setSelectedCategory] = useState('overall');
  const [loading, setLoading] = useState(true);

  // Mock leaderboard data
  const leaderboardData = {
    overall: [
      { rank: 1, team: 'Team Alpha', points: 2850, wins: 28, losses: 5, winRate: 84.8, prize: 125000 },
      { rank: 2, team: 'Cyber Warriors', points: 2720, wins: 25, losses: 7, winRate: 78.1, prize: 98000 },
      { rank: 3, team: 'Digital Titans', points: 2650, wins: 24, losses: 8, winRate: 75.0, prize: 75000 },
      { rank: 4, team: 'Neon Squad', points: 2580, wins: 23, losses: 9, winRate: 71.9, prize: 50000 },
      { rank: 5, team: 'Phantom Elite', points: 2500, wins: 22, losses: 10, winRate: 68.8, prize: 35000 },
      { rank: 6, team: 'Storm Breakers', points: 2420, wins: 21, losses: 11, winRate: 65.6, prize: 25000 },
      { rank: 7, team: 'Void Hunters', points: 2350, wins: 20, losses: 12, winRate: 62.5, prize: 15000 },
      { rank: 8, team: 'Fusion Force', points: 2280, wins: 19, losses: 13, winRate: 59.4, prize: 10000 }
    ],
    valorant: [
      { rank: 1, team: 'Team Alpha', points: 1850, wins: 18, losses: 2, winRate: 90.0, prize: 75000 },
      { rank: 2, team: 'Cyber Warriors', points: 1720, wins: 16, losses: 4, winRate: 80.0, prize: 50000 },
      { rank: 3, team: 'Digital Titans', points: 1650, wins: 15, losses: 5, winRate: 75.0, prize: 30000 }
    ],
    cs2: [
      { rank: 1, team: 'Storm Breakers', points: 1920, wins: 19, losses: 1, winRate: 95.0, prize: 80000 },
      { rank: 2, team: 'Phantom Elite', points: 1800, wins: 17, losses: 3, winRate: 85.0, prize: 55000 },
      { rank: 3, team: 'Void Hunters', points: 1700, wins: 16, losses: 4, winRate: 80.0, prize: 35000 }
    ]
  };

  const categories = [
    { id: 'overall', name: 'Overall', icon: Trophy },
    { id: 'valorant', name: 'Valorant', icon: Target },
    { id: 'cs2', name: 'CS2', icon: Zap }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [selectedCategory]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-white">#{rank}</span>;
    }
  };

  const getRankGradient = (rank) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500/30 to-yellow-600/30 border-yellow-500/50';
      case 2:
        return 'from-gray-500/30 to-gray-600/30 border-gray-500/50';
      case 3:
        return 'from-amber-600/30 to-amber-700/30 border-amber-600/50';
      default:
        return 'from-purple-500/20 to-cyan-500/20 border-white/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Loading Leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-black text-white mb-4 tracking-wider">
            TEAM
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              LEADERBOARD
            </span>
          </h1>
          <p className="text-xl text-gray-300 font-medium">
            Top performing teams across all tournaments
          </p>
        </motion.div>

        {/* Category Selector */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg scale-105'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white backdrop-blur-xl border border-white/20'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Top 3 Podium */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leaderboardData[selectedCategory].slice(0, 3).map((team, index) => (
              <motion.div
                key={team.rank}
                className={`backdrop-blur-xl bg-gradient-to-br ${getRankGradient(team.rank)} rounded-2xl border p-6 text-center relative overflow-hidden`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="absolute top-4 right-4">
                  {getRankIcon(team.rank)}
                </div>
                
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-white mb-2">{team.team}</h3>
                  <div className="text-4xl font-black text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">
                    {team.points}
                  </div>
                  <p className="text-gray-300 text-sm">Points</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-green-400 font-semibold">{team.wins}W</p>
                    <p className="text-gray-400">Wins</p>
                  </div>
                  <div>
                    <p className="text-red-400 font-semibold">{team.losses}L</p>
                    <p className="text-gray-400">Losses</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-yellow-400 font-semibold">₹{team.prize.toLocaleString()}</p>
                  <p className="text-gray-400 text-sm">Prize Money</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Full Leaderboard Table */}
        <motion.div
          className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              Complete Rankings
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Rank</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Team</th>
                    <th className="text-center py-3 px-4 text-gray-300 font-semibold">Points</th>
                    <th className="text-center py-3 px-4 text-gray-300 font-semibold">W/L</th>
                    <th className="text-center py-3 px-4 text-gray-300 font-semibold">Win Rate</th>
                    <th className="text-center py-3 px-4 text-gray-300 font-semibold">Prize Money</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData[selectedCategory].map((team, index) => (
                    <motion.tr
                      key={team.rank}
                      className="border-b border-white/10 hover:bg-white/5 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 1 + index * 0.05 }}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {getRankIcon(team.rank)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-white font-semibold">{team.team}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">
                          {team.points}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-green-400 font-semibold">{team.wins}</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-red-400 font-semibold">{team.losses}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`font-semibold ${
                          team.winRate >= 80 ? 'text-green-400' :
                          team.winRate >= 60 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {team.winRate}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-yellow-400 font-semibold">
                          ₹{team.prize.toLocaleString()}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
