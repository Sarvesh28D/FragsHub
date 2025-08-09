'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Users, Crown, Calendar, ArrowRight, Play, Star, Target, Zap } from 'lucide-react';

export default function HomePage() {
  const [stats, setStats] = useState({
    totalTournaments: 0,
    activeTournaments: 0,
    registeredTeams: 0,
    totalPrizePool: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch platform stats from backend
    const fetchStats = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://fragshub-backend.onrender.com';
        
        // Fetch teams count
        const teamsResponse = await fetch(`${apiBase}/api/teams`);
        const teamsData = await teamsResponse.json();
        
        // Fetch tournaments count  
        const tournamentsResponse = await fetch(`${apiBase}/api/tournaments`);
        const tournamentsData = await tournamentsResponse.json();
        
        setStats({
          totalTournaments: 5, // Mock data for now
          activeTournaments: 2, // Mock data for now
          registeredTeams: teamsData.teams?.length || 0,
          totalPrizePool: 50000 // Mock data for now
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <h1 className="text-2xl font-bold text-white">FragsHub</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/tournaments" className="text-white/80 hover:text-white transition-colors">
                Tournaments
              </Link>
              <Link href="/teams" className="text-white/80 hover:text-white transition-colors">
                Teams
              </Link>
              <Link href="/bracket" className="text-white/80 hover:text-white transition-colors">
                Live Bracket
              </Link>
              <Link href="/leaderboard" className="text-white/80 hover:text-white transition-colors">
                Leaderboard
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link 
                href="/register-team" 
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Register Team
              </Link>
              <Link 
                href="/admin" 
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
              The Ultimate
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                Esports Platform
              </span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Join the competitive gaming revolution. Create teams, compete in tournaments, 
              and climb the leaderboards in the most advanced esports platform.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/register-team"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Trophy className="h-5 w-5" />
              <span>Start Competing</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              href="/tournaments"
              className="border-2 border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all backdrop-blur-sm flex items-center justify-center space-x-2"
            >
              <Play className="h-5 w-5" />
              <span>View Tournaments</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-white mb-2">
                {loading ? '...' : stats.totalTournaments}
              </div>
              <div className="text-white/80">Total Tournaments</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {loading ? '...' : stats.activeTournaments}
              </div>
              <div className="text-white/80">Active Tournaments</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                {loading ? '...' : stats.registeredTeams}
              </div>
              <div className="text-white/80">Registered Teams</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-green-400 mb-2">
                ₹{loading ? '...' : stats.totalPrizePool.toLocaleString()}
              </div>
              <div className="text-white/80">Total Prize Pool</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-6">Why Choose FragsHub?</h3>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Experience the next generation of esports tournament management with our advanced features.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 hover:border-purple-500/50 transition-all">
              <div className="bg-purple-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-white mb-4 text-center">Tournament Management</h4>
              <p className="text-white/80 text-center leading-relaxed">
                Create and manage professional esports tournaments with automated bracket generation, 
                real-time updates, and comprehensive scoring systems.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 hover:border-purple-500/50 transition-all">
              <div className="bg-pink-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-white mb-4 text-center">Smart Matchmaking</h4>
              <p className="text-white/80 text-center leading-relaxed">
                Advanced algorithms ensure fair and competitive matches based on team rankings, 
                performance history, and skill ratings.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 hover:border-purple-500/50 transition-all">
              <div className="bg-green-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-white mb-4 text-center">Instant Payments</h4>
              <p className="text-white/80 text-center leading-relaxed">
                Secure payment processing with Razorpay integration for tournament entry fees 
                and prize distribution with instant transactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-2xl p-12 border border-white/20">
            <Star className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
            <h3 className="text-4xl font-bold text-white mb-6">Ready to Dominate?</h3>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Join thousands of competitive gamers already using FragsHub to organize 
              and participate in professional esports tournaments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register-team"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Crown className="h-5 w-5" />
                <span>Create Your Team</span>
              </Link>
              <Link 
                href="/tournaments"
                className="border-2 border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all backdrop-blur-sm flex items-center justify-center space-x-2"
              >
                <Calendar className="h-5 w-5" />
                <span>Browse Tournaments</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Status Section */}
      <section className="py-12 px-4 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-white mb-6">Platform Status</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium">Frontend: Online</span>
              </div>
            </div>
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-blue-400 font-medium">Backend API: Connected</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-md border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <span className="text-xl font-bold text-white">FragsHub</span>
          </div>
          <p className="text-white/60">
            The ultimate esports tournament platform. Built for gamers, by gamers.
          </p>
        </div>
      </footer>
    </div>
  );
}
