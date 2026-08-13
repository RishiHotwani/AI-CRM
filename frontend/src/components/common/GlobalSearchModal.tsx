import React, { useState, useEffect } from 'react';
import { Search, X, UserCheck, Users, Building2, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    leads: any[];
    contacts: any[];
    companies: any[];
    deals: any[];
  }>({ leads: [], contacts: [], companies: [], deals: [] });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ leads: [], contacts: [], companies: [], deals: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const [lRes, cRes, compRes, dRes] = await Promise.all([
          api.get(`/leads?query=${encodeURIComponent(query)}&size=3`),
          api.get(`/contacts?query=${encodeURIComponent(query)}&size=3`),
          api.get(`/companies?query=${encodeURIComponent(query)}&size=3`),
          api.get(`/deals?query=${encodeURIComponent(query)}&size=3`),
        ]);
        setResults({
          leads: lRes.data.content || [],
          contacts: cRes.data.content || [],
          companies: compRes.data.content || [],
          deals: dRes.data.content || [],
        });
      } catch (e) {
        console.error('Search failed', e);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search across Leads, Contacts, Companies, and Deals..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-sm"
            autoFocus
          />
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {isLoading && <p className="text-xs text-slate-400 text-center py-4">Searching workspace...</p>}

          {!isLoading && !query && (
            <p className="text-xs text-slate-500 text-center py-8">Search for any record by name, email, or company.</p>
          )}

          {/* Leads */}
          {results.leads.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>LEADS</span>
              </div>
              <div className="space-y-1">
                {results.leads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => { navigate(`/leads/${lead.id}`); onClose(); }}
                    className="p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800 cursor-pointer flex justify-between items-center transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{lead.firstName} {lead.lastName}</p>
                      <p className="text-[11px] text-slate-400">{lead.email} • {lead.companyName || 'N/A'}</p>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                      Score {lead.leadScore}/100
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contacts */}
          {results.contacts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>CONTACTS</span>
              </div>
              <div className="space-y-1">
                {results.contacts.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => { navigate('/contacts'); onClose(); }}
                    className="p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800 cursor-pointer flex justify-between items-center transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{c.firstName} {c.lastName}</p>
                      <p className="text-[11px] text-slate-400">{c.email} • {c.jobTitle || 'Contact'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deals */}
          {results.deals.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2">
                <Briefcase className="w-4 h-4 text-purple-400" />
                <span>DEALS</span>
              </div>
              <div className="space-y-1">
                {results.deals.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => { navigate('/deals'); onClose(); }}
                    className="p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800 cursor-pointer flex justify-between items-center transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{d.name}</p>
                      <p className="text-[11px] text-slate-400">Stage: {d.stage?.name} • Risk: {d.dealRiskLevel}</p>
                    </div>
                    <span className="text-xs font-bold text-brand-400">${d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
