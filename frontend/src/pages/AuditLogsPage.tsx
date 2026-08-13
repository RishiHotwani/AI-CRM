import React, { useState, useEffect } from 'react';
import { ShieldAlert, Terminal } from 'lucide-react';
import api from '../api/axios';
import { AuditLog } from '../types/crm';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/audit-logs?page=0&size=50');
      setLogs(res.data.content || []);
    } catch (e) {
      console.error('Failed to fetch audit logs', e);
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
                  <td colSpan={5} className="text-center py-8 text-slate-500">Loading audit records...</td>
                </tr>
              )}

              {!isLoading && logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">No audit logs recorded yet.</td>
                </tr>
              )}

              {!isLoading && logs.map((log) => (
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
