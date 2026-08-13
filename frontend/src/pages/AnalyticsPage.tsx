import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Award, Target, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import { DashboardStats } from '../types/crm';

export const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (e: any) {
      console.error('Failed to load analytics', e);
      setError(e.response?.data?.message || 'Failed to fetch analytics metrics from server.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
        <p className="text-xs font-semibold text-slate-400">Loading performance analytics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400 space-y-4 max-w-md mx-auto text-center p-6 glass-card rounded-2xl border border-rose-500/20">
        <div className="p-3 rounded-full bg-rose-500/10 text-rose-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-lg text-slate-100">Unable to Load Analytics</h3>
        <p className="text-xs text-slate-400">{error || 'An unexpected error occurred.'}</p>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-brand-400" />
          Sales & Pipeline Analytics
        </h1>
        <p className="text-xs text-slate-400">Deep performance analytics derived from live database records</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold">Win Rate</span>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">{stats.winRate ?? 0}%</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold">Average Deal Size</span>
          <p className="text-2xl font-extrabold text-brand-400 mt-1">${(stats.avgDealSize || 0).toLocaleString()}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold">Average Sales Cycle</span>
          <p className="text-2xl font-extrabold text-purple-400 mt-1">{stats.avgSalesCycleDays ?? 0} days</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold">Conversion Rate</span>
          <p className="text-2xl font-extrabold text-amber-400 mt-1">{stats.conversionRate ?? 0}%</p>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-slate-200">Pipeline Stage Value Summary</h3>
        <div className="space-y-3">
          {stats.dealPipelineFunnel && stats.dealPipelineFunnel.length > 0 ? (
            stats.dealPipelineFunnel.map((stage) => (
              <div key={stage.stageId} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{stage.stageName} ({stage.dealCount} deals)</span>
                  <span className="text-emerald-400">${(stage.totalValue || 0).toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-600 to-indigo-500 rounded-full"
                    style={{ width: `${Math.min((stage.dealCount / (stats.openDeals || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">No active pipeline stages recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
};
