// src/components/Navbar.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // For active link highlighting
import { useAuth } from '../../app/auth/context'; // Assuming this path is correct

// Lucide React Icons
import {
  Calendar,
  BookOpen,
  Bot,
  Network,
  Repeat,
  Warehouse,
  Users,
  LogOut,
  User,
  Menu,
  X,
  ChevronDown,
  BarChart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // For animations

// Helper for conditional classes
import clsx from 'clsx'; // npm install clsx

// Define navigation link structure
const navLinks = [
  {
    href: '/reports',
    label: 'Raporlar',
    icon: <BarChart className="w-5 h-5" />,
    badge: null,
  },
  {
    href: '/calender', // Corrected typo: 'calendar' (assuming this maps to your calendar page)
    label: 'Takvim',
    icon: <Calendar className="w-5 h-5" />,
    badge: null,
  },
  {
    href: '/guidelist',
    label: 'Rehberler',
    icon: <BookOpen className="w-5 h-5" />,
    badge: null,
  },
  {
    href: '/asistan',
    label: 'Asistan',
    icon: <Bot className="w-5 h-5" />,
    badge: null,
  },
  {
    href: '/SanalHat',
    label: 'SanalHat',
    icon: <Network className="w-5 h-5" />,
    badge: 'LIVE',
  },

  {
    href: '/anomal', // Assuming this is the Cycle page
    label: 'Cycle',
    icon: <Repeat className="w-5 h-5" />,
    badge: null,
  },
  {
    href: '/Depo',
    label: 'Depo',
    icon: <Warehouse className="w-5 h-5" />,
    badge: null,
  },

  {
    href: '/squad',
    label: 'Ekip',
    icon: <Users className="w-5 h-5" />,
    badge: null,
  },
];

// Reusable NavLink component for desktop and mobile
interface NavLinkItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | null;
  isActive: boolean;
  onClick?: () => void; // For mobile menu closing
}

const NavLinkItem: React.FC<NavLinkItemProps> = React.memo(
  ({ href, label, icon, badge, isActive, onClick }) => (
    <Link
      href={href}
      className={clsx(
        'relative flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300',
        'text-gray-200 hover:text-white hover:bg-blue-800/50',
        isActive
          ? 'bg-blue-700 text-white shadow-lg scale-105' // Active state
          : 'bg-transparent',
        'focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-gray-900', // Focus for accessibility
      )}
      tabIndex={0}
      onClick={onClick}
    >
      <motion.span
        className="flex-shrink-0"
        initial={false} // Prevent initial animation on load
        animate={{ scale: isActive ? 1.1 : 1, color: isActive ? '#FFFFFF' : '#E0E0E0' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {icon}
      </motion.span>
      <span className="relative z-10">{label}</span>
      {badge && (
        <motion.span
          className={clsx(
            'ml-auto text-xs px-2 py-0.5 rounded-full font-bold',
            badge === 'NEW' && 'bg-gradient-to-r from-green-400 to-green-700 text-white shadow',
            badge === 'LIVE' &&
              'bg-gradient-to-r from-red-500 to-red-800 text-white shadow animate-pulse',
          )}
          initial={{ opacity: 0, x: 5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {badge}
        </motion.span>
      )}
      {isActive && ( // Active tab underline/indicator
        <motion.div
          layoutId="active-nav-link" // Unique ID for layout animations
          className="absolute bottom-0 left-0 w-full h-1 bg-blue-400 rounded-full"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '100%', opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  ),
);
NavLinkItem.displayName = 'NavLinkItem'; // For React DevTools

// User Profile/Auth Button
interface UserAuthButtonProps {
  user: { name: string; role: string } | null;
  logout: () => void;
  onCloseMenu?: () => void; // For mobile
}

const UserAuthButton: React.FC<UserAuthButtonProps> = ({ user, logout, onCloseMenu }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownRef]);

  return (
    <div className="relative">
      {user ? (
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 text-white font-medium shadow-inner hover:bg-white/25 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
        >
          <span className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500 text-white text-sm font-bold">
            {user.name.charAt(0)}
          </span>
          <span className="hidden sm:inline-block">{user.name}</span>
          <ChevronDown
            className={clsx('w-4 h-4 transition-transform', dropdownOpen && 'rotate-180')}
          />
        </button>
      ) : (
        <Link
          href="/auth/Login"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-green-400 via-lime-500 to-green-700 hover:from-green-500 hover:to-lime-600 shadow-xl hover:scale-110 transition-all focus:outline-none focus:ring-4 focus:ring-lime-400/60 border-2 border-white/10"
          tabIndex={0}
          aria-label="Giriş"
          onClick={onCloseMenu}
        >
          <User className="w-6 h-6 text-white" />
        </Link>
      )}

      <AnimatePresence>
        {dropdownOpen && user && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-200"
          >
            <div className="p-3 text-sm text-gray-700 border-b border-gray-100">
              <p className="font-semibold">{user.name}</p>
              <p className="text-gray-500 text-xs">{user.role}</p>
            </div>
            <button
              onClick={() => {
                logout();
                setDropdownOpen(false);
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              Çıkış Yap
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
UserAuthButton.displayName = 'UserAuthButton';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname(); // Get current path for active link
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  // Trap focus in mobile menu (optional, can be complex for full accessibility)
  // useEffect(() => {
  //   if (!menuOpen) return;
  //   const focusable = menuRef.current?.querySelectorAll<HTMLElement>(
  //     'a, button, [tabindex]:not([tabindex="-1"])'
  //   );
  //   focusable?.[0]?.focus();
  // }, [menuOpen]);

  return (
    <nav className="w-full bg-gradient-to-r from-gray-950 via-gray-900 to-blue-950 shadow-2xl sticky top-0 z-50 font-sans backdrop-blur-lg border-b border-blue-900/30">
      {/* max-w-screen-2xl yerine w-full kullanıldı. Bu, içeriğin daha sola doğru yayılmasını sağlar. */}
      <div className="w-full mx-auto px-4 sm:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-xl"
        >
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-900 shadow-xl border-2 border-blue-400">
            {/* Custom SVG for better control */}
            <svg
              className="w-8 h-8 text-white group-hover:scale-110 transition-transform"
              fill="currentColor" // Changed to currentColor for easy styling
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2L3 9h3v12h12V9h3L12 2zm0 3.82L19.18 11H4.82L12 5.82zM7 11h10v8H7v-8z" />
            </svg>
          </span>
          <span className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-blue-300 via-blue-400 to-gray-200 bg-clip-text text-transparent drop-shadow-lg">
            R&D Dashboard
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-5">
          <AnimatePresence>
            <motion.div layout className="flex items-center space-x-5">
              {navLinks.map((link) => (
                <NavLinkItem
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  icon={link.icon}
                  badge={link.badge}
                  isActive={pathname === link.href}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* User/Auth Section for Desktop */}
          <UserAuthButton user={user} logout={logout} />
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex items-center text-white focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-xl"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Menüyü Kapat' : 'Menüyü Aç'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={menuOpen ? 'open' : 'closed'}
              initial={{ rotate: menuOpen ? -90 : 0, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: menuOpen ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {menuOpen ? <X className="w-9 h-9" /> : <Menu className="w-9 h-9" />}
            </motion.div>
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="md:hidden bg-gradient-to-br from-gray-950 to-blue-950 px-4 pb-4 space-y-3 rounded-b-2xl shadow-2xl border-t border-blue-900/30 overflow-hidden"
          >
            {navLinks.map((link) => (
              <NavLinkItem
                key={link.href}
                href={link.href}
                label={link.label}
                icon={link.icon}
                badge={link.badge}
                isActive={pathname === link.href}
                onClick={() => setMenuOpen(false)} // Close menu on link click
              />
            ))}
            {/* User/Auth Section for Mobile */}
            <div className="pt-4 border-t border-blue-900/50">
              <UserAuthButton user={user} logout={logout} onCloseMenu={() => setMenuOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
