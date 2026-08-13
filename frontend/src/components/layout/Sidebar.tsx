import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  UserCheck,
  Activity,
  CheckSquare,
  Calendar,
  Sparkles,
  BookOpen,
  BarChart3,
  Settings,
  ShieldAlert,
  Bot
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { organization } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Leads', path: '/leads', icon: UserCheck },
    { label: 'Contacts', path: '/contacts', icon: Users },
    { label: 'Companies', path: '/companies', icon: Building2 },
    { label: 'Deals & Pipeline', path: '/deals', icon: Briefcase },
    { label: 'Activities', path: '/activities', icon: Activity },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'Calendar', path: '/calendar', icon: Calendar },
    { label: 'AI Assistant', path: '/ai-assistant', icon: Sparkles, badge: 'AI' },
    { label: 'Knowledge Base', path: '/knowledge-base', icon: BookOpen },
    { label: 'Reports & Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Audit Logs', path: '/audit-logs', icon: ShieldAlert },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg glow-brand">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            NexusAI <span className="text-brand-500 text-sm font-semibold">CRM</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium truncate max-w-[130px]">
            {organization?.name || 'Workspace'}
          </p>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-gradient-to-r from-brand-500 to-purple-500 text-white uppercase tracking-wider">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Tagline */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/80 text-xs text-slate-400 text-center">
          <p className="font-semibold text-slate-300">NexusAI CRM v1.0</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Turn interactions into opportunities</p>
        </div>
      </div>
    </aside>
  );
};
