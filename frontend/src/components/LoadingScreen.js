'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      {/* Neural Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-12 grid-rows-8 h-full">
          {Array.from({ length: 96 }).map((_, i) => (
            <div
              key={i}
              className="border border-cyan-500/20 animate-pulse"
              style={{
                animationDelay: `${(i * 50)}ms`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      </div>

      {/* Loading Content */}
      <div className="relative z-10 text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-6xl font-gaming text-cyan-400 glow-electric">
            FRAG<span className="text-white">S</span>HUB
          </h1>
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <p className="text-xl font-cyber text-white mb-2">
            INITIALIZING NEURAL INTERFACE...
          </p>
          <p className="text-sm text-gray-400">
            Loading tournament data and user preferences
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="w-80 mx-auto"
        >
          <div className="relative">
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full animate-pulse" />
          </div>
          
          <div className="mt-4 flex justify-between text-sm text-gray-400">
            <span>CONNECTING...</span>
            <span>{progress}%</span>
          </div>
        </motion.div>

        {/* Scanning Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-8"
        >
          <div className="flex items-center justify-center space-x-2 text-cyan-400">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
          </div>
        </motion.div>
      </div>

      {/* Holographic Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-cyan-500/30 rounded-full animate-spin-slow" />
        <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-purple-500/30 rounded-full animate-spin-reverse" />
        <div className="absolute top-1/2 left-10 w-1 h-32 bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent animate-pulse" />
        <div className="absolute top-1/2 right-10 w-1 h-32 bg-gradient-to-b from-transparent via-purple-500/50 to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
}
