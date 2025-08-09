'use client';

import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock authentication for now to avoid Firebase issues
  useEffect(() => {
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      // Mock user for demo
      setUser({
        uid: 'demo-user',
        email: 'demo@fragshub.com',
        displayName: 'Demo User',
        isAdmin: false
      });
      setLoading(false);
    }, 1000);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    // Mock login
    setTimeout(() => {
      const isAdmin = email.includes('admin');
      setUser({
        uid: 'demo-user',
        email: email,
        displayName: email.split('@')[0],
        isAdmin: isAdmin
      });
      setLoading(false);
    }, 1000);
  };

  const register = async (email, password, displayName) => {
    setLoading(true);
    // Mock register
    setTimeout(() => {
      setUser({
        uid: 'demo-user',
        email: email,
        displayName: displayName || email.split('@')[0],
        isAdmin: false
      });
      setLoading(false);
    }, 1000);
  };

  const logout = async () => {
    setLoading(true);
    setTimeout(() => {
      setUser(null);
      setLoading(false);
    }, 500);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
