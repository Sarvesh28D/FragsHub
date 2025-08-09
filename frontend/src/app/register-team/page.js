'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trophy, Users, Mail, Crown, ArrowLeft, Plus, Trash2, Save } from 'lucide-react';

export default function RegisterTeamPage() {
  const [teamData, setTeamData] = useState({
    name: '',
    captainEmail: '',
    players: [
      { name: '', role: '', isCaptain: true }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const addPlayer = () => {
    if (teamData.players.length < 5) {
      setTeamData({
        ...teamData,
        players: [...teamData.players, { name: '', role: '', isCaptain: false }]
      });
    }
  };

  const removePlayer = (index) => {
    if (teamData.players.length > 1 && !teamData.players[index].isCaptain) {
      setTeamData({
        ...teamData,
        players: teamData.players.filter((_, i) => i !== index)
      });
    }
  };

  const updatePlayer = (index, field, value) => {
    const updatedPlayers = teamData.players.map((player, i) => 
      i === index ? { ...player, [field]: value } : player
    );
    setTeamData({ ...teamData, players: updatedPlayers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://fragshub-backend.onrender.com';
      const response = await fetch(`${apiBase}/api/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...teamData,
          entryFee: 500 // Default entry fee
        }),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        alert('Failed to register team. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Failed to register team. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center max-w-md w-full">
          <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Team Registered!</h2>
          <p className="text-white/80 mb-6">
            Your team has been successfully registered. You'll receive an email with payment instructions.
          </p>
          <div className="flex flex-col gap-3">
            <Link 
              href="/teams"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              View All Teams
            </Link>
            <Link 
              href="/"
              className="border border-white/20 hover:border-white/40 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link 
          href="/"
          className="inline-flex items-center space-x-2 text-white/80 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Home</span>
        </Link>
        
        <div className="text-center">
          <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">Register Your Team</h1>
          <p className="text-xl text-white/80">
            Join the competition and compete for glory and prizes
          </p>
        </div>
      </div>

      {/* Registration Form */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
          {/* Team Information */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
              <Users className="h-6 w-6" />
              <span>Team Information</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2">Team Name *</label>
                <input
                  type="text"
                  required
                  value={teamData.name}
                  onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:border-purple-500 focus:outline-none"
                  placeholder="Enter your team name"
                />
              </div>
              
              <div>
                <label className="block text-white/80 mb-2">Captain Email *</label>
                <input
                  type="email"
                  required
                  value={teamData.captainEmail}
                  onChange={(e) => setTeamData({ ...teamData, captainEmail: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:border-purple-500 focus:outline-none"
                  placeholder="captain@example.com"
                />
              </div>
            </div>
          </div>

          {/* Players */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
                <Crown className="h-6 w-6" />
                <span>Team Players</span>
              </h3>
              <button
                type="button"
                onClick={addPlayer}
                disabled={teamData.players.length >= 5}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Player</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {teamData.players.map((player, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium flex items-center space-x-2">
                      {player.isCaptain && <Crown className="h-4 w-4 text-yellow-500" />}
                      <span>Player {index + 1} {player.isCaptain && '(Captain)'}</span>
                    </span>
                    {!player.isCaptain && teamData.players.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePlayer(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      value={player.name}
                      onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:border-purple-500 focus:outline-none"
                      placeholder="Player name"
                    />
                    <input
                      type="text"
                      value={player.role}
                      onChange={(e) => updatePlayer(index, 'role', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:border-purple-500 focus:outline-none"
                      placeholder="Role (optional)"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Entry Fee Info */}
          <div className="mb-8 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="text-yellow-400 font-medium mb-2">Entry Fee Information</h4>
            <p className="text-white/80 text-sm">
              Entry fee: ₹500 per team. Payment instructions will be sent to the captain's email after registration.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Registering...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Register Team</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
