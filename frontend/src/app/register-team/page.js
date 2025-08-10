'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshWobbleMaterial, OrbitControls } from '@react-three/drei';
import { UserPlus, X, Check, Users, Trophy, Target, Gamepad2 } from 'lucide-react';

// 3D Wobbling Sphere Component
function WobbleSphere() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} scale={1.5}>
      <MeshWobbleMaterial
        color="#06b6d4"
        attach="material"
        factor={1}
        speed={2}
        roughness={0}
      />
    </Sphere>
  );
}

export default function RegisterTeam() {
  const [teamData, setTeamData] = useState({
    teamName: '',
    teamTag: '',
    captain: '',
    players: ['', '', '', ''],
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const updatePlayer = (index, value) => {
    const newPlayers = [...teamData.players];
    newPlayers[index] = value;
    setTeamData({...teamData, players: newPlayers});
  };

  const addPlayer = () => {
    if (teamData.players.length < 6) {
      setTeamData({...teamData, players: [...teamData.players, '']});
    }
  };

  const removePlayer = (index) => {
    if (teamData.players.length > 1) {
      const newPlayers = teamData.players.filter((_, i) => i !== index);
      setTeamData({...teamData, players: newPlayers});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://fragshub-backend.onrender.com/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setTeamData({
          teamName: '',
          teamTag: '',
          captain: '',
          players: ['', '', '', ''],
          email: '',
          phone: ''
        });
        setCurrentStep(1);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting team:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, title: 'Team Info', icon: Users },
    { id: 2, title: 'Players', icon: Gamepad2 },
    { id: 3, title: 'Contact', icon: Target },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-purple-900/10 to-black"></div>
        <div className="absolute top-20 right-20 w-96 h-96 opacity-30">
          <Canvas>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <WobbleSphere />
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
            
            <motion.a 
              href="/"
              className="text-white/80 hover:text-cyan-400 transition-colors font-semibold"
              whileHover={{ x: -5 }}
            >
              ← Back to Home
            </motion.a>
          </div>
        </div>
      </motion.nav>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-12"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-6xl font-black text-white mb-6"
          >
            Register Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              Team
            </span>
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Join the ultimate esports tournament and compete with the best teams worldwide
          </motion.p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div 
          className="flex justify-center mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex space-x-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                  currentStep >= step.id 
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white' 
                    : 'bg-white/10 text-gray-400'
                }`}
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <step.icon className="w-5 h-5" />
                <span className="font-semibold">{step.title}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-8 md:p-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-bold text-white mb-6">Team Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div whileFocus={{ scale: 1.02 }}>
                      <label className="block text-white font-semibold mb-3">Team Name</label>
                      <input
                        type="text"
                        value={teamData.teamName}
                        onChange={(e) => setTeamData({...teamData, teamName: e.target.value})}
                        className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                        placeholder="Enter your team name"
                        required
                      />
                    </motion.div>
                    
                    <motion.div whileFocus={{ scale: 1.02 }}>
                      <label className="block text-white font-semibold mb-3">Team Tag</label>
                      <input
                        type="text"
                        value={teamData.teamTag}
                        onChange={(e) => setTeamData({...teamData, teamTag: e.target.value})}
                        className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                        placeholder="e.g., [FRAGS]"
                        maxLength="10"
                      />
                    </motion.div>
                  </div>
                  
                  <motion.div whileFocus={{ scale: 1.02 }}>
                    <label className="block text-white font-semibold mb-3">Team Captain</label>
                    <input
                      type="text"
                      value={teamData.captain}
                      onChange={(e) => setTeamData({...teamData, captain: e.target.value})}
                      className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                      placeholder="Captain's gamer tag"
                      required
                    />
                  </motion.div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-white">Team Players</h3>
                    <motion.button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        console.log('Add player button clicked, current players:', teamData.players.length);
                        addPlayer();
                      }}
                      className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 rounded-lg text-white font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={teamData.players.length >= 6}
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Add Player</span>
                    </motion.button>
                  </div>
                  
                  <div className="space-y-4">
                    {teamData.players.map((player, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center space-x-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex-1">
                          <input
                            type="text"
                            value={player}
                            onChange={(e) => updatePlayer(index, e.target.value)}
                            className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                            placeholder={`Player ${index + 1} gamer tag`}
                            required={index < 4}
                          />
                        </div>
                        {teamData.players.length > 4 && (
                          <motion.button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              console.log('Remove player button clicked for index:', index);
                              removePlayer(index);
                            }}
                            className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <X className="w-4 h-4" />
                          </motion.button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
                  
                  <motion.div whileFocus={{ scale: 1.02 }}>
                    <label className="block text-white font-semibold mb-3">Email Address</label>
                    <input
                      type="email"
                      value={teamData.email}
                      onChange={(e) => setTeamData({...teamData, email: e.target.value})}
                      className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                      placeholder="team@example.com"
                      required
                    />
                  </motion.div>
                  
                  <motion.div whileFocus={{ scale: 1.02 }}>
                    <label className="block text-white font-semibold mb-3">Phone Number</label>
                    <input
                      type="tel"
                      value={teamData.phone}
                      onChange={(e) => setTeamData({...teamData, phone: e.target.value})}
                      className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                      placeholder="+1 (555) 123-4567"
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8">
              {currentStep > 1 && (
                <motion.button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Previous step button clicked, current step:', currentStep);
                    setCurrentStep(currentStep - 1);
                  }}
                  className="px-8 py-4 bg-white/10 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Previous
                </motion.button>
              )}
              
              <div className="ml-auto">
                {currentStep < 3 ? (
                  <motion.button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('Next step button clicked, current step:', currentStep);
                      setCurrentStep(currentStep + 1);
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(139, 92, 246, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Next Step
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500"
                    whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      if (!isSubmitting) {
                        console.log('Register team submit button clicked');
                      }
                    }}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-5 h-5" />
                        <span>Register Team</span>
                      </div>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </form>
        </motion.div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {submitStatus && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.8 }}
              className={`mt-8 p-6 rounded-2xl border-2 text-center ${
                submitStatus === 'success'
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              <div className="flex items-center justify-center space-x-3 mb-3">
                {submitStatus === 'success' ? (
                  <Check className="w-8 h-8" />
                ) : (
                  <X className="w-8 h-8" />
                )}
                <h3 className="text-xl font-bold">
                  {submitStatus === 'success' ? 'Registration Successful!' : 'Registration Failed'}
                </h3>
              </div>
              <p className="text-lg">
                {submitStatus === 'success'
                  ? 'Your team has been registered successfully. You will receive confirmation details soon!'
                  : 'There was an error registering your team. Please try again.'}
              </p>
              {submitStatus === 'error' && (
                <motion.button
                  onClick={() => setSubmitStatus(null)}
                  className="mt-4 px-6 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/30 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  Try Again
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
