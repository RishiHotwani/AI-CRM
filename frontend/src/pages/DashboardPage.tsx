import React, { useEffect, useState } from 'react';
import {
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  Award,
  CheckSquare,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import api from '../api/axios';
import { DashboardStats } from '../types/crm';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('month');

  useEffect(() => {
    fetchStats();
  }, [timeFilter]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (e) {
      console.error('Failed to load dashboard metrics', e);
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

  const kpis = [
    { label: 'Total Leads', value: stats.totalLeads, icon: Users, color: 'from-blue-500/20 to-indigo-500/20 text-blue-400' },
    { label: 'Qualified Leads', value: stats.qualifiedLeads, icon: Award, color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400' },
    { label: 'Open Deals', value: stats.openDeals, icon: Briefcase, color: 'from-purple-500/20 to-pink-500/20 text-purple-400' },
    { label: 'Pipeline Value', value: `$${(stats.pipelineValue || 0).toLocaleString()}`, icon: DollarSign, color: 'from-brand-500/20 to-purple-500/20 text-brand-400' },
    { label: 'Won Revenue', value: `$${(stats.wonRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'from-amber-500/20 to-orange-500/20 text-amber-400' },
    { label: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: Sparkles, color: 'from-rose-500/20 to-red-500/20 text-rose-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-slate-400">Real-time database metrics & AI-driven revenue intelligence</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
          <Filter className="w-4 h-4 text-slate-500 ml-2" />
          {['today', 'week', 'month', 'quarter'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeFilter(period)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                timeFilter === period
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">{kpi.label}</span>
              <div className={`p-2 rounded-xl bg-gradient-to-br ${kpi.color}`}>
                <kpi.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl font-extrabold text-slate-100 mt-2">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1: Revenue Trend & Pipeline Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              Revenue Over Time
            </h3>
            <span className="text-xs text-slate-500 font-mono">Actual Closed Revenue</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueOverTime}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Stage Funnel */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              Pipeline Stage Funnel
            </h3>
            <span className="text-xs text-slate-500 font-mono">Open Opportunities</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dealPipelineFunnel}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="stageName" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="totalValue" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Leads by Source & Team Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Sources Pie */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-200">Leads by Acquisition Source</h3>
          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.leadsBySource} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={70} label>
                  {stats.leadsBySource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Performance Leaderboard */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Sales Representative Leaderboard
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3">Salesperson</th>
                  <th className="p-3">Deals Won</th>
                  <th className="p-3">Revenue Generated</th>
                  <th className="p-3">Leads Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stats.teamPerformance.map((member) => (
                  <tr key={member.userId} className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-slate-100">{member.name}</td>
                    <td className="p-3">{member.dealsWon} won</td>
                    <td className="p-3 font-bold text-emerald-400">${(member.revenueGenerated || 0).toLocaleString()}</td>
                    <td className="p-3 text-slate-400">{member.leadsAssigned} assigned</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
