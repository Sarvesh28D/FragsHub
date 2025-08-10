'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Users, Mail, Crown, ArrowLeft, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://fragshub-backend.onrender.com';
        const response = await fetch(`${apiBase}/api/teams`);
        const data = await response.json();
        
        // Mock team data for demonstration
        const mockTeams = [
          {
            id: '1',
            name: 'Shadow Hunters',
            captainEmail: 'captain@shadowhunters.com',
            players: [
              { name: 'Alex Johnson', role: 'IGL', isCaptain: true },
              { name: 'Sarah Connor', role: 'Fragger', isCaptain: false },
              { name: 'Mike Chen', role: 'Support', isCaptain: false },
              { name: 'Emma Davis', role: 'AWPer', isCaptain: false },
            ],
            entryFee: 500,
            paymentStatus: 'paid',
            registrationStatus: 'approved',
            createdAt: new Date('2025-01-15')
          },
          {
            id: '2',
            name: 'Phoenix Rising',
            captainEmail: 'leader@phoenixrising.com',
            players: [
              { name: 'David Smith', role: 'Captain', isCaptain: true },
              { name: 'Lisa Wang', role: 'Entry', isCaptain: false },
              { name: 'Tom Brown', role: 'Anchor', isCaptain: false },
            ],
            entryFee: 500,
            paymentStatus: 'pending',
            registrationStatus: 'pending',
            createdAt: new Date('2025-01-20')
          },
          {
            id: '3',
            name: 'Cyber Wolves',
            captainEmail: 'alpha@cyberwolves.com',
            players: [
              { name: 'Ryan Taylor', role: 'IGL', isCaptain: true },
              { name: 'Jessica Lee', role: 'Rifler', isCaptain: false },
              { name: 'Mark Wilson', role: 'AWPer', isCaptain: false },
              { name: 'Anna Martinez', role: 'Support', isCaptain: false },
              { name: 'Chris Anderson', role: 'Entry', isCaptain: false },
            ],
            entryFee: 500,
            paymentStatus: 'paid',
            registrationStatus: 'approved',
            createdAt: new Date('2025-01-18')
          }
        ];
        
        setTeams(mockTeams);
      } catch (error) {
        console.error('Failed to fetch teams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'rejected':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'paid':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'failed':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const filteredTeams = teams.filter(team => {
    if (filter === 'all') return true;
    if (filter === 'approved') return team.registrationStatus === 'approved';
    if (filter === 'pending') return team.registrationStatus === 'pending';
    if (filter === 'paid') return team.paymentStatus === 'paid';
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <Link 
          href="/"
          className="inline-flex items-center space-x-2 text-white/80 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Home</span>
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center space-x-3">
              <Users className="h-10 w-10 text-purple-400" />
              <span>Registered Teams</span>
            </h1>
            <p className="text-xl text-white/80">
              {teams.length} teams competing for glory
            </p>
          </div>
          
          <Link 
            href="/register-team"
            className="mt-4 md:mt-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 flex items-center space-x-2"
          >
            <Trophy className="h-5 w-5" />
            <span>Register New Team</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="h-5 w-5 text-white/80" />
            <span className="text-white font-medium">Filter Teams</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Teams' },
              { key: 'approved', label: 'Approved' },
              { key: 'pending', label: 'Pending' },
              { key: 'paid', label: 'Payment Complete' }
            ].map(filterOption => (
              <button
                key={filterOption.key}
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Teams filter button clicked:', filterOption.key);
                  setFilter(filterOption.key);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  filter === filterOption.key
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
                type="button"
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 animate-pulse">
                <div className="h-6 bg-white/20 rounded mb-4"></div>
                <div className="h-4 bg-white/20 rounded mb-2"></div>
                <div className="h-4 bg-white/20 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-white/20 rounded"></div>
                  <div className="h-3 bg-white/20 rounded"></div>
                  <div className="h-3 bg-white/20 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="h-16 w-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No Teams Found</h3>
            <p className="text-white/80 mb-6">
              {filter === 'all' 
                ? 'No teams have registered yet.' 
                : `No teams match the "${filter}" filter.`}
            </p>
            <Link 
              href="/register-team"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Be the First to Register
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map(team => (
              <div key={team.id} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-purple-500/50 transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{team.name}</h3>
                      <p className="text-white/60 text-sm">Team ID: {team.id}</p>
                    </div>
                  </div>
                  
                  {/* Status Badges */}
                  <div className="flex flex-col space-y-2">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(team.registrationStatus)}`}>
                      {getStatusIcon(team.registrationStatus)}
                      <span className="capitalize">{team.registrationStatus}</span>
                    </div>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(team.paymentStatus)}`}>
                      {getStatusIcon(team.paymentStatus)}
                      <span className="capitalize">{team.paymentStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Team Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-white/80">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{team.captainEmail}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/80">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">{team.players.length} players</span>
                  </div>
                </div>

                {/* Players List */}
                <div className="mb-4">
                  <h4 className="text-white/90 font-medium text-sm mb-2">Players</h4>
                  <div className="space-y-1">
                    {team.players.map((player, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        {player.isCaptain && <Crown className="h-3 w-3 text-yellow-500" />}
                        <span className={player.isCaptain ? 'text-white font-medium' : 'text-white/70'}>
                          {player.name}
                        </span>
                        {player.role && (
                          <span className="text-white/50 text-xs">({player.role})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Entry Fee & Date */}
                <div className="flex items-center justify-between text-sm pt-3 border-t border-white/10">
                  <span className="text-white/70">Entry Fee: ₹{team.entryFee}</span>
                  <span className="text-white/70">
                    {team.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
