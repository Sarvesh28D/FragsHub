'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView, useScroll, useTransform } from 'framer-motion';
import { Gamepad2, Zap, Trophy, Users, Target, Rocket, Crown, Calendar, ArrowRight, Play, Star, Shield, Sparkles, UserPlus, CreditCard, LogIn } from 'lucide-react';
import WebGLGamingScene from '../../components/WebGLGamingScene';
import AuthModal from '../../components/AuthModal';
import { useAuth } from '../../hooks/useAuth.js';

export default function CustomerHomepage() {
  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, logout } = useAuth();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400 font-mono text-xl animate-pulse">
          INITIALIZING NEURAL INTERFACE...
        </div>
      </div>
    );
  }

  return (
    <>
      {/* WebGL Gaming Scene */}
      <section className="relative w-full h-screen">
        <WebGLGamingScene />
        
        {/* Navigation Overlay */}
        <nav className="absolute top-0 left-0 right-0 z-50 p-4 md:p-6">
          <div className="flex justify-between items-center">
            <div className="font-gaming text-xl md:text-2xl text-cyan-400 glow-electric">
              FRAGSHUB
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex space-x-6 text-white font-cyber">
              <a href="#tournaments" className="hover:text-cyan-400 transition-colors">TOURNAMENTS</a>
              <a href="/teams" className="hover:text-cyan-400 transition-colors">TEAMS</a>
              <a href="/leaderboard" className="hover:text-cyan-400 transition-colors">LEADERBOARD</a>
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="hidden xl:block text-cyan-400">Welcome, {user.displayName || user.email}</span>
                  <a href="/register-team" className="btn-gaming px-4 py-2 text-sm">REGISTER TEAM</a>
                  <button 
                    onClick={logout}
                    className="btn-gaming-secondary px-4 py-2 text-sm text-red-400 border-red-400 hover:bg-red-500/20"
                  >
                    LOGOUT
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    LOGIN
                  </button>
                  <a href="/register-team" className="btn-gaming px-4 py-2 text-sm">JOIN BATTLE</a>
                </div>
              )}
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden">
              {user ? (
                <div className="flex items-center space-x-2">
                  <a href="/register-team" className="btn-gaming px-3 py-2 text-sm">REGISTER</a>
                  <button 
                    onClick={logout}
                    className="btn-gaming-secondary px-3 py-2 text-sm text-red-400 border-red-400"
                  >
                    LOGOUT
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
                  >
                    LOGIN
                  </button>
                  <a href="/register-team" className="btn-gaming px-3 py-2 text-sm">JOIN</a>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center max-w-6xl mx-auto px-4 sm:px-6">
            <motion.h1 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-gaming text-white mb-4 sm:mb-6 glow-electric leading-tight"
            >
              FRAG<span className="text-cyan-400">S</span>HUB
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-6 sm:mb-8 font-cyber px-4"
            >
              THE ULTIMATE ESPORTS TOURNAMENT PLATFORM
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="pointer-events-auto"
            >
              {user ? (
                <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-4">
                  <motion.a
                    href="/register-team"
                    className="btn-gaming-large px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>REGISTER TEAM</span>
                  </motion.a>
                  <motion.a
                    href="/teams"
                    className="btn-secondary-large px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>VIEW TEAMS</span>
                  </motion.a>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-4">
                  <motion.a
                    href="/register-team"
                    className="btn-gaming-large px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>JOIN TOURNAMENT</span>
                  </motion.a>
                  <motion.a
                    href="/teams"
                    className="btn-secondary-large px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>WATCH LIVE</span>
                  </motion.a>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Stats Overlay */}
        <div className="absolute bottom-10 sm:bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-none w-full px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex flex-col sm:flex-row justify-center items-center space-y-6 sm:space-y-0 sm:space-x-8 md:space-x-12 text-center"
          >
            <div className="font-cyber">
              <div className="text-2xl sm:text-3xl font-bold text-cyan-400 glow-cyan">50+</div>
              <div className="text-xs sm:text-sm text-gray-400">TEAMS</div>
            </div>
            <div className="font-cyber">
              <div className="text-2xl sm:text-3xl font-bold text-purple-400 glow-purple">₹2L+</div>
              <div className="text-xs sm:text-sm text-gray-400">PRIZE POOL</div>
            </div>
            <div className="font-cyber">
              <div className="text-2xl sm:text-3xl font-bold text-green-400 glow-green">24/7</div>
              <div className="text-xs sm:text-sm text-gray-400">TOURNAMENTS</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tournament Features Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-gaming text-white mb-6 glow-electric">
              TOURNAMENT <span className="text-cyan-400">FEATURES</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience the most advanced esports tournament platform with cutting-edge features
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Trophy,
                title: "Live Tournaments",
                description: "Join ongoing tournaments with real-time bracket updates and live scoring",
                color: "from-yellow-400 to-orange-500"
              },
              {
                icon: Users,
                title: "Team Management",
                description: "Register your team, manage rosters, and track performance analytics",
                color: "from-blue-400 to-cyan-500"
              },
              {
                icon: Target,
                title: "Skill Matching",
                description: "Advanced matchmaking system ensures fair and competitive gameplay",
                color: "from-purple-400 to-pink-500"
              },
              {
                icon: Crown,
                title: "Prize Pools",
                description: "Compete for substantial cash prizes and exclusive gaming rewards",
                color: "from-green-400 to-emerald-500"
              },
              {
                icon: Shield,
                title: "Secure Payments",
                description: "Safe and secure payment processing with instant prize distribution",
                color: "from-red-400 to-pink-500"
              },
              {
                icon: Sparkles,
                title: "Live Streaming",
                description: "Watch tournaments live with professional commentary and analysis",
                color: "from-indigo-400 to-purple-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative p-8 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-cyan-500 transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-cyber text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-900 via-purple-900 to-pink-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/50"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-gaming text-white mb-6 glow-electric">
              READY TO <span className="text-cyan-400">DOMINATE?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of players competing in the most intense esports tournaments. 
              Register your team today and claim your victory!
            </p>
            
            <div className="flex justify-center space-x-6">
              <motion.a
                href="/register-team"
                className="btn-gaming-large px-12 py-6 text-xl flex items-center space-x-3"
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(6, 182, 212, 0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                <UserPlus className="w-7 h-7" />
                <span>REGISTER NOW</span>
              </motion.a>
              
              <motion.a
                href="/teams"
                className="btn-secondary-large px-12 py-6 text-xl flex items-center space-x-3"
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Trophy className="w-7 h-7" />
                <span>VIEW LEADERBOARD</span>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
}
