import React, { useEffect, useState } from 'react';
import {
  Users, Briefcase, DollarSign, TrendingUp, Award, Sparkles, Filter, AlertCircle, RefreshCw, BarChart3, Target, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid,
  RadialBarChart, RadialBar, Legend
} from 'recharts';
import api from '../api/axios';
import { DashboardStats } from '../types/crm';

const PALETTE = ['#0A84FF', '#30d158', '#ffd60a', '#ff375f', '#bf5af2', '#64d2ff'];

// Custom tooltip for charts
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel rounded-xl px-3 py-2" style={{ border: '1px solid var(--border-default)', minWidth: '120px' }}>
      {label && <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ fontSize: '13px', fontWeight: 700, color: p.color || 'var(--text-primary)' }}>
          {p.name === 'value' || p.name === 'totalValue' || p.name === 'revenueGenerated'
            ? `$${(p.value || 0).toLocaleString()}`
            : p.value}
        </p>
      ))}
    </div>
  );
};

// Donut chart center label
const DonutCenter = ({ cx, cy, label, sublabel }: { cx: number; cy: number; label: string; sublabel: string }) => (
  <g>
    <text x={cx} y={cy - 8} textAnchor="middle" style={{ fill: 'var(--text-primary)', fontSize: '20px', fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>{label}</text>
    <text x={cx} y={cy + 12} textAnchor="middle" style={{ fill: 'var(--text-tertiary)', fontSize: '10px', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>{sublabel}</text>
  </g>
);

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState('month');

  useEffect(() => { fetchStats(); }, [timeFilter]);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get(`/dashboard/stats?period=${timeFilter}`);
      setStats(res.data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load dashboard metrics. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
        <div className="spinner" style={{ width: '28px', height: '28px' }} />
        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: 500 }}>Loading dashboard metrics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px', maxWidth: '360px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,59,48,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AlertCircle style={{ width: '22px', height: '22px', color: 'var(--danger)' }} />
        </div>
        <div>
          <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Unable to Load Dashboard</p>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{error}</p>
        </div>
        <button onClick={fetchStats} className="btn-primary flex items-center gap-2">
          <RefreshCw style={{ width: '13px', height: '13px' }} />
          Retry
        </button>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Leads', value: stats.totalLeads ?? 0, icon: Users, color: '#0A84FF', trend: '+12%' },
    { label: 'Qualified', value: stats.qualifiedLeads ?? 0, icon: Award, color: '#30d158', trend: '+8%' },
    { label: 'Open Deals', value: stats.openDeals ?? 0, icon: Briefcase, color: '#bf5af2', trend: '+3%' },
    { label: 'Pipeline', value: `$${((stats.pipelineValue || 0) / 1000).toFixed(0)}k`, icon: DollarSign, color: '#0A84FF', trend: '+18%' },
    { label: 'Won Revenue', value: `$${((stats.wonRevenue || 0) / 1000).toFixed(0)}k`, icon: TrendingUp, color: '#30d158', trend: '+24%' },
    { label: 'Win Rate', value: `${stats.winRate ?? 0}%`, icon: Target, color: '#ffd60a', trend: '+2%' },
  ];

  const winRateData = [
    { name: 'Win Rate', value: stats.winRate ?? 0, fill: '#0A84FF' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Real-time sales intelligence &amp; pipeline overview</p>
        </div>

        {/* Period Filter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            background: 'var(--surface-1)',
            border: '1px solid var(--border-default)',
            borderRadius: '12px',
            padding: '3px',
          }}
        >
          {['today', 'week', 'month', 'quarter'].map(p => (
            <button
              key={p}
              onClick={() => setTimeFilter(p)}
              style={{
                padding: '5px 12px',
                borderRadius: '9px',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'capitalize',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '-0.01em',
                transition: 'all 0.15s ease',
                background: timeFilter === p ? 'var(--accent)' : 'transparent',
                color: timeFilter === p ? 'white' : 'var(--text-secondary)',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
        {kpis.map((kpi, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div
                style={{
                  width: '32px', height: '32px', borderRadius: '10px',
                  background: `${kpi.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <kpi.icon style={{ width: '15px', height: '15px', color: kpi.color }} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--success)', background: 'rgba(48,209,88,0.12)', padding: '2px 6px', borderRadius: '6px', letterSpacing: '0.02em' }}>
                {kpi.trend}
              </span>
            </div>
            <p style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', lineHeight: 1 }}>{kpi.value}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', fontWeight: 500, letterSpacing: '-0.01em' }}>{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* ── Charts Row 1 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Revenue Area Chart */}
        <div className="glass-card rounded-2xl p-5">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Revenue Over Time</p>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Closed &amp; won deals</p>
            </div>
            <TrendingUp style={{ width: '16px', height: '16px', color: 'var(--accent)' }} />
          </div>
          <div style={{ height: '220px' }}>
            {stats.revenueOverTime?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.revenueOverTime}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0A84FF" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#0A84FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke="var(--border-subtle)" />
                  <XAxis dataKey="label" tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="value" stroke="#0A84FF" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: '#0A84FF', stroke: 'var(--bg-base)', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px' }}>
                <BarChart3 style={{ width: '28px', height: '28px', color: 'var(--border-strong)', strokeWidth: 1 }} />
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>No revenue data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Pipeline Funnel – 3D-style gradient bars */}
        <div className="glass-card rounded-2xl p-5">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Pipeline Funnel</p>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Value by stage</p>
            </div>
            <Briefcase style={{ width: '16px', height: '16px', color: '#30d158' }} />
          </div>
          <div style={{ height: '220px' }}>
            {stats.dealPipelineFunnel?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.dealPipelineFunnel} layout="vertical" barSize={14}>
                  <defs>
                    {PALETTE.map((c, i) => (
                      <linearGradient key={i} id={`bar${i}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={c} stopOpacity={0.8} />
                        <stop offset="100%" stopColor={c} stopOpacity={1} />
                      </linearGradient>
                    ))}
                  </defs>
                  <XAxis type="number" tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="stageName" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} axisLine={false} tickLine={false} width={72} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="totalValue" radius={[0, 8, 8, 0]}>
                    {stats.dealPipelineFunnel.map((_, index) => (
                      <Cell key={index} fill={`url(#bar${index % PALETTE.length})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px' }}>
                <Briefcase style={{ width: '28px', height: '28px', color: 'var(--border-strong)', strokeWidth: 1 }} />
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>No pipeline data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Charts Row 2 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '16px' }}>

        {/* Lead Sources Donut */}
        <div className="glass-card rounded-2xl p-5">
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '4px' }}>Lead Sources</p>
          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>Acquisition breakdown</p>
          <div style={{ height: '200px' }}>
            {stats.leadsBySource?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {PALETTE.map((c, i) => (
                      <radialGradient key={i} id={`pie${i}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={c} stopOpacity={0.9} />
                        <stop offset="100%" stopColor={c} stopOpacity={0.6} />
                      </radialGradient>
                    ))}
                  </defs>
                  <Pie
                    data={stats.leadsBySource}
                    dataKey="value"
                    nameKey="label"
                    cx="50%" cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {stats.leadsBySource.map((_, i) => (
                      <Cell key={i} fill={`url(#pie${i % PALETTE.length})`} />
                    ))}
                  </Pie>
                  <DonutCenter cx={0} cy={0} label={`${stats.totalLeads ?? 0}`} sublabel="Total Leads" />
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px' }}>
                <Users style={{ width: '28px', height: '28px', color: 'var(--border-strong)', strokeWidth: 1 }} />
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>No lead sources yet</p>
              </div>
            )}
          </div>
          {/* Legend */}
          {stats.leadsBySource?.length > 0 && (
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {stats.leadsBySource.slice(0, 4).map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', flex: 1 }}>{s.label}</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{s.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Leaderboard */}
        <div className="glass-card rounded-2xl p-5">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Sales Leaderboard</p>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Team performance ranking</p>
            </div>
            <Award style={{ width: '16px', height: '16px', color: '#ffd60a' }} />
          </div>

          {stats.teamPerformance?.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Salesperson</th>
                  <th>Deals Won</th>
                  <th>Revenue</th>
                  <th>Leads</th>
                </tr>
              </thead>
              <tbody>
                {stats.teamPerformance.map((m, i) => (
                  <tr key={m.userId}>
                    <td>
                      <span
                        style={{
                          width: '20px', height: '20px', borderRadius: '6px',
                          background: i === 0 ? '#ffd60a22' : 'var(--surface-2)',
                          color: i === 0 ? '#ffd60a' : 'var(--text-tertiary)',
                          fontSize: '10px', fontWeight: 700,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: `${PALETTE[i % PALETTE.length]}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: PALETTE[i % PALETTE.length] }}>
                          {m.name?.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</span>
                      </div>
                    </td>
                    <td><span style={{ fontWeight: 600 }}>{m.dealsWon}</span></td>
                    <td><span style={{ fontWeight: 700, color: 'var(--success)' }}>${(m.revenueGenerated || 0).toLocaleString()}</span></td>
                    <td><span style={{ color: 'var(--text-secondary)' }}>{m.leadsAssigned}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '120px', gap: '8px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>No team performance data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Win Rate Radial ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        {/* Win Rate Gauge */}
        <div className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center" style={{ minHeight: '200px' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '12px', textAlign: 'center' }}>Win Rate</p>
          <div style={{ height: '140px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="70%" innerRadius="60%" outerRadius="100%" data={[{ name: 'Win Rate', value: stats.winRate ?? 0, fill: '#0A84FF' }, { name: 'Remaining', value: 100 - (stats.winRate ?? 0), fill: 'var(--border-default)' }]} startAngle={180} endAngle={0}>
                <RadialBar dataKey="value" cornerRadius={6} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.05em', color: 'var(--accent)', marginTop: '-12px' }}>{stats.winRate ?? 0}%</p>
          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>of opportunities closed</p>
        </div>

        {/* Avg Deal Size */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-center" style={{ minHeight: '200px' }}>
          <DollarSign style={{ width: '24px', height: '24px', color: 'var(--accent)', marginBottom: '12px' }} />
          <p style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
            ${((stats.avgDealSize || 0) / 1000).toFixed(1)}k
          </p>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '4px' }}>Average Deal Size</p>
          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Across all closed deals</p>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight style={{ width: '12px', height: '12px', color: 'var(--success)' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--success)' }}>+{stats.conversionRate ?? 0}% conversion</span>
          </div>
        </div>

        {/* Avg Sales Cycle */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-center" style={{ minHeight: '200px' }}>
          <Sparkles style={{ width: '24px', height: '24px', color: '#bf5af2', marginBottom: '12px' }} />
          <p style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
            {stats.avgSalesCycleDays ?? 0}d
          </p>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '4px' }}>Avg. Sales Cycle</p>
          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Days from lead to close</p>
          <div style={{ marginTop: '16px' }} className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${Math.min((stats.avgSalesCycleDays ?? 0) / 90 * 100, 100)}%`, background: '#bf5af2' }} />
          </div>
          <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '4px' }}>vs. 90-day benchmark</p>
        </div>
      </div>

    </div>
  );
};
