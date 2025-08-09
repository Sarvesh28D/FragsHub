'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import { Gamepad2, Zap, Trophy, Users, Target, Rocket, Crown, Calendar, ArrowRight, Play, Star } from 'lucide-react';

// 3D Animated Sphere Component
function AnimatedSphere() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={2.5}>
        <MeshDistortMaterial
          color="#8b5cf6"
          attach="material"
          distort={0.6}
          speed={2}
          roughness={0.1}
        />
      </Sphere>
    </Float>
  );
}

// Floating Particles Component
function ParticleField() {
  const particlesRef = useRef();
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  const particles = Array.from({ length: 100 }, (_, i) => (
    <mesh
      key={i}
      position={[
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
      ]}
    >
      <sphereGeometry args={[0.02]} />
      <meshBasicMaterial color="#06b6d4" />
    </mesh>
  ));

  return <group ref={particlesRef}>{particles}</group>;
}

export default function HomePage() {
  const [stats, setStats] = useState({
    totalTournaments: 0,
    activeTournaments: 0,
    registeredTeams: 0,
    totalPrizePool: 0
  });
  const [loading, setLoading] = useState(true);
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

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

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

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

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/10 to-black"></div>
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
              }}
              animate={{
                y: [null, -100],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-50 bg-black/20 backdrop-blur-xl border-b border-purple-500/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div 
                className="w-10 h-10 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              ></motion.div>
              <span className="text-3xl font-black text-white tracking-wider">FragsHub</span>
            </motion.div>
            
            <nav className="hidden md:flex space-x-8">
              {[
                { href: "/tournaments", label: "Tournaments" },
                { href: "/teams", label: "Teams" },
                { href: "/bracket", label: "Live Bracket" },
                { href: "/leaderboard", label: "Leaderboard" }
              ].map((item, index) => (
                <motion.a 
                  key={item.href}
                  href={item.href}
                  className="text-white/80 hover:text-cyan-400 transition-all duration-300 font-semibold relative"
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  {item.label}
                  <motion.div 
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500"
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              ))}
            </nav>
            
            <div className="flex space-x-4">
              <motion.a 
                href="/register-team"
                className="bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 px-6 py-3 rounded-xl text-white font-bold relative overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Register Team</span>
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500"
                  initial={{ x: "100%" }}
                  whileHover={{ x: "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
              <motion.a 
                href="/admin"
                className="border-2 border-purple-500/50 px-6 py-3 rounded-xl text-white hover:bg-purple-500/20 transition-all duration-300 font-semibold"
                whileHover={{ scale: 1.05, borderColor: "#a855f7" }}
                whileTap={{ scale: 0.95 }}
              >
                Admin
              </motion.a>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section with 3D Elements */}
      <section className="relative z-10 min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <AnimatedSphere />
            <ParticleField />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
          </Canvas>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <motion.h1 
              className="text-6xl md:text-8xl font-black text-white mb-8 leading-tight"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              Welcome to{' '}
              <motion.span 
                className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ backgroundSize: "200% 200%" }}
              >
                FragsHub
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-3xl text-gray-300 mb-12 max-w-4xl mx-auto font-light"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
            >
              The ultimate esports arena where legends are forged, champions rise, and gaming dreams become reality
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.5 }}
            >
              <motion.a 
                href="/register-team"
                className="group relative bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 px-12 py-5 rounded-2xl text-white font-bold text-xl overflow-hidden"
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Rocket className="w-6 h-6" />
                  Join Tournament
                </span>
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500"
                  initial={{ x: "100%" }}
                  whileHover={{ x: "0%" }}
                  transition={{ duration: 0.4 }}
                />
              </motion.a>
              
              <motion.a 
                href="/teams"
                className="group border-3 border-purple-500/50 px-12 py-5 rounded-2xl text-white font-bold text-xl hover:bg-purple-500/20 transition-all duration-300"
                whileHover={{ scale: 1.05, borderColor: "#a855f7" }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-3">
                  <Users className="w-6 h-6" />
                  View Teams
                </span>
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Live Stats with Animations */}
      <motion.section 
        ref={ref}
        className="relative z-10 py-20"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-5xl font-black text-center text-white mb-16"
            variants={itemVariants}
          >
            Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Statistics</span>
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { value: loading ? '...' : stats.registeredTeams, label: 'Registered Teams', color: 'from-cyan-400 to-blue-500', icon: Users },
              { value: loading ? '...' : stats.registeredTeams * 4, label: 'Active Players', color: 'from-purple-400 to-pink-500', icon: Gamepad2 },
              { value: stats.activeTournaments, label: 'Live Tournaments', color: 'from-green-400 to-cyan-500', icon: Trophy },
              { value: `$${stats.totalPrizePool.toLocaleString()}`, label: 'Prize Pool', color: 'from-yellow-400 to-orange-500', icon: Crown },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="group backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-8 text-center relative overflow-hidden"
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 25px 50px rgba(139, 92, 246, 0.2)",
                  border: "1px solid rgba(168, 85, 247, 0.3)"
                }}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                
                <motion.div
                  className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl mx-auto mb-6 flex items-center justify-center`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </motion.div>
                
                <motion.div 
                  className={`text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-4`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 * index }}
                >
                  {stat.value}
                </motion.div>
                
                <div className="text-gray-300 text-lg font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features with 3D Effects */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-5xl font-black text-center text-white mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Why Choose{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">FragsHub?</span>
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: Target, title: 'Real-time Brackets', desc: 'Live tournament brackets with instant updates and match results', color: 'from-cyan-400 to-blue-500' },
              { icon: Users, title: 'Team Management', desc: 'Easy team registration and management with player profiles', color: 'from-purple-400 to-pink-500' },
              { icon: Trophy, title: 'Prize Pool', desc: 'Compete for substantial prize pools and esports recognition', color: 'from-green-400 to-cyan-500' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="group relative backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-10 overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 * index }}
                whileHover={{ 
                  scale: 1.05, 
                  rotateY: 5,
                  boxShadow: "0 25px 50px rgba(139, 92, 246, 0.3)"
                }}
                viewport={{ once: true }}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                
                <motion.div
                  className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-3xl mb-8 flex items-center justify-center`}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.8 }}
                >
                  <feature.icon className="w-10 h-10 text-white" />
                </motion.div>
                
                <h3 className="text-2xl font-bold text-white mb-6">{feature.title}</h3>
                <p className="text-gray-300 text-lg leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Floating Elements */}
      <section className="relative z-10 py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl font-black text-white mb-8">Ready to Dominate?</h2>
            <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of elite players competing in the most exciting esports tournaments
            </p>
            
            <motion.a 
              href="/register-team"
              className="group relative inline-block bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 px-16 py-6 rounded-3xl text-white font-black text-2xl overflow-hidden"
              whileHover={{ 
                scale: 1.1, 
                boxShadow: "0 30px 60px rgba(139, 92, 246, 0.4)",
                textShadow: "0 0 20px rgba(255,255,255,0.5)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-4">
                <Zap className="w-8 h-8" />
                Start Your Journey
                <Zap className="w-8 h-8" />
              </span>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500"
                initial={{ x: "100%" }}
                whileHover={{ x: "0%" }}
                transition={{ duration: 0.4 }}
              />
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        className="relative z-10 border-t border-purple-500/20 py-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p 
            className="text-gray-400 text-lg"
            whileHover={{ color: "#a855f7" }}
          >
            © 2025 FragsHub. All rights reserved. Built for champions, designed for legends.
          </motion.p>
        </div>
      </motion.footer>
    </div>
  );
}
