import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Briefcase, 
  Search, 
  BarChart3, 
  Target, 
  Compass, 
  User,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import type { HealthResponse } from '../types/health';

interface NavbarProps {
  health?: HealthResponse | null;
  loading?: boolean;
  onRefresh?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: '/careers', label: 'Careers', icon: Briefcase },
    { to: '/jobs', label: 'Live Jobs', icon: Search },
    { to: '/analysis', label: 'Market Demand', icon: BarChart3 },
    { to: '/gaps', label: 'Skill Gaps', icon: Target },
    { to: '/roadmap', label: 'Roadmap', icon: Compass },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* Ambient background glow and glass blur */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xl border-b border-white/[0.07] shadow-[0_4px_30px_rgba(0,0,0,0.4)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link 
          to="/" 
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-3 group shrink-0 focus:outline-none"
        >
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-60 blur-xs group-hover:opacity-100 transition duration-300" />
            <div className="relative h-9 w-9 rounded-xl bg-slate-950 border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight text-white group-hover:text-slate-100 transition-colors">
              Career<span className="bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent">Intelligence</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse hidden sm:block" />
          </div>
        </Link>

        {/* Center Desktop Navigation: Segmented Glass Capsule */}
        <nav className="hidden lg:flex items-center bg-slate-900/60 p-1 rounded-full border border-white/[0.08] backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
          {navItems.map((item) => {
            const isActive =
              item.to === '/careers'
                ? location.pathname === '/' || location.pathname.startsWith('/careers')
                : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={
                  `relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                  }`
                }
              >
                <item.icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Right Section: Quick Action */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link
            to="/profile"
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/40 hover:bg-slate-800 transition-all duration-200 shadow-sm"
          >
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span>My Profile</span>
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 transition-all focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden relative bg-slate-950/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl px-4 pt-3 pb-6 space-y-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 pb-1">
            Platform Navigation
          </div>
          {navItems.map((item) => {
            const isActive =
              item.to === '/careers'
                ? location.pathname === '/' || location.pathname.startsWith('/careers')
                : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-white border border-cyan-500/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-900 text-slate-400'}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-600'}`} />
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-900 flex items-center justify-between px-2">
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-mono text-slate-400 hover:text-cyan-400 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Manage Profile</span>
            </Link>
            <span className="text-[11px] text-slate-500 font-mono">Career Intelligence</span>
          </div>
        </div>
      )}
    </header>
  );
};
