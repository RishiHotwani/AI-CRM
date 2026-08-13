import React, { useState, useEffect } from 'react';
import { Building2, Plus, Search, Globe, Users, DollarSign, Sparkles, Trash2, X } from 'lucide-react';
import api from '../api/axios';
import { Company, AiSummaryResponse } from '../types/crm';

export const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeSummaryCompany, setActiveSummaryCompany] = useState<Company | null>(null);
  const [aiSummary, setAiSummary] = useState<AiSummaryResponse | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [employeeCount, setEmployeeCount] = useState('50');
  const [annualRevenue, setAnnualRevenue] = useState('500000');

  useEffect(() => {
    fetchCompanies();
  }, [query]);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      let url = `/companies?page=0&size=50`;
      if (query) url += `&query=${encodeURIComponent(query)}`;
      const res = await api.get(url);
      setCompanies(res.data.content || []);
    } catch (e) {
      console.error('Failed to fetch companies', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/companies', {
        name,
        website,
        industry,
        employeeCount: parseInt(employeeCount) || 10,
        annualRevenue: parseFloat(annualRevenue) || 100000,
      });
      setShowCreateModal(false);
      resetForm();
      fetchCompanies();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create company');
    }
  };

  const handleAskAiAboutCompany = async (comp: Company, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSummaryCompany(comp);
    setIsSummaryLoading(true);
    try {
      const res = await api.get(`/ai/company-summary/${comp.id}`);
      setAiSummary(res.data);
    } catch (err) {
      console.error('Failed to fetch company summary', err);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const handleDeleteCompany = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Soft delete company record?')) return;
    try {
      await api.delete(`/companies/${id}`);
      fetchCompanies();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete company');
    }
  };

  const resetForm = () => {
    setName('');
    setWebsite('');
    setIndustry('');
    setEmployeeCount('50');
    setAnnualRevenue('500000');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-purple-400" />
            Companies & Accounts
          </h1>
          <p className="text-xs text-slate-400">Track target business accounts, firmographics, and account timelines</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg glow-brand transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Company</span>
        </button>
      </div>

      <div className="flex items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 glass-card">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by company name, industry..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && <p className="text-xs text-slate-500 col-span-3 text-center py-8">Loading company directory...</p>}

        {!isLoading && companies.map((c) => (
          <div key={c.id} className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-100">{c.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{c.industry || 'Industry N/A'}</p>
                </div>
                <button
                  onClick={(e) => handleAskAiAboutCompany(c, e)}
                  className="p-1.5 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 border border-purple-500/30"
                  title="Ask AI Summary"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-400">
                {c.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <a href={c.website.startsWith('http') ? c.website : `https://${c.website}`} target="_blank" rel="noreferrer" className="hover:underline text-brand-400">
                      {c.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>{c.employeeCount || 'N/A'} employees</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                  <span>Annual Revenue: ${(c.annualRevenue || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">Owner: {c.owner?.fullName || 'Unassigned'}</span>
              <button onClick={(e) => handleDeleteCompany(c.id, e)} className="text-slate-500 hover:text-rose-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Company Summary Drawer */}
      {activeSummaryCompany && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-purple-400">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold text-lg text-slate-100">AI Account Summary</h3>
              </div>
              <button onClick={() => setActiveSummaryCompany(null)} className="p-1 text-slate-400 hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSummaryLoading && <p className="text-xs text-slate-400 py-8 text-center">Synthesizing account data...</p>}

            {!isSummaryLoading && aiSummary && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed">
                  {aiSummary.summary}
                </div>

                <div>
                  <h4 className="font-bold text-slate-300 mb-2">Key Account Highlights</h4>
                  <ul className="space-y-1 text-slate-400 list-disc list-inside">
                    {aiSummary.keyFacts.map((fact, i) => <li key={i}>{fact}</li>)}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-300 mb-2">Recommended Next Action</h4>
                  <p className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-300 font-semibold">
                    {aiSummary.recommendedNextAction}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Company Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-100">Create New Company</h3>
            <form onSubmit={handleCreateCompany} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300">Company Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Website</label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://acme.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Employee Count</label>
                  <input
                    type="number"
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Annual Revenue ($)</label>
                  <input
                    type="number"
                    value={annualRevenue}
                    onChange={(e) => setAnnualRevenue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white">
                  Save Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
