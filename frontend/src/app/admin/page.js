'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Users, Trophy, DollarSign, ArrowLeft, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalTeams: 0,
    pendingApprovals: 0,
    paidTeams: 0,
    totalRevenue: 0
  });
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock admin data
    const mockStats = {
      totalTeams: 3,
      pendingApprovals: 1,
      paidTeams: 2,
      totalRevenue: 1000
    };

    const mockTeams = [
      {
        id: '1',
        name: 'Shadow Hunters',
        captainEmail: 'captain@shadowhunters.com',
        playersCount: 4,
        registrationStatus: 'approved',
        paymentStatus: 'paid',
        createdAt: new Date('2025-01-15')
      },
      {
        id: '2',
        name: 'Phoenix Rising',
        captainEmail: 'leader@phoenixrising.com',
        playersCount: 3,
        registrationStatus: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date('2025-01-20')
      },
      {
        id: '3',
        name: 'Cyber Wolves',
        captainEmail: 'alpha@cyberwolves.com',
        playersCount: 5,
        registrationStatus: 'approved',
        paymentStatus: 'paid',
        createdAt: new Date('2025-01-18')
      }
    ];

    setStats(mockStats);
    setTeams(mockTeams);
    setLoading(false);
  }, []);

  const handleApprove = async (teamId) => {
    setTeams(teams.map(team => 
      team.id === teamId 
        ? { ...team, registrationStatus: 'approved' }
        : team
    ));
    alert('Team approved successfully!');
  };

  const handleReject = async (teamId) => {
    setTeams(teams.map(team => 
      team.id === teamId 
        ? { ...team, registrationStatus: 'rejected' }
        : team
    ));
    alert('Team rejected successfully!');
  };

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
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

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
        
        <div className="flex items-center space-x-3 mb-2">
          <Shield className="h-10 w-10 text-red-400" />
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
        </div>
        <p className="text-xl text-white/80">
          Manage teams, tournaments, and platform statistics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-2">
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalTeams}</div>
                <div className="text-white/80 text-sm">Total Teams</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-2">
              <Clock className="h-8 w-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.pendingApprovals}</div>
                <div className="text-white/80 text-sm">Pending Approvals</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-2">
              <CheckCircle className="h-8 w-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.paidTeams}</div>
                <div className="text-white/80 text-sm">Paid Teams</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-2">
              <DollarSign className="h-8 w-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">₹{stats.totalRevenue.toLocaleString()}</div>
                <div className="text-white/80 text-sm">Total Revenue</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Teams Management */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <Trophy className="h-6 w-6" />
              <span>Team Management</span>
            </h2>
            <p className="text-white/80 mt-1">Approve or reject team registrations</p>
          </div>
          
          {loading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-white/10 rounded-lg"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {teams.map(team => (
                <div key={team.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Trophy className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">{team.name}</h3>
                        <p className="text-white/60">{team.captainEmail}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-white/80 text-sm">{team.playersCount} players</span>
                          <span className="text-white/80 text-sm">
                            Registered: {team.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Status Badges */}
                      <div className="flex flex-col space-y-2">
                        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(team.registrationStatus)}`}>
                          {getStatusIcon(team.registrationStatus)}
                          <span className="capitalize">{team.registrationStatus}</span>
                        </div>
                        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(team.paymentStatus)}`}>
                          {getStatusIcon(team.paymentStatus)}
                          <span className="capitalize">Payment: {team.paymentStatus}</span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/teams/${team.id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </Link>
                        
                        {team.registrationStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(team.id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleReject(team.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                            >
                              <XCircle className="h-4 w-4" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto mt-8">
        <div className="grid md:grid-cols-3 gap-6">
          <Link 
            href="/admin/tournaments"
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-purple-500/50 transition-all text-center group"
          >
            <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold text-lg mb-2">Manage Tournaments</h3>
            <p className="text-white/80 text-sm">Create and manage tournament brackets</p>
          </Link>
          
          <Link 
            href="/admin/payments"
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-purple-500/50 transition-all text-center group"
          >
            <DollarSign className="h-12 w-12 text-green-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold text-lg mb-2">Payment Management</h3>
            <p className="text-white/80 text-sm">Track payments and revenue</p>
          </Link>
          
          <Link 
            href="/admin/settings"
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-purple-500/50 transition-all text-center group"
          >
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold text-lg mb-2">Platform Settings</h3>
            <p className="text-white/80 text-sm">Configure platform settings</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
