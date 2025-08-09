'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView, useScroll, useTransform } from 'framer-motion';
import { Gamepad2, Zap, Trophy, Users, Target, Rocket, Crown, Calendar, ArrowRight, Play, Star, Shield, Sparkles } from 'lucide-react';
import WebGLGamingScene from '../components/WebGLGamingScene';

// Client-side Light Particles Component
function LightParticles() {
  const [particles, setParticles] = useState([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Generate particle positions only on client side
    const newParticles = [...Array(20)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 8,
      animationDuration: 8 + Math.random() * 4
    }));
    setParticles(newParticles);
  }, []);

  if (!isClient) return null;

  return (
    <div className="light-particles">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="light-particle"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDelay: `${particle.animationDelay}s`,
            animationDuration: `${particle.animationDuration}s`
          }}
        />
      ))}
    </div>
  );
}

// Floating Geometric Shape Component
function FloatingShape({ geometry, position, color, scale = 1, speed = 1 }) {
  const ref = useRef();
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * speed * 0.5;
      ref.current.rotation.y = state.clock.elapsedTime * speed * 0.3;
      ref.current.rotation.z = state.clock.elapsedTime * speed * 0.2;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.5;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={0.4}>
      <mesh ref={ref} position={position} scale={scale}>
        {geometry}
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.3}
          speed={speed * 2}
          roughness={0}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
}

// Rotating Ring Component
function RotatingRing({ position, color, radius = 2, speed = 1 }) {
  const ref = useRef();
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * speed * 0.5;
      ref.current.rotation.z = state.clock.elapsedTime * speed * 0.8;
    }
  });

  return (
    <group ref={ref} position={position}>
      <Torus args={[radius, 0.1, 16, 100]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={1}
          roughness={0}
        />
      </Torus>
    </group>
  );
}

// DNA Helix Component
function DNAHelix({ position }) {
  const helixRef = useRef();
  
  useFrame((state) => {
    if (helixRef.current) {
      helixRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  const spheres = [];
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 4;
    const y = (i - 10) * 0.3;
    const radius = 1.5;
    
    spheres.push(
      <Float key={`helix-${i}`} speed={2} rotationIntensity={0.2} floatIntensity={0.1}>
        <Sphere
          args={[0.1, 16, 16]}
          position={[
            Math.cos(angle) * radius,
            y,
            Math.sin(angle) * radius
          ]}
        >
          <meshStandardMaterial
            color={i % 2 === 0 ? "#00d4ff" : "#ff0080"}
            emissive={i % 2 === 0 ? "#00d4ff" : "#ff0080"}
            emissiveIntensity={0.4}
          />
        </Sphere>
      </Float>
    );
  }

  return (
    <group ref={helixRef} position={position}>
      {spheres}
    </group>
  );
}

// Energy Orbs with Trails
function EnergyOrbs() {
  const orbsRef = useRef();
  const [orbs, setOrbs] = useState([]);
  
  useEffect(() => {
    const newOrbs = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 15;
      newOrbs.push({
        position: [
          Math.cos(angle) * radius,
          Math.sin(angle * 0.5) * 8,
          Math.sin(angle) * radius
        ],
        color: i % 4 === 0 ? "#00d4ff" : i % 4 === 1 ? "#ff0080" : i % 4 === 2 ? "#8b5cf6" : "#00ff88",
        speed: 0.5 + (i * 0.1) // Use index-based speed instead of random
      });
    }
    setOrbs(newOrbs);
  }, []);
  
  useFrame((state) => {
    if (orbsRef.current) {
      orbsRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  if (orbs.length === 0) return null;

  return (
    <group ref={orbsRef}>
      {orbs.map((orb, index) => (
        <Float key={index} speed={orb.speed * 2} rotationIntensity={0.2} floatIntensity={0.3}>
          <Sphere args={[0.2, 32, 32]} position={orb.position}>
            <meshStandardMaterial
              color={orb.color}
              emissive={orb.color}
              emissiveIntensity={0.8}
              metalness={1}
              roughness={0}
              transparent
              opacity={0.9}
            />
          </Sphere>
          
          {/* Trailing effect */}
          <Sphere 
            args={[0.4, 16, 16]} 
            position={[orb.position[0] * 0.9, orb.position[1] * 0.9, orb.position[2] * 0.9]}
          >
            <meshStandardMaterial
              color={orb.color}
              emissive={orb.color}
              emissiveIntensity={0.3}
              transparent
              opacity={0.3}
            />
          </Sphere>
        </Float>
      ))}
    </group>
  );
}

// Enhanced Particle Field Component
function EnhancedParticleField() {
  const points = useRef();
  const [isReady, setIsReady] = useState(false);
  const particleCount = 3000;
  
  const [particleData, setParticleData] = useState({
    positions: new Float32Array(particleCount * 3),
    colors: new Float32Array(particleCount * 3),
    velocities: new Float32Array(particleCount * 3)
  });

  useEffect(() => {
    const { positions, colors, velocities } = particleData;
    
    for (let i = 0; i < particleCount; i++) {
      // Position - use seeded values for consistency
      const seed = i * 0.001;
      positions[i * 3] = (Math.sin(seed) * Math.cos(seed * 2)) * 30;
      positions[i * 3 + 1] = (Math.cos(seed) * Math.sin(seed * 3)) * 30;
      positions[i * 3 + 2] = (Math.sin(seed * 2) * Math.cos(seed)) * 30;
      
      // Colors - cycle through our theme colors
      const colorIndex = i % 4;
      switch(colorIndex) {
        case 0: // Cyan
          colors[i * 3] = 0;
          colors[i * 3 + 1] = 0.83;
          colors[i * 3 + 2] = 1;
          break;
        case 1: // Purple
          colors[i * 3] = 0.55;
          colors[i * 3 + 1] = 0.37;
          colors[i * 3 + 2] = 0.96;
          break;
        case 2: // Pink
          colors[i * 3] = 1;
          colors[i * 3 + 1] = 0;
          colors[i * 3 + 2] = 0.5;
          break;
        case 3: // Green
          colors[i * 3] = 0;
          colors[i * 3 + 1] = 1;
          colors[i * 3 + 2] = 0.53;
          break;
      }
      
      // Velocities - also seeded
      velocities[i * 3] = Math.sin(seed * 4) * 0.01;
      velocities[i * 3 + 1] = Math.cos(seed * 5) * 0.01;
      velocities[i * 3 + 2] = Math.sin(seed * 6) * 0.01;
    }
    
    setIsReady(true);
  }, [particleCount]);

  // Move useFrame BEFORE conditional return to maintain hook order
  useFrame((state) => {
    if (points.current && isReady) {
      points.current.rotation.x = state.clock.elapsedTime * 0.05;
      points.current.rotation.y = state.clock.elapsedTime * 0.02;
      
      // Update particle positions
      const positions = points.current.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += Math.sin(state.clock.elapsedTime + i) * 0.001;
        positions[i * 3 + 1] += Math.cos(state.clock.elapsedTime + i) * 0.001;
        positions[i * 3 + 2] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.001;
      }
      points.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (!isReady) return null;
  
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particleData.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={particleData.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.03} 
        vertexColors 
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Advanced 3D Scene with Multiple Elements
function Scene3D() {
  const groupRef = useRef();
  const { viewport } = useThree();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <>
      <Environment preset="night" />
      <Stars radius={400} depth={80} count={25000} factor={8} saturation={0} fade speed={1.5} />
      
      {/* Enhanced Lighting */}
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00d4ff" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#ff0080" />
      <pointLight position={[0, 15, 5]} intensity={0.8} color="#8b5cf6" />
      <pointLight position={[15, 0, -5]} intensity={0.8} color="#00ff88" />
      <spotLight position={[0, 20, 0]} intensity={1} angle={0.3} penumbra={1} color="#00d4ff" />
      
      {/* Sparkles Effect */}
      <DreiSparkles count={100} scale={[20, 20, 20]} size={3} speed={0.4} />
      
      <group ref={groupRef}>
        {/* Main Spheres */}
        <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
          <Sphere args={[1.5, 64, 64]} position={[0, 0, 0]}>
            <MeshDistortMaterial
              color="#00d4ff"
              attach="material"
              distort={0.4}
              speed={3}
              roughness={0}
              metalness={0.8}
              emissive="#00d4ff"
              emissiveIntensity={0.2}
            />
          </Sphere>
        </Float>
        
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.3}>
          <Sphere args={[0.8, 32, 32]} position={[4, 1, -3]}>
            <MeshDistortMaterial
              color="#ff0080"
              attach="material"
              distort={0.6}
              speed={2}
              roughness={0}
              metalness={0.9}
              emissive="#ff0080"
              emissiveIntensity={0.2}
            />
          </Sphere>
        </Float>
        
        <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.4}>
          <Sphere args={[0.6, 32, 32]} position={[-3, -1, 2]}>
            <MeshDistortMaterial
              color="#8b5cf6"
              attach="material"
              distort={0.8}
              speed={4}
              roughness={0}
              metalness={1}
              emissive="#8b5cf6"
              emissiveIntensity={0.2}
            />
          </Sphere>
        </Float>

        {/* Additional Geometric Shapes */}
        <FloatingShape 
          geometry={<boxGeometry args={[1, 1, 1]} />}
          position={[6, 2, 1]}
          color="#00ff88"
          scale={0.8}
          speed={1.5}
        />
        
        <FloatingShape 
          geometry={<icosahedronGeometry args={[0.8]} />}
          position={[-4, 3, -1]}
          color="#ff0080"
          scale={1.2}
          speed={2}
        />
        
        <FloatingShape 
          geometry={<octahedronGeometry args={[0.6]} />}
          position={[2, -2, 3]}
          color="#8b5cf6"
          scale={1}
          speed={1.8}
        />
        
        <FloatingShape 
          geometry={<boxGeometry args={[0.5, 2, 0.5]} />}
          position={[-6, 0, -2]}
          color="#00d4ff"
          scale={1.1}
          speed={1.3}
        />

        {/* Rotating Rings */}
        <RotatingRing position={[8, 0, 0]} color="#00d4ff" radius={1.5} speed={1} />
        <RotatingRing position={[-8, 0, 0]} color="#ff0080" radius={1.2} speed={-1.5} />
        <RotatingRing position={[0, 6, -4]} color="#8b5cf6" radius={2} speed={0.8} />
        <RotatingRing position={[0, -6, 4]} color="#00ff88" radius={1.8} speed={-1.2} />

        {/* DNA Helix */}
        <DNAHelix position={[-10, 0, 5]} />
        <DNAHelix position={[10, 0, -5]} />

        {/* More Floating Elements */}
        <Float speed={3} rotationIntensity={0.6} floatIntensity={0.6}>
          <Torus args={[1, 0.3, 16, 100]} position={[0, 4, 6]}>
            <meshStandardMaterial
              color="#00ff88"
              emissive="#00ff88"
              emissiveIntensity={0.3}
              metalness={1}
              roughness={0}
            />
          </Torus>
        </Float>

        <Float speed={2.5} rotationIntensity={0.8} floatIntensity={0.5}>
          <Torus args={[0.8, 0.2, 16, 100]} position={[0, -4, -6]}>
            <meshStandardMaterial
              color="#ff0080"
              emissive="#ff0080"
              emissiveIntensity={0.3}
              metalness={1}
              roughness={0}
            />
          </Torus>
        </Float>
      </group>

      {/* Enhanced Particle Field */}
      <EnhancedParticleField />
      
      {/* Energy Orbs */}
      <EnergyOrbs />
    </>
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
      {/* Constellation Background */}
      <div className="constellation-bg"></div>
      
      {/* Light Particles */}
      <LightParticles />

      {/* Dynamic Background with Enhanced Gradient Mesh */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              radial-gradient(circle at 15% 85%, rgba(0, 212, 255, 0.3) 0%, transparent 70%),
              radial-gradient(circle at 85% 15%, rgba(255, 0, 128, 0.3) 0%, transparent 70%),
              radial-gradient(circle at 45% 45%, rgba(139, 92, 246, 0.25) 0%, transparent 60%),
              radial-gradient(circle at 70% 80%, rgba(0, 255, 136, 0.2) 0%, transparent 65%),
              radial-gradient(circle at 30% 20%, rgba(255, 165, 0, 0.15) 0%, transparent 50%),
              linear-gradient(45deg, rgba(0, 0, 0, 0.9) 0%, rgba(5, 5, 15, 0.95) 100%)
            `
          }}
        />
        
        {/* Animated Mesh Gradient with More Complexity */}
        <motion.div
          className="absolute inset-0 opacity-15"
          animate={{
            background: [
              "radial-gradient(600px circle at 20% 30%, rgba(0, 212, 255, 0.4), transparent 40%), radial-gradient(800px circle at 80% 70%, rgba(255, 0, 128, 0.3), transparent 40%)",
              "radial-gradient(800px circle at 60% 80%, rgba(139, 92, 246, 0.4), transparent 40%), radial-gradient(600px circle at 40% 20%, rgba(0, 255, 136, 0.3), transparent 40%)",
              "radial-gradient(700px circle at 80% 20%, rgba(255, 0, 128, 0.4), transparent 40%), radial-gradient(900px circle at 20% 80%, rgba(0, 212, 255, 0.3), transparent 40%)",
              "radial-gradient(600px circle at 40% 60%, rgba(0, 255, 136, 0.4), transparent 40%), radial-gradient(800px circle at 70% 30%, rgba(139, 92, 246, 0.3), transparent 40%)"
            ]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Moving Light Rays */}
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            background: `
              linear-gradient(45deg, transparent 30%, rgba(0, 212, 255, 0.6) 50%, transparent 70%),
              linear-gradient(-45deg, transparent 30%, rgba(255, 0, 128, 0.4) 50%, transparent 70%)
            `,
            backgroundSize: '200% 200%'
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Enhanced Noise Texture Overlay */}
        <div 
          className="absolute inset-0 opacity-8"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' fill='%23001122' opacity='0.6'/%3E%3C/svg%3E")`,
            mixBlendMode: 'multiply'
          }}
        />
      </div>

      {/* 3D Scene Background */}
      <div className="fixed inset-0 z-10">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <Scene3D />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            autoRotate 
            autoRotateSpeed={0.1}
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
            {/* Main Title with Hardcore Gaming Typography */}
            <motion.div className="mb-8">
              <motion.h1 
                className="text-6xl md:text-8xl lg:text-9xl font-gaming leading-none mb-4 glow-electric text-gaming-glow"
                animate={{ 
                  textShadow: [
                    "0 0 30px #00ffff, 0 0 60px #00ffff, 0 0 90px #00ffff",
                    "0 0 40px #39ff14, 0 0 80px #39ff14, 0 0 120px #39ff14",
                    "0 0 50px #ff073a, 0 0 100px #ff073a, 0 0 150px #ff073a",
                    "0 0 30px #00ffff, 0 0 60px #00ffff, 0 0 90px #00ffff"
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                ENTER THE
              </motion.h1>
              
              <motion.h2 
                className="text-5xl md:text-7xl lg:text-8xl font-gaming glow-laser"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  textShadow: [
                    "0 0 20px #ff073a, 0 0 40px #ff073a, 0 0 60px #ff073a",
                    "0 0 30px #bf00ff, 0 0 60px #bf00ff, 0 0 90px #bf00ff",
                    "0 0 20px #ff073a, 0 0 40px #ff073a, 0 0 60px #ff073a"
                  ]
                }}
                transition={{ 
                  scale: { duration: 1, delay: 1, ease: "easeOut" },
                  opacity: { duration: 1, delay: 1, ease: "easeOut" },
                  textShadow: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }
                }}
              >
                ARENA
              </motion.h2>
            </motion.div>
            
            {/* Subtitle with Gaming Glow Effect */}
            <motion.p 
              className="text-xl md:text-3xl lg:text-4xl font-future mb-12 max-w-4xl mx-auto leading-relaxed"
              style={{
                color: '#ffffff',
                textShadow: '0 0 20px rgba(0, 255, 255, 0.4), 0 0 40px rgba(57, 255, 20, 0.2)'
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.5, ease: "easeOut" }}
            >
              Where <span className="font-cyber glow-electric">legends</span> are forged, 
              <span className="font-cyber glow-plasma"> champions</span> rise, and 
              <span className="font-cyber glow-neon"> dreams</span> become reality
            </motion.p>

            {/* Gaming CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 2, ease: "easeOut" }}
            >
              <motion.a 
                href="/register-team"
                className="btn-gaming relative overflow-hidden group"
                whileHover={{ 
                  scale: 1.05,
                  y: -2
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center gap-3 font-gaming">
                  <Play className="w-6 h-6" />
                  DOMINATE NOW
                  <Zap className="w-6 h-6" />
                </span>
              </motion.a>
              
              <motion.a 
                href="/teams"
                className="glass-gaming px-8 py-4 font-cyber text-lg relative overflow-hidden group hover:glass-neon transition-all duration-300"
                whileHover={{ 
                  scale: 1.05,
                  y: -2
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-3 glow-neon">
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
            className="text-5xl md:text-6xl font-gaming text-center mb-20 glow-electric"
            variants={itemVariants}
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
            className="text-5xl md:text-6xl font-gaming text-center mb-24 glow-laser"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
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
              className="text-6xl md:text-8xl font-gaming mb-8 glow-plasma"
            >
              READY TO ASCEND?
            </motion.h2>
            <motion.p 
              className="text-2xl md:text-3xl font-future mb-16 max-w-4xl mx-auto leading-relaxed"
              style={{
                color: '#ffffff',
                textShadow: '0 0 20px rgba(0, 255, 255, 0.3)'
              }}
            >
              Join the <span className="font-cyber glow-electric">elite ranks</span> of legendary warriors competing in the most 
              <span className="font-cyber glow-plasma"> prestigious</span> esports tournaments ever created
            </motion.p>
            
            <motion.a 
              href="/register-team"
              className="btn-gaming inline-block text-2xl font-gaming px-16 py-6"
              whileHover={{ 
                scale: 1.1,
                y: -5
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-4">
                <Rocket className="w-8 h-8" />
                ENTER THE LEGEND
                <Star className="w-8 h-8" />
              </span>
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
