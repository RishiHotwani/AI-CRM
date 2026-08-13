import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Video, MapPin, Clock, Sparkles } from 'lucide-react';
import api from '../api/axios';
import { Meeting } from '../types/crm';

export const CalendarPage: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/meetings?page=0&size=50');
      setMeetings(res.data.content || []);
    } catch (e: any) {
      console.error('Failed to fetch meetings', e);
      setError(e.response?.data?.message || 'Failed to fetch calendar meetings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(endTime) <= new Date(startTime)) {
      alert('End time must be strictly after start time');
      return;
    }
    try {
      await api.post('/meetings', {
        title,
        description,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        meetingLink,
      });
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      setMeetingLink('');
      fetchMeetings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to schedule meeting');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-purple-400" />
            Calendar & Schedules
          </h1>
          <p className="text-xs text-slate-400">View upcoming demos, customer calls, and AI transcript summaries</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            {(['day', 'week', 'month'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  viewMode === m ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg glow-brand transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-200">Scheduled Events ({viewMode.toUpperCase()} VIEW)</h3>

          {isLoading && (
            <div className="flex items-center justify-center py-8 text-slate-500 gap-2 text-xs">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-500"></div>
              <span>Loading calendar events...</span>
            </div>
          )}

          {!isLoading && error && (
            <p className="text-xs text-rose-400 py-8 text-center">{error}</p>
          )}

          {!isLoading && !error && meetings.length === 0 && (
            <p className="text-xs text-slate-500 py-8 text-center">No upcoming meetings scheduled. Click "Schedule Meeting" above to create an event.</p>
          )}

          <div className="space-y-3">
            {!isLoading && !error && meetings.map((m) => (
              <div key={m.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-100">{m.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{m.description || 'Customer Sync Call'}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brand-400" />
                      {new Date(m.startTime).toLocaleString()}
                    </span>
                    {m.meetingLink && (
                      <a href={m.meetingLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-brand-400 hover:underline">
                        <Video className="w-3.5 h-3.5" /> Join Video
                      </a>
                    )}
                  </div>
                </div>
                <span className="px-2 py-1 rounded-lg text-[10px] font-extrabold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Organizer: {m.organizer?.fullName || 'System'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Meeting Transcript Summarizer Card */}
        <div className="glass-card p-5 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-slate-900 via-slate-900 to-purple-950/20 space-y-4">
          <div className="flex items-center gap-2 text-purple-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold text-sm text-slate-100">AI Transcript Assistant</h3>
          </div>
          <p className="text-xs text-slate-400">
            Paste raw Zoom/Teams transcript notes to automatically generate action items, key discussion points, and follow-up email drafts.
          </p>
          <textarea
            rows={5}
            placeholder="Paste meeting notes/transcript here..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          />
          <button className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Generate Action Items</span>
          </button>
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-100">Schedule Meeting</h3>
            <form onSubmit={handleCreateMeeting} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300">Meeting Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enterprise Technical Architecture Demo"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Start Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300">End Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Meeting Link (Zoom / Meet)</label>
                <input
                  type="text"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/xyz-abc-123"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white">
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
