import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, AlertCircle, Clock, CheckCircle2, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { Task, TaskPriority, TaskStatus } from '../types/crm';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/tasks?page=0&size=50');
      setTasks(res.data.content || []);
    } catch (e: any) {
      console.error('Failed to fetch tasks', e);
      setError(e.response?.data?.message || 'Failed to fetch task list.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      setDueDate('');
      fetchTasks();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    try {
      await api.put(`/tasks/${task.id}`, { status: nextStatus });
      fetchTasks();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Delete task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-400" />
            Task Management
          </h1>
          <p className="text-xs text-slate-400">Track follow-ups, priorities, and automatically flagged overdue items</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg glow-brand transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 p-5 space-y-4">
        <div className="space-y-2">
          {isLoading && (
            <div className="flex items-center justify-center py-8 text-slate-500 gap-2 text-xs">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-500"></div>
              <span>Loading task checklist...</span>
            </div>
          )}

          {!isLoading && error && (
            <p className="text-xs text-rose-400 py-8 text-center">{error}</p>
          )}

          {!isLoading && !error && tasks.length === 0 && (
            <p className="text-xs text-slate-500 py-8 text-center">No active tasks created. Click "New Task" above to create your first task.</p>
          )}

          {!isLoading && !error && tasks.map((t) => (
            <div
              key={t.id}
              className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                t.status === 'COMPLETED'
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  : t.isOverdue
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleStatus(t)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    t.status === 'COMPLETED' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {t.status === 'COMPLETED' && <CheckCircle2 className="w-4 h-4" />}
                </button>

                <div>
                  <h4 className={`font-bold text-sm ${t.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                    {t.title}
                  </h4>
                  {t.description && <p className="text-xs text-slate-400">{t.description}</p>}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {t.isOverdue && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    <AlertCircle className="w-3 h-3" /> Overdue
                  </span>
                )}

                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                  t.priority === 'URGENT' ? 'bg-rose-500/20 text-rose-300' :
                  t.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {t.priority}
                </span>

                <button onClick={() => handleDeleteTask(t.id)} className="text-slate-500 hover:text-rose-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-100">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300">Task Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Send contract proposal to Acme Corp"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Due Date</label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white">
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
