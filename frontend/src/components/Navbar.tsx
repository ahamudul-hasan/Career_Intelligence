import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Activity, 
  Briefcase, 
  Search, 
  BarChart3, 
  Target, 
  Compass, 
  User
} from 'lucide-react';
import type { HealthResponse } from '../types/health';

interface NavbarProps {
  health: HealthResponse | null;
  loading: boolean;
  onRefresh?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ health, loading }) => {
  const isHealthy = health?.status === 'ok';

  const navItems = [
    { to: '/', label: 'System Health', icon: Activity, end: true },
    { to: '/careers', label: 'Careers', icon: Briefcase },
    { to: '/jobs', label: 'Job Search', icon: Search },
    { to: '/analysis', label: 'Market Analysis', icon: BarChart3 },
    { to: '/gaps', label: 'Skill Gaps', icon: Target },
    { to: '/roadmap', label: 'Roadmap', icon: Compass },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Career Intelligence
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Phase 1 Full
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              Data-Driven CS Career Architecture
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`
              }
            >
              <item.icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Live Backend Connection Status Pill */}
        <div className="flex items-center gap-3">
          <div 
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              loading
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : isHealthy
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}
          >
            <span 
              className={`w-2 h-2 rounded-full ${
                loading
                  ? 'bg-amber-400 animate-pulse'
                  : isHealthy
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                  : 'bg-rose-400'
              }`} 
            />
            <span className="font-mono text-[11px]">
              {loading ? 'Checking...' : isHealthy ? 'API Online' : 'API Offline'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
