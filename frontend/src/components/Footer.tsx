import Link from 'next/link';
import { Trophy, Mail, MessageCircle, Github, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-secondary-900 border-t border-secondary-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Trophy className="h-8 w-8 text-primary-500" />
              <span className="font-gaming text-xl font-bold text-accent-100">
                FragsHub
              </span>
            </div>
            <p className="text-accent-300 text-sm leading-relaxed max-w-md">
              The ultimate free-to-use esports tournament management platform. 
              Create, manage, and compete in tournaments with automated brackets, 
              payment processing, and real-time updates.
            </p>
            <div className="flex space-x-4 mt-6">
              <a
                href="https://discord.gg/fragshub"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-400 hover:text-primary-500 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/fragshub"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-400 hover:text-primary-500 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://github.com/fragshub"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-400 hover:text-primary-500 transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-accent-100 font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: 'Home', href: '/' },
                { name: 'Register Team', href: '/register-team' },
                { name: 'Tournament Bracket', href: '/bracket' },
                { name: 'Leaderboard', href: '/leaderboard' },
                { name: 'Rules', href: '/rules' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-accent-300 hover:text-primary-500 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-accent-100 font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:support@fragshub.com"
                  className="text-accent-300 hover:text-primary-500 text-sm transition-colors flex items-center space-x-1"
                >
                  <Mail className="h-4 w-4" />
                  <span>support@fragshub.com</span>
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/fragshub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-300 hover:text-primary-500 text-sm transition-colors flex items-center space-x-1"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Discord Server</span>
                </a>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-accent-300 hover:text-primary-500 text-sm transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-accent-300 hover:text-primary-500 text-sm transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-accent-400 text-sm">
              © {new Date().getFullYear()} FragsHub. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="/privacy"
                className="text-accent-400 hover:text-primary-500 text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-accent-400 hover:text-primary-500 text-sm transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
