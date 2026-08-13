import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Award, Target } from 'lucide-react';
import api from '../api/axios';
import { DashboardStats } from '../types/crm';

export const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (e) {
      console.error('Failed to load analytics', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
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
        <p className="text-xs text-slate-400">Deep performance analytics derived from live MySQL database records</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold">Win Rate</span>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">{stats.winRate}%</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold">Average Deal Size</span>
          <p className="text-2xl font-extrabold text-brand-400 mt-1">${stats.avgDealSize.toLocaleString()}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold">Average Sales Cycle</span>
          <p className="text-2xl font-extrabold text-purple-400 mt-1">{stats.avgSalesCycleDays} days</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold">Conversion Rate</span>
          <p className="text-2xl font-extrabold text-amber-400 mt-1">{stats.conversionRate}%</p>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-slate-200">Pipeline Stage Value Summary</h3>
        <div className="space-y-3">
          {stats.dealPipelineFunnel.map((stage) => (
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
          ))}
        </div>
      </div>
    </div>
  );
};
