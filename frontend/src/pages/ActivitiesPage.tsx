import React, { useState, useEffect } from 'react';
import { Activity, Plus, Phone, Mail, Calendar, FileText, CheckSquare, MessageSquare } from 'lucide-react';
import api from '../api/axios';
import { Activity as ActivityItem, ActivityType } from '../types/crm';

export const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form
  const [type, setType] = useState<ActivityType>('CALL');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/activities?page=0&size=50');
      setActivities(res.data.content || []);
    } catch (e: any) {
      console.error('Failed to fetch activities', e);
      setError(e.response?.data?.message || 'Failed to fetch activity stream.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/activities', { type, title, description });
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      fetchActivities();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to log activity');
    }
  };

  const getActivityIcon = (actType: ActivityType) => {
    switch (actType) {
      case 'CALL': return <Phone className="w-4 h-4 text-emerald-400" />;
      case 'EMAIL': return <Mail className="w-4 h-4 text-blue-400" />;
      case 'MEETING': return <Calendar className="w-4 h-4 text-purple-400" />;
      case 'NOTE': return <FileText className="w-4 h-4 text-amber-400" />;
      case 'TASK': return <CheckSquare className="w-4 h-4 text-indigo-400" />;
      default: return <MessageSquare className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-brand-400" />
            Activity Stream & Timeline
          </h1>
          <p className="text-xs text-slate-400">Chronological history of calls, emails, meetings, and sales notes</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg glow-brand transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Log Activity</span>
        </button>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
        <h3 className="font-bold text-sm text-slate-200">Recent Customer Interactions</h3>

        {isLoading && (
          <div className="flex items-center justify-center py-8 text-slate-500 gap-2 text-xs">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-500"></div>
            <span>Loading timeline...</span>
          </div>
        )}

        {!isLoading && error && (
          <p className="text-xs text-rose-400 py-8 text-center">{error}</p>
        )}

        {!isLoading && !error && activities.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-8">No activities recorded yet. Click 'Log Activity' to start logging calls, meetings, or notes.</p>
        )}

        <div className="relative border-l border-slate-800 ml-4 space-y-6">
          {!isLoading && !error && activities.map((a) => (
            <div key={a.id} className="relative pl-6 group">
              <div className="absolute -left-3 top-0.5 w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow">
                {getActivityIcon(a.type)}
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-1 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-100">{a.title}</h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(a.createdAt).toLocaleString()}
                  </span>
                </div>
                {a.description && <p className="text-xs text-slate-400">{a.description}</p>}
                <p className="text-[11px] text-brand-400 font-semibold pt-1">By {a.user?.fullName}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Log Activity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-100">Log Customer Interaction</h3>
            <form onSubmit={handleCreateActivity} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300">Activity Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ActivityType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="CALL">Phone Call</option>
                  <option value="EMAIL">Email Communication</option>
                  <option value="MEETING">Meeting / Demo</option>
                  <option value="NOTE">General Note</option>
                  <option value="FOLLOW_UP">Follow-up Action</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Title / Subject *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Discussed enterprise pricing options"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Notes & Details</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key takeaways from customer call..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white">
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
