'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Sphere, MeshDistortMaterial, OrbitControls } from '@react-three/drei';
import { Shield, Users, Check, X, Crown, Zap, Target, TrendingUp, Activity, Settings, Eye, Clock, DollarSign, Trophy, BarChart3, FileText, Download, Play, Gamepad2 } from 'lucide-react';
import AdminContentManager from '../../components/AdminContentManager';
import TournamentManager from '../../components/TournamentManager';
import { createExporter } from '../../lib/googleSheetsExporter';

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
const StatsCard = ({ title, value, change, icon: Icon, color, delay, onClick }) => (
  <motion.div
    className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 relative overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ 
      scale: 1.02, 
      boxShadow: "0 20px 40px rgba(139, 92, 246, 0.2)" 
    }}
    onClick={(e) => {
      e.preventDefault();
      console.log('Stats card clicked:', title);
      onClick?.();
    }}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        console.log('Stats card selected via keyboard:', title);
        onClick?.();
      }
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
    totalTeams: 24,
    totalRevenue: 12000,
    activeTournaments: 2,
    totalPrizePool: 50000,
    pendingApprovals: 5,
    completedMatches: 18
  });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    // Simulate data loading
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleExportData = async (type) => {
    setExporting(true);
    try {
      const exporter = createExporter();
      let result;
      
      switch (type) {
        case 'teams':
          result = await exporter.exportTeamsData(teams);
          break;
        case 'tournament':
          result = await exporter.exportFullTournamentReport({
            id: 'tournament-1',
            name: 'FragsHub Championship 2025',
            game: 'Valorant',
            startDate: '2025-08-15',
            endDate: '2025-08-17',
            registeredTeams: stats.totalTeams,
            prizePool: stats.totalPrizePool,
            registrationFee: 500,
            status: 'live',
            prizeDistribution: [
              { position: 1, percentage: 50, amount: 25000 },
              { position: 2, percentage: 30, amount: 15000 },
              { position: 3, percentage: 15, amount: 7500 },
              { position: 4, percentage: 5, amount: 2500 }
            ]
          });
          break;
        default:
          break;
      }
      
      if (result?.success) {
        alert(`Data exported successfully! Sheet: ${result.sheetName}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please check your configuration.');
    } finally {
      setExporting(false);
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'tournaments', name: 'Tournaments', icon: Trophy },
    { id: 'teams', name: 'Teams', icon: Users },
    { id: 'content', name: 'Content', icon: FileText },
    { id: 'export', name: 'Export', icon: Download }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      {/* Background 3D Scene */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <FloatingCubes />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl font-black text-white mb-4 tracking-wider">
            ADMIN
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              CONTROL
            </span>
          </h1>
          <p className="text-xl text-gray-300 font-medium">
            Tournament Management & Analytics Dashboard
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Admin tab clicked:', tab.id);
                    setActiveTab(tab.id);
                  }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                  type="button"
                >
                  <Icon className="w-5 h-5" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatsCard
                  title="Total Teams"
                  value={stats.totalTeams}
                  change={12}
                  icon={Users}
                  color="from-purple-500 to-purple-600"
                  delay={0.1}
                  onClick={() => setActiveTab('teams')}
                />
                <StatsCard
                  title="Active Tournaments"
                  value={stats.activeTournaments}
                  change={25}
                  icon={Trophy}
                  color="from-cyan-500 to-cyan-600"
                  delay={0.2}
                  onClick={() => setActiveTab('tournaments')}
                />
                <StatsCard
                  title="Total Revenue"
                  value={`₹${stats.totalRevenue.toLocaleString()}`}
                  change={18}
                  icon={DollarSign}
                  color="from-green-500 to-green-600"
                  delay={0.3}
                />
                <StatsCard
                  title="Prize Pool"
                  value={`₹${stats.totalPrizePool.toLocaleString()}`}
                  change={8}
                  icon={Crown}
                  color="from-yellow-500 to-yellow-600"
                  delay={0.4}
                />
                <StatsCard
                  title="Pending Approvals"
                  value={stats.pendingApprovals}
                  change={-5}
                  icon={Clock}
                  color="from-orange-500 to-orange-600"
                  delay={0.5}
                />
                <StatsCard
                  title="Completed Matches"
                  value={stats.completedMatches}
                  change={22}
                  icon={Check}
                  color="from-blue-500 to-blue-600"
                  delay={0.6}
                />
              </div>

              {/* Quick Actions */}
              <motion.div
                className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <motion.button
                    onClick={() => setActiveTab('tournaments')}
                    className="flex items-center gap-3 p-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-5 h-5" />
                    Start Tournament
                  </motion.button>
                  <motion.button
                    onClick={() => setActiveTab('content')}
                    className="flex items-center gap-3 p-4 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-300 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Settings className="w-5 h-5" />
                    Edit Content
                  </motion.button>
                  <motion.button
                    onClick={() => handleExportData('teams')}
                    disabled={exporting}
                    className="flex items-center gap-3 p-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300 transition-all disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="w-5 h-5" />
                    Export Data
                  </motion.button>
                  <motion.button
                    onClick={() => setActiveTab('teams')}
                    className="flex items-center gap-3 p-4 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg text-yellow-300 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Eye className="w-5 h-5" />
                    Review Teams
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'tournaments' && (
            <motion.div
              key="tournaments"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TournamentManager />
            </motion.div>
          )}

          {activeTab === 'teams' && (
            <motion.div
              key="teams"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Team Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 9 }, (_, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-semibold">Team Alpha {i + 1}</h3>
                      <div className="text-green-400 text-sm">Verified</div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-400">
                      <div>Captain: Player{i + 1}</div>
                      <div>Members: 5/5</div>
                      <div>Payment: ✅ Completed</div>
                      <div>Region: Asia</div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 py-2 px-3 bg-green-500/20 text-green-400 rounded text-sm hover:bg-green-500/30 transition-all">
                        Approve
                      </button>
                      <button className="flex-1 py-2 px-3 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30 transition-all">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AdminContentManager onSave={() => console.log('Content saved!')} />
            </motion.div>
          )}

          {activeTab === 'export' && (
            <motion.div
              key="export"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Data Export</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Export Options</h3>
                  <motion.button
                    onClick={() => handleExportData('teams')}
                    disabled={exporting}
                    className="w-full flex items-center justify-center gap-3 p-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300 transition-all disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {exporting ? (
                      <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                    Export Teams to Google Sheets
                  </motion.button>
                  <motion.button
                    onClick={() => handleExportData('tournament')}
                    disabled={exporting}
                    className="w-full flex items-center justify-center gap-3 p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 transition-all disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {exporting ? (
                      <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                    Export Tournament Report
                  </motion.button>
                </div>
                <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                  <h4 className="text-yellow-300 font-semibold mb-3">Export Information</h4>
                  <ul className="text-yellow-200 space-y-2 text-sm">
                    <li>• Teams export includes registration and payment data</li>
                    <li>• Tournament report includes brackets and results</li>
                    <li>• All exports are automatically timestamped</li>
                    <li>• Configure Google Sheets API in environment variables</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
