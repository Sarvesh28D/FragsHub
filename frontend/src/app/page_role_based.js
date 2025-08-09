'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import AdminDashboard from './admin/page';
import CustomerHomepage from './customer/page';
import LoadingScreen from '../components/LoadingScreen';

export default function RoleBasedHome() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return <LoadingScreen />;
  }

  // If user is not logged in, show public homepage
  if (!user) {
    return <CustomerHomepage />;
  }

  // If user is admin, show admin dashboard
  if (user.isAdmin) {
    return <AdminDashboard />;
  }

  // Regular user/team/customer sees customer homepage
  return <CustomerHomepage />;
}
