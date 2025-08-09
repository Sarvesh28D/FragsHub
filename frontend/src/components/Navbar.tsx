'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Trophy, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Register', href: '/register-team' },
    { name: 'Bracket', href: '/bracket' },
    { name: 'Leaderboard', href: '/leaderboard' },
  ];

  return (
    <nav className="bg-secondary-900 border-b border-secondary-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-primary-500" />
              <span className="font-gaming text-xl font-bold text-accent-100">
                FragsHub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-accent-200 hover:text-primary-500 px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center space-x-4">
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    className="text-accent-200 hover:text-primary-500 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-accent-300" />
                  <span className="text-accent-200 text-sm">{user.email}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-accent-200 hover:text-primary-500 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-accent-200 hover:text-accent-100 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-secondary-800">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-accent-200 hover:text-primary-500 block px-3 py-2 text-sm font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {user ? (
              <div className="border-t border-secondary-700 pt-4">
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    className="text-accent-200 hover:text-primary-500 block px-3 py-2 text-sm font-medium transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <div className="px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-accent-300" />
                    <span className="text-accent-200 text-sm">{user.email}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="text-accent-200 hover:text-primary-500 block px-3 py-2 text-sm font-medium transition-colors w-full text-left"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-primary-500 hover:bg-primary-600 text-white block px-3 py-2 rounded-md text-sm font-medium transition-colors mx-3 mt-4"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
