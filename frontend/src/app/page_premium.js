'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView, useScroll, useTransform } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Stars, Environment } from '@react-three/drei';
import { Gamepad2, Zap, Trophy, Users, Target, Rocket, Crown, Calendar, ArrowRight, Play, Star, Shield, Sparkles } from 'lucide-react';

// Advanced 3D Scene with Multiple Elements
function Scene3D() {
  const groupRef = useRef();
  const { viewport } = useThree();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return (
    <>
      <Environment preset="night" />
      <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade speed={1} />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00d4ff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff0080" />
      
      <group ref={groupRef}>
        <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
          <Sphere args={[1.5, 64, 64]} position={[0, 0, 0]}>
            <MeshDistortMaterial
              color="#00d4ff"
              attach="material"
              distort={0.4}
              speed={3}
              roughness={0}
              metalness={0.8}
            />
          </Sphere>
        </Float>
        
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.3}>
          <Sphere args={[0.8, 32, 32]} position={[3, 1, -2]}>
            <MeshDistortMaterial
              color="#ff0080"
              attach="material"
              distort={0.6}
              speed={2}
              roughness={0}
              metalness={0.9}
            />
          </Sphere>
        </Float>
        
        <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.4}>
          <Sphere args={[0.6, 32, 32]} position={[-2.5, -1, 1]}>
            <MeshDistortMaterial
              color="#8b5cf6"
              attach="material"
              distort={0.8}
              speed={4}
              roughness={0}
              metalness={1}
            />
          </Sphere>
        </Float>
      </group>
    </>
  );
}

// Particle Field Component
function ParticleField() {
  const points = useRef();
  const particleCount = 2000;
  
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    
    colors[i * 3] = Math.random();
    colors[i * 3 + 1] = Math.random() * 0.5 + 0.5;
    colors[i * 3 + 2] = 1;
  }
  
  useFrame((state) => {
    if (points.current) {
      points.current.rotation.x = state.clock.elapsedTime * 0.05;
      points.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });
  
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} vertexColors />
    </points>
  );
}

export default function HomePage() {
  const [stats, setStats] = useState({
    totalTournaments: 0,
    activeTournaments: 0,
    registeredTeams: 0,
    totalPrizePool: 0
  });
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://fragshub-backend.onrender.com';
        
        const teamsResponse = await fetch(`${apiBase}/api/teams`);
        const teamsData = await teamsResponse.json();
        
        setStats({
          totalTournaments: 5,
          activeTournaments: 2,
          registeredTeams: teamsData.teams?.length || 0,
          totalPrizePool: 50000
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setStats({
          totalTournaments: 5,
          activeTournaments: 2,
          registeredTeams: 12,
          totalPrizePool: 50000
        });
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
        delayChildren: 0.3,
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Dynamic Background with Gradient Mesh */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, #00d4ff 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, #ff0080 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, #8b5cf6 0%, transparent 50%),
              radial-gradient(circle at 60% 30%, #00ff88 0%, transparent 50%),
              linear-gradient(45deg, #000000 0%, #0a0a0a 100%)
            `
          }}
        />
        
        {/* Animated Mesh Gradient */}
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              "linear-gradient(45deg, #00d4ff, #ff0080, #8b5cf6, #00ff88)",
              "linear-gradient(90deg, #ff0080, #8b5cf6, #00ff88, #00d4ff)",
              "linear-gradient(135deg, #8b5cf6, #00ff88, #00d4ff, #ff0080)",
              "linear-gradient(180deg, #00ff88, #00d4ff, #ff0080, #8b5cf6)"
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Noise Texture Overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* 3D Scene Background */}
      <div className="fixed inset-0 z-10">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <Scene3D />
          <ParticleField />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            autoRotate 
            autoRotateSpeed={0.2}
            enableDamping
            dampingFactor={0.05}
          />
        </Canvas>
      </div>

      {/* Navigation with Holographic Effect */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-50"
      >
        <div 
          className="backdrop-blur-2xl border-b"
          style={{
            background: `linear-gradient(135deg, 
              rgba(0, 212, 255, 0.08) 0%, 
              rgba(255, 0, 128, 0.08) 50%, 
              rgba(139, 92, 246, 0.08) 100%)`,
            borderImage: `linear-gradient(90deg, 
              rgba(0, 212, 255, 0.3), 
              rgba(255, 0, 128, 0.3), 
              rgba(139, 92, 246, 0.3)) 1`
          }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <motion.div 
                className="flex items-center space-x-4"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="relative w-12 h-12 rounded-2xl overflow-hidden"
                  animate={{ 
                    boxShadow: [
                      "0 0 20px rgba(0, 212, 255, 0.5)",
                      "0 0 30px rgba(255, 0, 128, 0.5)",
                      "0 0 20px rgba(139, 92, 246, 0.5)",
                      "0 0 30px rgba(0, 255, 136, 0.5)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(45deg, 
                        #00d4ff, #ff0080, #8b5cf6, #00ff88)`,
                    }}
                  />
                  <motion.div
                    className="absolute inset-1 bg-black rounded-xl flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-6 h-6 text-cyan-400" />
                  </motion.div>
                </motion.div>
                <div>
                  <motion.h1 
                    className="text-3xl font-black tracking-wider"
                    style={{
                      background: `linear-gradient(90deg, #00d4ff, #ff0080, #8b5cf6)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                      textShadow: '0 0 30px rgba(0, 212, 255, 0.5)'
                    }}
                  >
                    FragsHub
                  </motion.h1>
                  <motion.p className="text-xs text-cyan-400/70 font-medium tracking-widest">
                    ELITE GAMING ARENA
                  </motion.p>
                </div>
              </motion.div>
              
              <nav className="hidden lg:flex space-x-8">
                {[
                  { href: "/tournaments", label: "Tournaments", icon: Trophy },
                  { href: "/teams", label: "Teams", icon: Users },
                  { href: "/bracket", label: "Live Bracket", icon: Target },
                  { href: "/leaderboard", label: "Leaderboard", icon: Crown }
                ].map((item, index) => (
                  <motion.a 
                    key={item.href}
                    href={item.href}
                    className="group relative flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300"
                    whileHover={{ 
                      scale: 1.05,
                      textShadow: "0 0 20px rgba(0, 212, 255, 0.8)"
                    }}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.6 }}
                  >
                    <item.icon className="w-4 h-4 text-cyan-400/70 group-hover:text-cyan-400 transition-colors" />
                    <span 
                      className="font-semibold text-white/80 group-hover:text-white transition-colors"
                      style={{
                        textShadow: '0 0 10px rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      {item.label}
                    </span>
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
                  className="group relative px-8 py-3 rounded-2xl font-bold text-white overflow-hidden"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(0, 212, 255, 0.4)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: `linear-gradient(135deg, 
                      rgba(0, 212, 255, 0.8) 0%, 
                      rgba(255, 0, 128, 0.8) 50%, 
                      rgba(139, 92, 246, 0.8) 100%)`,
                  }}
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <Rocket className="w-5 h-5" />
                    <span>Join Battle</span>
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500"
                    initial={{ x: "100%" }}
                    whileHover={{ x: "0%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
                
                <motion.a 
                  href="/admin"
                  className="group relative px-8 py-3 rounded-2xl font-bold text-white border backdrop-blur-xl"
                  whileHover={{ 
                    scale: 1.05,
                    borderColor: "rgba(139, 92, 246, 0.8)",
                    boxShadow: "0 10px 30px rgba(139, 92, 246, 0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    borderImage: `linear-gradient(135deg, 
                      rgba(0, 212, 255, 0.5), 
                      rgba(255, 0, 128, 0.5), 
                      rgba(139, 92, 246, 0.5)) 1`,
                    background: `rgba(0, 0, 0, 0.3)`
                  }}
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Admin</span>
                  </span>
                </motion.a>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-20 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
          >
            {/* Main Title with Advanced Typography */}
            <motion.div className="mb-8">
              <motion.h1 
                className="text-6xl md:text-8xl lg:text-9xl font-black leading-none mb-4"
                style={{
                  background: `linear-gradient(135deg, 
                    #00d4ff 0%, 
                    #ff0080 25%, 
                    #8b5cf6 50%, 
                    #00ff88 75%, 
                    #00d4ff 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  backgroundSize: '200% 200%',
                  textShadow: '0 0 80px rgba(0, 212, 255, 0.5), 0 0 120px rgba(255, 0, 128, 0.3)'
                }}
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              >
                ENTER THE
              </motion.h1>
              
              <motion.h2 
                className="text-5xl md:text-7xl lg:text-8xl font-black"
                style={{
                  background: `linear-gradient(135deg, 
                    #ff0080 0%, 
                    #8b5cf6 50%, 
                    #00d4ff 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  textShadow: '0 0 60px rgba(255, 0, 128, 0.6)'
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 1, ease: "easeOut" }}
              >
                ARENA
              </motion.h2>
            </motion.div>
            
            {/* Subtitle with Glow Effect */}
            <motion.p 
              className="text-xl md:text-3xl lg:text-4xl text-white/90 mb-12 max-w-4xl mx-auto font-light leading-relaxed"
              style={{
                textShadow: '0 0 30px rgba(255, 255, 255, 0.3)'
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.5, ease: "easeOut" }}
            >
              Where <span className="font-bold text-cyan-400">legends</span> are forged, 
              <span className="font-bold text-purple-400"> champions</span> rise, and 
              <span className="font-bold text-pink-400"> dreams</span> become reality
            </motion.p>

            {/* CTA Buttons with Premium Effects */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 2, ease: "easeOut" }}
            >
              <motion.a 
                href="/register-team"
                className="group relative px-12 py-6 rounded-3xl text-white font-black text-xl overflow-hidden"
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 30px 60px rgba(0, 212, 255, 0.4)",
                  textShadow: "0 0 30px rgba(255, 255, 255, 0.8)"
                }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(0, 212, 255, 0.9) 0%, 
                    rgba(255, 0, 128, 0.9) 50%, 
                    rgba(139, 92, 246, 0.9) 100%)`,
                  border: '2px solid transparent',
                  backgroundClip: 'padding-box'
                }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Play className="w-6 h-6" />
                  DOMINATE NOW
                  <Zap className="w-6 h-6" />
                </span>
                <motion.div 
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, 
                      rgba(255, 0, 128, 0.9) 0%, 
                      rgba(139, 92, 246, 0.9) 50%, 
                      rgba(0, 212, 255, 0.9) 100%)`
                  }}
                  initial={{ x: "100%" }}
                  whileHover={{ x: "0%" }}
                  transition={{ duration: 0.4 }}
                />
              </motion.a>
              
              <motion.a 
                href="/teams"
                className="group relative px-12 py-6 rounded-3xl text-white font-black text-xl backdrop-blur-xl"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: `rgba(0, 0, 0, 0.4)`,
                  border: '2px solid',
                  borderImage: `linear-gradient(135deg, 
                    rgba(0, 212, 255, 0.8), 
                    rgba(255, 0, 128, 0.8), 
                    rgba(139, 92, 246, 0.8)) 1`
                }}
              >
                <span className="flex items-center gap-3">
                  <Users className="w-6 h-6" />
                  VIEW WARRIORS
                </span>
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section with Holographic Cards */}
      <motion.section 
        ref={ref}
        className="relative z-20 py-32"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.h2 
            className="text-5xl md:text-6xl font-black text-center mb-20"
            variants={itemVariants}
            style={{
              background: `linear-gradient(135deg, #00d4ff, #ff0080, #8b5cf6)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 0 50px rgba(0, 212, 255, 0.5)'
            }}
          >
            LIVE BATTLEFIELD
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                value: loading ? '...' : stats.registeredTeams, 
                label: 'Elite Teams', 
                color: 'from-cyan-400 to-blue-500', 
                icon: Users,
                glow: 'rgba(0, 212, 255, 0.5)'
              },
              { 
                value: loading ? '...' : stats.registeredTeams * 5, 
                label: 'Warriors', 
                color: 'from-purple-400 to-pink-500', 
                icon: Gamepad2,
                glow: 'rgba(139, 92, 246, 0.5)'
              },
              { 
                value: stats.activeTournaments, 
                label: 'Live Battles', 
                color: 'from-green-400 to-cyan-500', 
                icon: Trophy,
                glow: 'rgba(0, 255, 136, 0.5)'
              },
              { 
                value: `$${stats.totalPrizePool.toLocaleString()}`, 
                label: 'Prize Pool', 
                color: 'from-yellow-400 to-orange-500', 
                icon: Crown,
                glow: 'rgba(255, 193, 7, 0.5)'
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="group relative backdrop-blur-2xl rounded-3xl border p-8 text-center overflow-hidden"
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05, 
                  rotateY: 5,
                }}
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(0, 0, 0, 0.4) 0%, 
                    rgba(0, 0, 0, 0.2) 100%)`,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: `0 25px 50px ${stat.glow}20`
                }}
              >
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${stat.glow}, transparent)`
                  }}
                />
                
                <motion.div
                  className={`w-20 h-20 bg-gradient-to-r ${stat.color} rounded-3xl mx-auto mb-6 flex items-center justify-center relative`}
                  whileHover={{ 
                    rotate: 360,
                    boxShadow: `0 0 40px ${stat.glow}`
                  }}
                  transition={{ duration: 0.8 }}
                >
                  <stat.icon className="w-10 h-10 text-white" />
                  <motion.div
                    className="absolute inset-0 rounded-3xl"
                    style={{
                      background: `linear-gradient(45deg, transparent, ${stat.glow}40, transparent)`
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
                
                <motion.div 
                  className={`text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-4`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 * index }}
                  style={{
                    textShadow: `0 0 30px ${stat.glow}`
                  }}
                >
                  {stat.value}
                </motion.div>
                
                <div 
                  className="text-white/90 text-xl font-bold tracking-wider"
                  style={{
                    textShadow: '0 0 20px rgba(255, 255, 255, 0.3)'
                  }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="relative z-20 py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.h2 
            className="text-5xl md:text-6xl font-black text-center mb-24"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            style={{
              background: `linear-gradient(135deg, #ff0080, #8b5cf6, #00d4ff)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 0 50px rgba(255, 0, 128, 0.5)'
            }}
          >
            DOMINATION FEATURES
          </motion.h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
              { 
                icon: Target, 
                title: 'Real-time Warfare', 
                desc: 'Live tournament brackets with instant updates, real-time match results, and dynamic leaderboards that showcase the heat of battle.', 
                color: 'from-cyan-400 to-blue-500',
                accent: '#00d4ff'
              },
              { 
                icon: Users, 
                title: 'Elite Squads', 
                desc: 'Advanced team management system with detailed player profiles, performance analytics, and strategic team composition tools.', 
                color: 'from-purple-400 to-pink-500',
                accent: '#8b5cf6'
              },
              { 
                icon: Trophy, 
                title: 'Legendary Rewards', 
                desc: 'Compete for substantial prize pools, exclusive titles, prestigious ranks, and recognition in the hall of champions.', 
                color: 'from-green-400 to-cyan-500',
                accent: '#00ff88'
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="group relative backdrop-blur-2xl rounded-3xl border p-10 overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 * index }}
                whileHover={{ 
                  scale: 1.02, 
                  rotateY: 3,
                }}
                viewport={{ once: true }}
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(0, 0, 0, 0.6) 0%, 
                    rgba(0, 0, 0, 0.3) 100%)`,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: `0 25px 50px ${feature.accent}20`
                }}
              >
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700"
                  style={{
                    background: `linear-gradient(135deg, ${feature.accent}, transparent)`
                  }}
                />
                
                <motion.div
                  className={`w-24 h-24 bg-gradient-to-r ${feature.color} rounded-3xl mb-8 flex items-center justify-center relative`}
                  whileHover={{ 
                    rotate: 360, 
                    scale: 1.1,
                    boxShadow: `0 0 50px ${feature.accent}80`
                  }}
                  transition={{ duration: 0.8 }}
                >
                  <feature.icon className="w-12 h-12 text-white" />
                  <motion.div
                    className="absolute inset-0 rounded-3xl"
                    style={{
                      background: `conic-gradient(from 0deg, transparent, ${feature.accent}60, transparent)`
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
                
                <h3 
                  className="text-3xl font-black text-white mb-6"
                  style={{
                    textShadow: `0 0 20px ${feature.accent}50`
                  }}
                >
                  {feature.title}
                </h3>
                <p 
                  className="text-white/80 text-lg leading-relaxed"
                  style={{
                    textShadow: '0 0 10px rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-20 py-40">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-6xl md:text-8xl font-black mb-8"
              style={{
                background: `linear-gradient(135deg, #00d4ff, #ff0080, #8b5cf6, #00ff88)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textShadow: '0 0 80px rgba(0, 212, 255, 0.6)'
              }}
            >
              READY TO ASCEND?
            </motion.h2>
            <motion.p 
              className="text-2xl md:text-3xl text-white/90 mb-16 max-w-4xl mx-auto leading-relaxed"
              style={{
                textShadow: '0 0 30px rgba(255, 255, 255, 0.3)'
              }}
            >
              Join the <span className="font-black text-cyan-400">elite ranks</span> of legendary warriors competing in the most 
              <span className="font-black text-purple-400"> prestigious</span> esports tournaments ever created
            </motion.p>
            
            <motion.a 
              href="/register-team"
              className="group relative inline-block px-20 py-8 rounded-full text-white font-black text-2xl overflow-hidden"
              whileHover={{ 
                scale: 1.1, 
                boxShadow: "0 40px 80px rgba(0, 212, 255, 0.5)",
                textShadow: "0 0 40px rgba(255, 255, 255, 1)"
              }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: `linear-gradient(135deg, 
                  rgba(0, 212, 255, 0.9) 0%, 
                  rgba(255, 0, 128, 0.9) 25%,
                  rgba(139, 92, 246, 0.9) 50%,
                  rgba(0, 255, 136, 0.9) 75%,
                  rgba(0, 212, 255, 0.9) 100%)`,
                backgroundSize: '300% 300%'
              }}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <span className="relative z-10 flex items-center gap-4">
                <Rocket className="w-8 h-8" />
                ENTER THE LEGEND
                <Star className="w-8 h-8" />
              </span>
              <motion.div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(255, 0, 128, 0.9) 0%, 
                    rgba(139, 92, 246, 0.9) 25%,
                    rgba(0, 255, 136, 0.9) 50%,
                    rgba(0, 212, 255, 0.9) 75%,
                    rgba(255, 0, 128, 0.9) 100%)`
                }}
                initial={{ x: "100%" }}
                whileHover={{ x: "0%" }}
                transition={{ duration: 0.6 }}
              />
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        className="relative z-20 py-16 border-t backdrop-blur-2xl"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        style={{
          background: `linear-gradient(135deg, 
            rgba(0, 0, 0, 0.8) 0%, 
            rgba(0, 0, 0, 0.6) 100%)`,
          borderImage: `linear-gradient(90deg, 
            rgba(0, 212, 255, 0.3), 
            rgba(255, 0, 128, 0.3), 
            rgba(139, 92, 246, 0.3)) 1`
        }}
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.p 
            className="text-white/70 text-lg"
            style={{
              textShadow: '0 0 20px rgba(255, 255, 255, 0.1)'
            }}
            whileHover={{ 
              color: "#8b5cf6",
              textShadow: "0 0 30px rgba(139, 92, 246, 0.8)"
            }}
          >
            © 2025 FragsHub. All rights reserved. <span className="font-bold">Built for champions, designed for legends.</span>
          </motion.p>
        </div>
      </motion.footer>
    </div>
  );
}
