import React, { useState, useEffect, useRef } from 'react';
import { Search, X, UserCheck, Users, Building2, Briefcase, ChevronRight, Loader2 } from 'lucide-react';
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
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults({ leads: [], contacts: [], companies: [], deals: [] });
      setHasSearched(false);
    }
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ leads: [], contacts: [], companies: [], deals: [] });
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setHasSearched(true);
      try {
        const [lRes, cRes, compRes, dRes] = await Promise.all([
          api.get(`/leads?query=${encodeURIComponent(query)}&size=4`),
          api.get(`/contacts?query=${encodeURIComponent(query)}&size=4`),
          api.get(`/companies?query=${encodeURIComponent(query)}&size=4`),
          api.get(`/deals?query=${encodeURIComponent(query)}&size=4`),
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
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const totalResults = results.leads.length + results.contacts.length + results.companies.length + results.deals.length;

  const goTo = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-slate-950/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl shadow-black/60 overflow-hidden mx-4"
        style={{ animation: 'slideDown 0.15s ease-out' }}
      >
        {/* Search Input */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
          {isLoading
            ? <Loader2 className="w-4 h-4 text-brand-400 animate-spin flex-shrink-0" />
            : <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          }
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads, contacts, companies, deals..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-sm font-medium"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg text-slate-400 font-mono flex-shrink-0">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[65vh] overflow-y-auto">
          {/* Empty / hint state */}
          {!query && (
            <div className="py-12 text-center space-y-2">
              <Search className="w-8 h-8 text-slate-700 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Start typing to search across your workspace</p>
              <p className="text-[11px] text-slate-600">Searches leads, contacts, companies &amp; deals</p>
            </div>
          )}

          {/* Loading */}
          {query && isLoading && (
            <div className="py-10 text-center text-xs text-slate-400">Searching workspace...</div>
          )}

          {/* No results */}
          {!isLoading && hasSearched && totalResults === 0 && (
            <div className="py-12 text-center space-y-2">
              <p className="text-xs font-semibold text-slate-400">No results for <span className="text-slate-200">&quot;{query}&quot;</span></p>
              <p className="text-[11px] text-slate-600">Try a different search term</p>
            </div>
          )}

          {/* Results sections */}
          {!isLoading && totalResults > 0 && (
            <div className="p-3 space-y-1">

              {/* Leads */}
              {results.leads.length > 0 && (
                <div className="mb-2">
                  <div className="px-2 py-1 flex items-center gap-2">
                    <UserCheck className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Leads</span>
                  </div>
                  {results.leads.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => goTo(`/leads/${lead.id}`)}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/80 flex items-center justify-between group transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{lead.firstName} {lead.lastName}</p>
                        <p className="text-[11px] text-slate-400 truncate">{lead.email} · {lead.companyName || 'Independent'}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">{lead.leadScore}/100</span>
                        <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Contacts */}
              {results.contacts.length > 0 && (
                <div className="mb-2">
                  <div className="px-2 py-1 flex items-center gap-2">
                    <Users className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contacts</span>
                  </div>
                  {results.contacts.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => goTo('/contacts')}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/80 flex items-center justify-between group transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{c.firstName} {c.lastName}</p>
                        <p className="text-[11px] text-slate-400 truncate">{c.email} · {c.jobTitle || 'Contact'}</p>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0 ml-3" />
                    </button>
                  ))}
                </div>
              )}

              {/* Companies */}
              {results.companies.length > 0 && (
                <div className="mb-2">
                  <div className="px-2 py-1 flex items-center gap-2">
                    <Building2 className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Companies</span>
                  </div>
                  {results.companies.map((co) => (
                    <button
                      key={co.id}
                      onClick={() => goTo('/companies')}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/80 flex items-center justify-between group transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{co.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{co.industry || 'Company'} · {co.location || 'No location'}</p>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0 ml-3" />
                    </button>
                  ))}
                </div>
              )}

              {/* Deals */}
              {results.deals.length > 0 && (
                <div className="mb-2">
                  <div className="px-2 py-1 flex items-center gap-2">
                    <Briefcase className="w-3 h-3 text-purple-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Deals</span>
                  </div>
                  {results.deals.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => goTo('/deals')}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/80 flex items-center justify-between group transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{d.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">Stage: {d.stage?.name} · Risk: {d.dealRiskLevel}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <span className="text-xs font-bold text-brand-400">${(d.value || 0).toLocaleString()}</span>
                        <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
          <span>Search across all workspace records</span>
          <span className="font-mono">ESC to close</span>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
