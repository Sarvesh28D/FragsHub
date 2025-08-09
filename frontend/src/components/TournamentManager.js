'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Users, Trophy, Calendar, Clock, BarChart3, Settings, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export default function TournamentManager() {
  const [currentTournament, setCurrentTournament] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [bracketData, setBracketData] = useState(null);

  // Mock tournament data
  useEffect(() => {
    const mockTournament = {
      id: 'tournament-1',
      name: 'FragsHub Championship 2025',
      status: 'registration', // registration, live, completed
      game: 'Valorant',
      startDate: '2025-08-15',
      endDate: '2025-08-17',
      registeredTeams: 24,
      maxTeams: 32,
      prizePool: 50000,
      currentRound: 'Quarter Finals',
      bracket: generateMockBracket()
    };
    setCurrentTournament(mockTournament);
    setTournaments([mockTournament]);
  }, []);

  function generateMockBracket() {
    return {
      rounds: [
        {
          name: 'Round of 16',
          matches: Array.from({ length: 8 }, (_, i) => ({
            id: `r1-m${i + 1}`,
            team1: { name: `Team ${i * 2 + 1}`, score: Math.floor(Math.random() * 3) },
            team2: { name: `Team ${i * 2 + 2}`, score: Math.floor(Math.random() * 3) },
            status: 'completed',
            winner: Math.random() > 0.5 ? 'team1' : 'team2'
          }))
        },
        {
          name: 'Quarter Finals',
          matches: Array.from({ length: 4 }, (_, i) => ({
            id: `r2-m${i + 1}`,
            team1: { name: `QF Team ${i * 2 + 1}`, score: 0 },
            team2: { name: `QF Team ${i * 2 + 2}`, score: 0 },
            status: 'upcoming',
            winner: null
          }))
        },
        {
          name: 'Semi Finals',
          matches: Array.from({ length: 2 }, (_, i) => ({
            id: `r3-m${i + 1}`,
            team1: { name: 'TBD', score: 0 },
            team2: { name: 'TBD', score: 0 },
            status: 'pending',
            winner: null
          }))
        },
        {
          name: 'Finals',
          matches: [{
            id: 'finals',
            team1: { name: 'TBD', score: 0 },
            team2: { name: 'TBD', score: 0 },
            status: 'pending',
            winner: null
          }]
        }
      ]
    };
  }

  const handleTournamentAction = (action) => {
    switch (action) {
      case 'start':
        setCurrentTournament(prev => ({ ...prev, status: 'live' }));
        break;
      case 'pause':
        setCurrentTournament(prev => ({ ...prev, status: 'paused' }));
        break;
      case 'complete':
        setCurrentTournament(prev => ({ ...prev, status: 'completed' }));
        break;
      default:
        break;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'registration': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'live': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'paused': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'completed': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'bracket', name: 'Bracket', icon: Trophy },
    { id: 'teams', name: 'Teams', icon: Users },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  if (!currentTournament) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading tournament data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tournament Header */}
      <div className="backdrop-blur-xl bg-gray-900/90 rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{currentTournament.name}</h1>
            <p className="text-gray-400">{currentTournament.game} Tournament</p>
          </div>
          <div className={`px-4 py-2 rounded-full border font-semibold ${getStatusColor(currentTournament.status)}`}>
            {currentTournament.status.charAt(0).toUpperCase() + currentTournament.status.slice(1)}
          </div>
        </div>

        {/* Tournament Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{currentTournament.registeredTeams}/{currentTournament.maxTeams}</div>
            <div className="text-gray-400">Teams Registered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">₹{currentTournament.prizePool.toLocaleString()}</div>
            <div className="text-gray-400">Prize Pool</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{currentTournament.currentRound}</div>
            <div className="text-gray-400">Current Round</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">3 Days</div>
            <div className="text-gray-400">Time Remaining</div>
          </div>
        </div>

        {/* Tournament Controls */}
        <div className="flex gap-4">
          {currentTournament.status === 'registration' && (
            <motion.button
              onClick={() => handleTournamentAction('start')}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-4 h-4" />
              Start Tournament
            </motion.button>
          )}
          {currentTournament.status === 'live' && (
            <>
              <motion.button
                onClick={() => handleTournamentAction('pause')}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg text-yellow-300 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Pause className="w-4 h-4" />
                Pause Tournament
              </motion.button>
              <motion.button
                onClick={() => handleTournamentAction('complete')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Square className="w-4 h-4" />
                End Tournament
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="backdrop-blur-xl bg-gray-900/90 rounded-2xl border border-white/10 p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Tournament Overview</h2>
            
            {/* Recent Matches */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Recent Matches</h3>
              <div className="space-y-3">
                {[1, 2, 3].map(match => (
                  <div key={match} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-white font-semibold">Team Alpha vs Team Beta</div>
                      <div className="text-green-400 text-sm">Completed</div>
                    </div>
                    <div className="text-white font-bold">2 - 1</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Matches */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Upcoming Matches</h3>
              <div className="space-y-3">
                {[1, 2].map(match => (
                  <div key={match} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-white font-semibold">Team Gamma vs Team Delta</div>
                      <div className="text-blue-400 text-sm">Scheduled</div>
                    </div>
                    <div className="text-gray-400">15:00 UTC</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bracket' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Tournament Bracket</h2>
            <div className="overflow-x-auto">
              <div className="min-w-full space-y-8">
                {currentTournament.bracket?.rounds.map((round, roundIndex) => (
                  <div key={roundIndex} className="space-y-4">
                    <h3 className="text-lg font-semibold text-purple-400">{round.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {round.matches.map((match, matchIndex) => (
                        <div key={match.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="space-y-2">
                            <div className={`flex items-center justify-between p-2 rounded ${match.winner === 'team1' ? 'bg-green-500/20' : 'bg-white/5'}`}>
                              <span className="text-white">{match.team1.name}</span>
                              <span className="text-white font-bold">{match.team1.score}</span>
                            </div>
                            <div className={`flex items-center justify-between p-2 rounded ${match.winner === 'team2' ? 'bg-green-500/20' : 'bg-white/5'}`}>
                              <span className="text-white">{match.team2.name}</span>
                              <span className="text-white font-bold">{match.team2.score}</span>
                            </div>
                          </div>
                          <div className="mt-2 text-center">
                            {match.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />}
                            {match.status === 'upcoming' && <Clock className="w-4 h-4 text-blue-400 mx-auto" />}
                            {match.status === 'pending' && <AlertCircle className="w-4 h-4 text-gray-400 mx-auto" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Registered Teams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">Team {i + 1}</h3>
                    <div className="text-green-400 text-sm">Verified</div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-400">
                    <div>Captain: Player{i + 1}</div>
                    <div>Members: 5/5</div>
                    <div>Region: Asia</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Tournament Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Tournament Name</label>
                  <input
                    type="text"
                    value={currentTournament.name}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Game</label>
                  <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                    <option>Valorant</option>
                    <option>CS:GO</option>
                    <option>PUBG</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Max Teams</label>
                  <input
                    type="number"
                    value={currentTournament.maxTeams}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Prize Pool</label>
                  <input
                    type="number"
                    value={currentTournament.prizePool}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
