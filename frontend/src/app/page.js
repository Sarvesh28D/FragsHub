'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import AdminDashboard from './admin/page';
import CustomerHomepage from './customer/page';
import LoadingScreen from '../components/LoadingScreen';
import RoleSwitcher from '../components/RoleSwitcher';

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
    return (
      <>
        <CustomerHomepage />
        <RoleSwitcher />
      </>
    );
  }

  // If user is admin, show admin dashboard
  if (user.isAdmin) {
    return (
      <>
        <AdminDashboard />
        <RoleSwitcher />
      </>
    );
  }

  // Regular user/team/customer sees customer homepage
  return (
    <>
      <CustomerHomepage />
      <RoleSwitcher />
    </>
  );
}
