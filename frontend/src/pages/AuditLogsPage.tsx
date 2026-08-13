import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import { AuditLog } from '../types/crm';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/audit-logs?page=0&size=50');
      setLogs(res.data.content || []);
    } catch (e: any) {
      console.error('Failed to fetch audit logs', e);
      setError(e.response?.data?.message || 'Failed to fetch audit logs from server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-amber-400" />
          Immutable Security Audit Logs
        </h1>
        <p className="text-xs text-slate-400">Complete immutable record of all critical tenant actions, user operations, and lead conversions</p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchAuditLogs}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Action</th>
                <th className="p-4">Entity Type</th>
                <th className="p-4">User</th>
                <th className="p-4">Details</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-500"></div>
                      <span>Loading audit records...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !error && logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    No audit logs recorded yet.
                  </td>
                </tr>
              )}

              {!isLoading && !error && logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="p-4 font-mono font-bold text-brand-300">{log.action}</td>
                  <td className="p-4 font-semibold text-slate-200">{log.entityType}</td>
                  <td className="p-4 text-slate-300">{log.user?.fullName || 'System'}</td>
                  <td className="p-4 text-slate-400 max-w-xs truncate">{log.detailsJson || 'N/A'}</td>
                  <td className="p-4 font-mono text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
