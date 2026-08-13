import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Plus, Search, Filter, Sparkles, ChevronRight, RefreshCw, Trash2, ArrowRightLeft } from 'lucide-react';
import api from '../api/axios';
import { Lead, LeadStatus } from '../types/crm';

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLeadForConvert, setSelectedLeadForConvert] = useState<Lead | null>(null);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [source, setSource] = useState('WEBSITE');
  const [industry, setIndustry] = useState('');

  // Conversion form states
  const [dealName, setDealName] = useState('');
  const [dealValue, setDealValue] = useState('15000');

  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
  }, [query, statusFilter]);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      let url = `/leads?page=0&size=50`;
      if (query) url += `&query=${encodeURIComponent(query)}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      const res = await api.get(url);
      setLeads(res.data.content || []);
    } catch (e) {
      console.error('Failed to fetch leads', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/leads', {
        firstName,
        lastName,
        email,
        phone,
        companyName,
        jobTitle,
        source,
        industry,
      });
      setShowCreateModal(false);
      resetForm();
      fetchLeads();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create lead');
    }
  };

  const handleConvertLead = async () => {
    if (!selectedLeadForConvert) return;
    try {
      await api.post(`/leads/${selectedLeadForConvert.id}/convert`, {
        dealName: dealName || `${selectedLeadForConvert.companyName || selectedLeadForConvert.firstName} - Deal`,
        dealValue: parseFloat(dealValue) || 10000,
      });
      setSelectedLeadForConvert(null);
      fetchLeads();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to convert lead');
    }
  };

  const handleDeleteLead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to soft delete this lead?')) return;
    try {
      await api.delete(`/leads/${id}`);
      fetchLeads();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete lead');
    }
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setCompanyName('');
    setJobTitle('');
    setSource('WEBSITE');
    setIndustry('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-400" />
            Lead Management
          </h1>
          <p className="text-xs text-slate-400">Capture, score, and convert high-intent sales prospects</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg glow-brand transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Lead</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 glass-card">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads by name, email, company..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="UNQUALIFIED">Unqualified</option>
            <option value="NURTURING">Nurturing</option>
            <option value="CONVERTED">Converted</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Lead Name</th>
                <th className="p-4">Company & Role</th>
                <th className="p-4">AI Score</th>
                <th className="p-4">Status</th>
                <th className="p-4">Source</th>
                <th className="p-4">Assigned To</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    Loading lead database...
                  </td>
                </tr>
              )}

              {!isLoading && leads.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No leads found matching your criteria.
                  </td>
                </tr>
              )}

              {!isLoading && leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => navigate(`/leads/${lead.id}`)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                >
                  <td className="p-4">
                    <p className="font-bold text-slate-100 group-hover:text-brand-300 transition-colors">
                      {lead.firstName} {lead.lastName}
                    </p>
                    <p className="text-[11px] text-slate-500">{lead.email}</p>
                  </td>

                  <td className="p-4">
                    <p className="font-semibold text-slate-200">{lead.companyName || 'Independent'}</p>
                    <p className="text-[11px] text-slate-500">{lead.jobTitle || 'N/A'}</p>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-lg font-mono font-extrabold text-xs border ${
                        lead.leadScore >= 75
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : lead.leadScore >= 50
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {lead.leadScore}/100
                      </span>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      lead.status === 'CONVERTED' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      lead.status === 'QUALIFIED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {lead.status}
                    </span>
                  </td>

                  <td className="p-4 text-slate-400">{lead.source}</td>
                  <td className="p-4 text-slate-300">{lead.assignedTo?.fullName || 'Unassigned'}</td>

                  <td className="p-4 text-right space-x-2">
                    {lead.status !== 'CONVERTED' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLeadForConvert(lead);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-brand-600/20 text-brand-400 hover:bg-brand-600/40 border border-brand-500/30 text-xs font-bold inline-flex items-center gap-1"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        Convert
                      </button>
                    )}

                    <button
                      onClick={(e) => handleDeleteLead(lead.id, e)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Lead Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-100">Create New Lead</h3>

            <form onSubmit={handleCreateLead} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Source</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="WEBSITE">Website</option>
                    <option value="REFERRAL">Referral</option>
                    <option value="LINKEDIN">LinkedIn</option>
                    <option value="ADVERTISEMENT">Advertisement</option>
                    <option value="COLD_OUTREACH">Cold Outreach</option>
                  </select>
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

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert Lead Modal */}
      {selectedLeadForConvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-100">Convert Lead to Opportunity</h3>
            <p className="text-xs text-slate-400">
              Converting lead <strong className="text-slate-200">{selectedLeadForConvert.firstName} {selectedLeadForConvert.lastName}</strong> will automatically check for duplicate Contact and Company records before generating an active Deal.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300">Deal Opportunity Name</label>
                <input
                  type="text"
                  value={dealName}
                  onChange={(e) => setDealName(e.target.value)}
                  placeholder={`${selectedLeadForConvert.companyName || selectedLeadForConvert.firstName} - Opportunity`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Estimated Deal Value ($)</label>
                <input
                  type="number"
                  value={dealValue}
                  onChange={(e) => setDealValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setSelectedLeadForConvert(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConvertLead}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Confirm Conversion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
