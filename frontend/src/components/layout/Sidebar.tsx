import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  Target
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navGroups = [
  {
    label: 'CRM',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Leads', path: '/leads', icon: UserCheck },
      { label: 'Contacts', path: '/contacts', icon: Users },
      { label: 'Companies', path: '/companies', icon: Building2 },
      { label: 'Deals', path: '/deals', icon: Briefcase },
    ],
  },
  {
    label: 'Productivity',
    items: [
      { label: 'Activities', path: '/activities', icon: Activity },
      { label: 'Tasks', path: '/tasks', icon: CheckSquare },
      { label: 'Calendar', path: '/calendar', icon: Calendar },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'AI Assistant', path: '/ai-assistant', icon: Sparkles, badge: 'AI' },
      { label: 'Knowledge Base', path: '/knowledge-base', icon: BookOpen },
      { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Admin',
    items: [
      { label: 'Audit Logs', path: '/audit-logs', icon: ShieldAlert },
      { label: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const { organization } = useAuth();

  return (
    <aside
      className="glass-sidebar w-60 flex flex-col h-screen sticky top-0 z-30 select-none"
      style={{ minWidth: '240px' }}
    >
      {/* Brand */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--accent)', boxShadow: '0 4px 12px var(--accent-glow)' }}
          >
            <Target className="w-4.5 h-4.5 text-white" style={{ width: '18px', height: '18px' }} />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm tracking-tight leading-none" style={{ color: 'var(--text-primary)' }}>
              Clinch <span style={{ color: 'var(--accent)' }}>CRM</span>
            </h1>
            <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-tertiary)', maxWidth: '140px' }}>
              {organization?.name || 'Workspace'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="section-label">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? 'active' : ''}`
                  }
                >
                  <item.icon style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span
                      className="text-white font-bold"
                      style={{
                        fontSize: '9px',
                        letterSpacing: '0.06em',
                        background: 'var(--accent)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div
          className="rounded-xl px-3 py-2.5 text-center"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}
        >
          <p className="font-semibold" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Clinch CRM v1.0</p>
          <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Close more, faster</p>
        </div>
      </div>
    </aside>
  );
};
