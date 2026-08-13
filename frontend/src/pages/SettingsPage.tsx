import React, { useState, useEffect } from 'react';
import { Settings, Users, Building, Shield, UserPlus, Key, Check } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { User, Role } from '../types/crm';

export const SettingsPage: React.FC = () => {
  const { organization, user: currentUser } = useAuth();
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Invite Form
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<Role>('SALES_REP');

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/users/all');
      setTeamMembers(res.data || []);
    } catch (e) {
      console.error('Failed to fetch team members', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users/invite', { email, fullName, role });
      setShowInviteModal(false);
      setEmail('');
      setFullName('');
      fetchTeam();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to invite user');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-400" />
          Workspace & Team Settings
        </h1>
        <p className="text-xs text-slate-400">Manage team members, roles, authorization permissions, and AI keys</p>
      </div>

      {/* Org Profile */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
          <Building className="w-4 h-4 text-brand-400" />
          Organization Profile
        </h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 font-semibold">Workspace Name</label>
            <p className="font-bold text-slate-100 mt-1">{organization?.name}</p>
          </div>
          <div>
            <label className="text-slate-400 font-semibold">Subscription Tier</label>
            <p className="font-bold text-emerald-400 mt-1 uppercase">{organization?.tier}</p>
          </div>
        </div>
      </div>

      {/* Team Management */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            Team Members ({teamMembers.length})
          </h3>
          {(currentUser?.role === 'OWNER' || currentUser?.role === 'ADMIN') && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Member</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {teamMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-semibold text-slate-100">{m.fullName}</td>
                  <td className="p-3 text-slate-400">{m.email}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-brand-300 border border-slate-700">
                      {m.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-100">Invite Team Member</h3>
            <form onSubmit={handleInviteUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="SALES_MANAGER">SALES_MANAGER</option>
                  <option value="SALES_REP">SALES_REP</option>
                  <option value="VIEWER">VIEWER (Read-only)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowInviteModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
