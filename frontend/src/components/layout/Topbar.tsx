import React, { useState, useEffect } from 'react';
import { Search, Bell, LogOut, User as UserIcon, Building, Sun, Moon, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface TopbarProps {
  onOpenSearch: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenSearch }) => {
  const { user, organization, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Ctrl+K to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onOpenSearch]);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!showProfileMenu) return;
    const handle = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest('[data-profile-menu]')) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showProfileMenu]);

  return (
    <header
      className="glass-topbar h-14 px-6 flex items-center justify-between sticky top-0 z-20"
    >
      {/* ── Search Bar ── */}
      <button
        onClick={onOpenSearch}
        className="glass-search flex items-center gap-3 rounded-2xl px-4 py-2"
        style={{ width: '100%', maxWidth: '520px', height: '38px' }}
        aria-label="Open global search (⌘K)"
      >
        <Search style={{ width: '14px', height: '14px', color: 'var(--text-tertiary)', flexShrink: 0 }} />
        <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', flex: 1, textAlign: 'left', letterSpacing: '-0.01em' }}>
          Search leads, deals, contacts...
        </span>
        <kbd
          style={{
            fontSize: '10px',
            fontFamily: 'monospace',
            background: 'var(--surface-2)',
            border: '1px solid var(--border-default)',
            padding: '2px 6px',
            borderRadius: '5px',
            color: 'var(--text-tertiary)',
            flexShrink: 0,
          }}
        >
          ⌘K
        </kbd>
      </button>

      {/* ── Right Controls ── */}
      <div className="flex items-center gap-1.5 ml-4">

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="icon-btn"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {isDark
            ? <Sun style={{ width: '16px', height: '16px' }} />
            : <Moon style={{ width: '16px', height: '16px' }} />
          }
        </button>

        {/* Notifications */}
        <button className="icon-btn relative" title="Notifications">
          <Bell style={{ width: '16px', height: '16px' }} />
          <span
            className="absolute"
            style={{
              top: '8px', right: '8px',
              width: '6px', height: '6px',
              background: 'var(--danger)',
              borderRadius: '50%',
              border: '1.5px solid var(--bg-base)',
            }}
          />
        </button>

        {/* Divider */}
        <div style={{ width: '1px', height: '20px', background: 'var(--border-default)', margin: '0 4px' }} />

        {/* User Profile */}
        <div className="relative" data-profile-menu>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-all"
            style={{ background: showProfileMenu ? 'var(--surface-hover)' : 'transparent' }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ background: 'var(--accent)', fontSize: '12px', flexShrink: 0 }}
            >
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                {user?.fullName}
              </p>
              <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'capitalize' }}>
                {user?.role?.toLowerCase()?.replace('_', ' ')}
              </p>
            </div>
          </button>

          {showProfileMenu && (
            <div
              className="glass-panel absolute right-0 mt-2 rounded-2xl py-1.5 animate-slide-down"
              style={{ width: '220px', zIndex: 100 }}
            >
              {/* Header */}
              <div className="px-4 py-2.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.fullName}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                  <Building style={{ width: '10px', height: '10px', color: 'var(--accent)' }} />
                  <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{organization?.name}</span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '9px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      background: 'var(--accent-muted)',
                      color: 'var(--accent)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {organization?.tier}
                  </span>
                </div>
              </div>

              <div className="py-1 px-1.5">
                <a
                  href="/settings"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all"
                  style={{ color: 'var(--text-primary)', fontSize: '12px', fontWeight: 500 }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => setShowProfileMenu(false)}
                >
                  <UserIcon style={{ width: '13px', height: '13px', color: 'var(--text-tertiary)' }} />
                  Profile &amp; Settings
                </a>
              </div>

              <div className="px-1.5 pb-1.5" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                <button
                  onClick={() => { setShowProfileMenu(false); logout(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
                  style={{ color: 'var(--danger)', fontSize: '12px', fontWeight: 500, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,59,48,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut style={{ width: '13px', height: '13px' }} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
