import React, { useState, useEffect } from 'react';
import { Search, Bell, LogOut, User as UserIcon, Building, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  onOpenSearch: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenSearch }) => {
  const { user, organization, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifCount] = useState(3); // Could be wired to real API later

  // Ctrl+K / Cmd+K keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  // Close profile menu on outside click
  useEffect(() => {
    if (!showProfileMenu) return;
    const handle = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-profile-menu]')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showProfileMenu]);

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">

      {/* Global Search Bar — clickable, opens modal */}
      <button
        onClick={onOpenSearch}
        className="flex items-center gap-3 px-4 py-2 bg-slate-950/60 border border-slate-800 hover:border-brand-500/50 hover:bg-slate-950/80 rounded-xl text-slate-400 text-sm w-72 transition-all group focus:outline-none focus:border-brand-500"
        aria-label="Open global search"
      >
        <Search className="w-4 h-4 group-hover:text-brand-400 transition-colors flex-shrink-0" />
        <span className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors">Search leads, deals, contacts...</span>
        <kbd className="ml-auto text-[10px] bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded-md text-slate-500 font-mono flex-shrink-0">
          ⌘K
        </kbd>
      </button>

      {/* Right Utilities & Profile */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors relative"
          title="Notifications"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5" />
          {notifCount > 0 && (
            <>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
            </>
          )}
        </button>

        <a
          href="https://github.com/RishiHotwani/AI-CRM"
          target="_blank"
          rel="noreferrer"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Help & Documentation"
        >
          <HelpCircle className="w-5 h-5" />
        </a>

        <div className="h-6 w-px bg-slate-800 mx-1" />

        {/* User Profile Dropdown */}
        <div className="relative" data-profile-menu>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
            aria-label="Open profile menu"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-slate-200 leading-tight">{user?.fullName}</p>
              <p className="text-[10px] text-slate-400 font-mono capitalize">{user?.role?.toLowerCase()?.replace('_', ' ')}</p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/60 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
              {/* User info */}
              <div className="px-4 py-3 border-b border-slate-800">
                <p className="text-xs font-bold text-slate-100">{user?.fullName}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</p>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-brand-400 font-medium">
                  <Building className="w-3 h-3" />
                  <span className="truncate">{organization?.name}</span>
                  <span className="ml-auto text-[10px] bg-brand-500/10 border border-brand-500/20 text-brand-400 px-1.5 py-0.5 rounded font-mono uppercase">
                    {organization?.tier}
                  </span>
                </div>
              </div>

              <div className="py-1">
                <a
                  href="/settings"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>Profile &amp; Settings</span>
                </a>
              </div>

              <div className="border-t border-slate-800 pt-1">
                <button
                  onClick={() => { setShowProfileMenu(false); logout(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
