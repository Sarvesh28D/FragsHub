'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Crown, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function RoleSwitcher() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const switchRole = async (newRole) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        isAdmin: newRole === 'admin'
      });
      
      // Force a page reload to refresh the user context
      window.location.reload();
    } catch (error) {
      console.error('Error switching role:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Role Indicator Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl border transition-all duration-300 ${
            user.isAdmin 
              ? 'bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30' 
              : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {user.isAdmin ? (
            <Crown className="w-4 h-4" />
          ) : (
            <User className="w-4 h-4" />
          )}
          <span className="font-semibold">
            {user.isAdmin ? 'Admin' : 'Customer'}
          </span>
          <Settings className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </motion.button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="absolute top-full right-0 mt-2 w-56 backdrop-blur-xl bg-gray-900/90 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* User Info */}
              <div className="p-4 border-b border-white/10">
                <p className="text-white font-semibold">{user.displayName || 'User'}</p>
                <p className="text-gray-400 text-sm">{user.email}</p>
              </div>

              {/* Role Switching Options */}
              <div className="p-2">
                <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold px-3 py-2">
                  Switch Role
                </p>
                
                {/* Admin Role Option */}
                <motion.button
                  onClick={() => switchRole('admin')}
                  disabled={loading || user.isAdmin}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    user.isAdmin 
                      ? 'bg-purple-500/20 text-purple-300 cursor-not-allowed' 
                      : 'hover:bg-purple-500/20 text-white hover:text-purple-300'
                  }`}
                  whileHover={!user.isAdmin ? { x: 4 } : {}}
                >
                  <Crown className="w-4 h-4" />
                  <span className="font-medium">Admin Dashboard</span>
                  {user.isAdmin && (
                    <span className="ml-auto text-xs bg-purple-500/30 px-2 py-1 rounded-full">
                      Current
                    </span>
                  )}
                </motion.button>

                {/* Customer Role Option */}
                <motion.button
                  onClick={() => switchRole('customer')}
                  disabled={loading || !user.isAdmin}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    !user.isAdmin 
                      ? 'bg-cyan-500/20 text-cyan-300 cursor-not-allowed' 
                      : 'hover:bg-cyan-500/20 text-white hover:text-cyan-300'
                  }`}
                  whileHover={user.isAdmin ? { x: 4 } : {}}
                >
                  <User className="w-4 h-4" />
                  <span className="font-medium">Customer View</span>
                  {!user.isAdmin && (
                    <span className="ml-auto text-xs bg-cyan-500/30 px-2 py-1 rounded-full">
                      Current
                    </span>
                  )}
                </motion.button>
              </div>

              {/* Logout Option */}
              <div className="p-2 border-t border-white/10">
                <motion.button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-all duration-200"
                  whileHover={{ x: 4 }}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Logout</span>
                </motion.button>
              </div>

              {/* Loading Indicator */}
              {loading && (
                <motion.div
                  className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
