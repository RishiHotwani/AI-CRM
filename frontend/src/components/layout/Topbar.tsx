import React, { useState } from 'react';
import { Search, Bell, LogOut, User as UserIcon, Building, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  onOpenSearch: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenSearch }) => {
  const { user, organization, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Global Search Bar */}
      <button
        onClick={onOpenSearch}
        className="flex items-center gap-3 px-4 py-2 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 text-sm w-72 transition-all group"
      >
        <Search className="w-4 h-4 group-hover:text-brand-400 transition-colors" />
        <span>Search leads, deals, contacts...</span>
        <kbd className="ml-auto text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">
          ⌘K
        </kbd>
      </button>

      {/* Right Utilities & Profile */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSearch}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
        </button>

        <a
          href="#help"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Help & Documentation"
        >
          <HelpCircle className="w-5 h-5" />
        </a>

        <div className="h-6 w-px bg-slate-800" />

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-slate-200 leading-tight">{user?.fullName}</p>
              <p className="text-[10px] text-slate-400 font-mono capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-800">
                <p className="text-xs font-bold text-slate-200">{user?.fullName}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-brand-400 font-medium">
                  <Building className="w-3 h-3" />
                  <span>{organization?.name}</span>
                </div>
              </div>

              <div className="py-1">
                <a
                  href="/settings"
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>Profile & Settings</span>
                </a>
              </div>

              <div className="border-t border-slate-800 pt-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
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
