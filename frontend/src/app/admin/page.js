'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Sphere, MeshDistortMaterial, OrbitControls } from '@react-three/drei';
import { Shield, Users, Check, X, Crown, Zap, Target, TrendingUp, Activity, Settings, Eye, Clock, DollarSign, Trophy } from 'lucide-react';

// 3D Floating Cubes Component
function FloatingCubes() {
  const group = useRef();
  
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.x = state.clock.elapsedTime * 0.1;
      group.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <group ref={group}>
      {[...Array(8)].map((_, i) => (
        <Box
          key={i}
          position={[
            Math.sin(i * 0.8) * 3,
            Math.cos(i * 0.8) * 3,
            Math.sin(i * 0.4) * 2
          ]}
          scale={0.3}
          rotation={[i * 0.5, i * 0.3, 0]}
        >
          <MeshDistortMaterial
            color={i % 2 === 0 ? "#06b6d4" : "#8b5cf6"}
            distort={0.3}
            speed={2}
          />
        </Box>
      ))}
    </group>
  );
}

// Dashboard Stats Card Component
const StatsCard = ({ title, value, change, icon: Icon, color, delay }) => (
  <motion.div
    className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 relative overflow-hidden group"
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ 
      scale: 1.02, 
      boxShadow: "0 20px 40px rgba(139, 92, 246, 0.2)" 
    }}
  >
    <motion.div 
      className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10"
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />
    
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <motion.div
          className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center`}
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.8 }}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
        <motion.span 
          className={`text-sm font-semibold px-3 py-1 rounded-full ${
            change > 0 ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.3 }}
        >
          {change > 0 ? '+' : ''}{change}%
        </motion.span>
      </div>
      
      <motion.h3 
        className="text-3xl font-black text-white mb-2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.2 }}
      >
        {value}
      </motion.h3>
      
      <p className="text-gray-300 font-medium">{title}</p>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalTeams: 0,
    pendingApprovals: 0,
    paidTeams: 0,
    totalRevenue: 0
  });
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://fragshub-backend.onrender.com/api/teams');
        const data = await response.json();
        
        if (data.teams) {
          setTeams(data.teams);
          setStats({
            totalTeams: data.teams.length,
            pendingApprovals: data.teams.filter(team => team.status === 'pending').length,
            paidTeams: data.teams.filter(team => team.paid).length,
            totalRevenue: data.teams.filter(team => team.paid).length * 50
          });
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
        // Mock data fallback
        setStats({
          totalTeams: 12,
          pendingApprovals: 5,
          paidTeams: 7,
          totalRevenue: 350
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTeamAction = async (teamId, action) => {
    try {
      const response = await fetch(`https://fragshub-backend.onrender.com/api/teams/${teamId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: action }),
      });

      if (response.ok) {
        setTeams(teams.map(team => 
          team.id === teamId ? { ...team, status: action } : team
        ));
      }
    } catch (error) {
      console.error('Error updating team:', error);
    }
  };

  const filteredTeams = teams.filter(team => {
    if (filter === 'all') return true;
    return team.status === filter;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/10 to-black"></div>
        <div className="absolute top-20 right-20 w-96 h-96 opacity-20">
          <Canvas>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <FloatingCubes />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate />
          </Canvas>
        </div>
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-50 backdrop-blur-xl bg-black/20 border-b border-purple-500/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.a 
              href="/"
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div 
                className="w-10 h-10 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              ></motion.div>
              <span className="text-3xl font-black text-white tracking-wider">FragsHub</span>
            </motion.a>
            
            <div className="flex items-center space-x-6">
              <motion.div 
                className="flex items-center space-x-2 text-cyan-400"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Admin Dashboard</span>
              </motion.div>
              
              <motion.a 
                href="/"
                className="text-white/80 hover:text-cyan-400 transition-colors font-semibold"
                whileHover={{ x: -5 }}
              >
                ← Back to Home
              </motion.a>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Admin Header */}
        <motion.div
          className="text-center mb-12 relative"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Admin Badge */}
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-red-500 to-pink-600 px-6 py-2 rounded-full text-white font-cyber text-sm font-bold border border-red-400 shadow-lg shadow-red-500/30">
              🛡️ ADMINISTRATOR ACCESS
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
            <span className="text-red-400">ADMIN</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              CONTROL CENTER
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            🚀 Master Control Panel for Tournament Operations & Team Management
          </p>
          
          {/* Admin Status Indicators */}
          <div className="flex justify-center space-x-8 mt-8">
            <div className="flex items-center space-x-2 text-green-400">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-cyber text-sm">SYSTEM ONLINE</span>
            </div>
            <div className="flex items-center space-x-2 text-cyan-400">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="font-cyber text-sm">MONITORING ACTIVE</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-400">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="font-cyber text-sm">ALL SYSTEMS GO</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Dashboard */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <StatsCard
            title="Total Teams"
            value={stats.totalTeams}
            change={15}
            icon={Users}
            color="from-blue-500 to-cyan-600"
            delay={0.1}
          />
          <StatsCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            change={-5}
            icon={Clock}
            color="from-yellow-500 to-orange-600"
            delay={0.2}
          />
          <StatsCard
            title="Active Teams"
            value={stats.paidTeams}
            change={25}
            icon={Trophy}
            color="from-green-500 to-emerald-600"
            delay={0.3}
          />
          <StatsCard
            title="Total Revenue"
            value={`$${stats.totalRevenue}`}
            change={30}
            icon={DollarSign}
            color="from-purple-500 to-pink-600"
            delay={0.4}
          />
        </motion.div>

        {/* Team Management */}
        <motion.div
          className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <h2 className="text-3xl font-bold text-white mb-4 lg:mb-0">Team Management</h2>
            
            {/* Filter Buttons */}
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'All Teams', color: 'from-gray-500 to-gray-600' },
                { key: 'pending', label: 'Pending', color: 'from-yellow-500 to-orange-600' },
                { key: 'approved', label: 'Approved', color: 'from-green-500 to-emerald-600' },
                { key: 'rejected', label: 'Rejected', color: 'from-red-500 to-pink-600' }
              ].map((filterOption) => (
                <motion.button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    filter === filterOption.key
                      ? `bg-gradient-to-r ${filterOption.color} text-white`
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {filterOption.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Teams List */}
          <div className="space-y-4">
            <AnimatePresence>
              {loading ? (
                <motion.div 
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-300">Loading teams...</p>
                </motion.div>
              ) : filteredTeams.length === 0 ? (
                <motion.div 
                  className="text-center py-12"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-300 text-lg">No teams found for the selected filter.</p>
                </motion.div>
              ) : (
                filteredTeams.map((team, index) => (
                  <motion.div
                    key={team.id || index}
                    className="backdrop-blur-md bg-white/5 rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ delay: index * 0.1 }}
                    layout
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="mb-4 lg:mb-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-white">{team.teamName || `Team ${index + 1}`}</h3>
                          {team.teamTag && (
                            <span className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full text-white text-sm font-semibold">
                              {team.teamTag}
                            </span>
                          )}
                          <motion.span 
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              team.status === 'approved' 
                                ? 'bg-green-500/20 text-green-400' 
                                : team.status === 'rejected'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                          >
                            {team.status || 'pending'}
                          </motion.span>
                        </div>
                        <div className="text-gray-300">
                          <p><span className="font-semibold">Captain:</span> {team.captain || 'Unknown'}</p>
                          <p><span className="font-semibold">Players:</span> {team.players?.length || 4}</p>
                          <p><span className="font-semibold">Email:</span> {team.email || 'Not provided'}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <motion.button
                          onClick={() => handleTeamAction(team.id, 'approved')}
                          className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 rounded-xl text-white font-semibold"
                          whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(34, 197, 94, 0.3)" }}
                          whileTap={{ scale: 0.95 }}
                          disabled={team.status === 'approved'}
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve</span>
                        </motion.button>
                        
                        <motion.button
                          onClick={() => handleTeamAction(team.id, 'rejected')}
                          className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-600 px-6 py-3 rounded-xl text-white font-semibold"
                          whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(239, 68, 68, 0.3)" }}
                          whileTap={{ scale: 0.95 }}
                          disabled={team.status === 'rejected'}
                        >
                          <X className="w-4 h-4" />
                          <span>Reject</span>
                        </motion.button>
                        
                        <motion.button
                          className="flex items-center space-x-2 bg-white/10 border border-white/20 px-6 py-3 rounded-xl text-white font-semibold hover:bg-white/20"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
