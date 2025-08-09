'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView, useScroll, useTransform } from 'framer-motion';
import { Gamepad2, Zap, Trophy, Users, Target, Rocket, Crown, Calendar, ArrowRight, Play, Star, Shield, Sparkles } from 'lucide-react';
import WebGLGamingScene from '../components/WebGLGamingScene';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  
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
        <nav className="absolute top-0 left-0 right-0 z-50 p-6">
          <div className="flex justify-between items-center">
            <div className="font-gaming text-2xl text-cyan-400 glow-electric">
              FRAGSHUB
            </div>
            <div className="flex space-x-6 text-white font-cyber">
              <a href="#tournaments" className="hover:text-cyan-400 transition-colors">TOURNAMENTS</a>
              <a href="#teams" className="hover:text-cyan-400 transition-colors">TEAMS</a>
              <a href="#leaderboard" className="hover:text-cyan-400 transition-colors">LEADERBOARD</a>
              <a href="#register" className="btn-gaming px-4 py-2">JOIN BATTLE</a>
            </div>
          </div>
        </nav>

        {/* Hero Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center max-w-4xl mx-auto px-6">
            <motion.h1 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="font-gaming text-6xl md:text-8xl text-white mb-6 glow-electric"
            >
              ENTER THE<br />
              <span className="text-cyan-400">MATRIX</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 }}
              className="font-cyber text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto"
            >
              Experience the ultimate gaming tournament platform with next-gen WebGL graphics, 
              real-time neural connections, and cyberpunk aesthetics.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center pointer-events-auto"
            >
              <button className="btn-gaming px-8 py-4 text-lg font-bold">
                <Play className="w-6 h-6 mr-2" />
                JACK IN NOW
              </button>
              <button className="border-2 border-cyan-400 text-cyan-400 px-8 py-4 text-lg font-bold hover:bg-cyan-400 hover:text-black transition-all duration-300">
                WATCH DEMO
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Additional Sections with Cyberpunk Theme */}
      <section className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-gaming text-4xl md:text-6xl text-center text-white mb-16 glow-electric"
          >
            NEURAL <span className="text-green-400">FEATURES</span>
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-12 h-12" />,
                title: "QUANTUM TOURNAMENTS",
                description: "Real-time multiplayer battles with instant neural feedback and advanced AI matchmaking."
              },
              {
                icon: <Shield className="w-12 h-12" />,
                title: "CYBER SECURITY",
                description: "Military-grade encryption and blockchain-verified results for ultimate gaming integrity."
              },
              {
                icon: <Crown className="w-12 h-12" />,
                title: "ELITE RANKINGS",
                description: "Advanced ELO system with neural pattern analysis and skill progression tracking."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="bg-black/50 border border-cyan-400 p-8 rounded-lg backdrop-blur-sm hover:border-green-400 transition-all duration-300 group"
              >
                <div className="text-cyan-400 mb-4 group-hover:text-green-400 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="font-cyber text-xl text-white mb-4 group-hover:text-green-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-300 font-tech leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-900/20 to-green-900/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "50K+", label: "ACTIVE NEURONS" },
              { value: "1000+", label: "DAILY BATTLES" },
              { value: "$2M+", label: "PRIZE POOL" },
              { value: "99.9%", label: "UPTIME" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="font-gaming text-3xl md:text-5xl text-cyan-400 glow-electric mb-2">
                  {stat.value}
                </div>
                <div className="font-cyber text-gray-300 text-sm md:text-base">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto text-center px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-gaming text-4xl md:text-6xl text-white mb-8 glow-electric"
          >
            READY TO <span className="text-red-400">DOMINATE</span>?
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-cyber text-xl text-gray-300 mb-8"
          >
            Join the neural network. Compete with legends. Claim your digital throne.
          </motion.p>
          
          <motion.button 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="btn-gaming px-12 py-6 text-xl font-bold"
          >
            <Gamepad2 className="w-8 h-8 mr-3" />
            INITIALIZE CONNECTION
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-cyan-400 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="font-gaming text-2xl text-cyan-400 glow-electric mb-4">
            FRAGSHUB
          </div>
          <div className="font-mono text-sm text-gray-400">
            © 2025 FragsHub Neural Network. All rights reserved. | Powered by WebGL 2.0 & Custom Shaders
          </div>
        </div>
      </footer>
    </>
  );
}
