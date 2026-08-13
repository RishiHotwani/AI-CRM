import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Mail, Phone, Building2, Sparkles, Trash2, X } from 'lucide-react';
import api from '../api/axios';
import { Contact, AiSummaryResponse } from '../types/crm';

export const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeSummaryContact, setActiveSummaryContact] = useState<Contact | null>(null);
  const [aiSummary, setAiSummary] = useState<AiSummaryResponse | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContacts();
  }, [query]);

  const fetchContacts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let url = `/contacts?page=0&size=50`;
      if (query) url += `&query=${encodeURIComponent(query)}`;
      const res = await api.get(url);
      setContacts(res.data.content || []);
    } catch (e: any) {
      console.error('Failed to fetch contacts', e);
      setError(e.response?.data?.message || 'Failed to fetch contacts directory.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/contacts', {
        firstName,
        lastName,
        email,
        phone,
        jobTitle,
      });
      setShowCreateModal(false);
      resetForm();
      fetchContacts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create contact');
    }
  };

  const handleAskAiAboutContact = async (contact: Contact, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSummaryContact(contact);
    setIsSummaryLoading(true);
    try {
      const res = await api.get(`/ai/contact-summary/${contact.id}`);
      setAiSummary(res.data);
    } catch (err) {
      console.error('Failed to fetch AI contact summary', err);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const handleDeleteContact = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Soft delete contact record?')) return;
    try {
      await api.delete(`/contacts/${id}`);
      fetchContacts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete contact');
    }
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setJobTitle('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            Contacts Directory
          </h1>
          <p className="text-xs text-slate-400">Manage individual customer contacts & relationship histories</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg glow-brand transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      <div className="flex items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 glass-card">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts by name, email..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Contact Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Company</th>
                <th className="p-4">Owner</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-500"></div>
                      <span>Loading contacts...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && error && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-rose-400">
                    {error}
                  </td>
                </tr>
              )}

              {!isLoading && !error && contacts.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No contacts found. Click "Add Contact" above to add your first contact.
                  </td>
                </tr>
              )}

              {!isLoading && !error && contacts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-slate-100">{c.firstName} {c.lastName}</td>
                  <td className="p-4 text-slate-400">{c.email}</td>
                  <td className="p-4 text-slate-400">{c.phone || 'N/A'}</td>
                  <td className="p-4 font-semibold text-slate-200">{c.company?.name || 'Independent'}</td>
                  <td className="p-4 text-slate-400">{c.owner?.fullName || 'Unassigned'}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={(e) => handleAskAiAboutContact(c, e)}
                      className="px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 border border-purple-500/30 text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Ask AI
                    </button>
                    <button
                      onClick={(e) => handleDeleteContact(c.id, e)}
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

      {/* AI Contact Summary Drawer */}
      {activeSummaryContact && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-purple-400">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold text-lg text-slate-100">AI Contact Summary</h3>
              </div>
              <button onClick={() => setActiveSummaryContact(null)} className="p-1 text-slate-400 hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Generating contextual facts and risk analysis for <strong className="text-slate-200">{activeSummaryContact.firstName} {activeSummaryContact.lastName}</strong>.
            </p>

            {isSummaryLoading && <p className="text-xs text-slate-400 py-8 text-center">Analyzing CRM interaction database...</p>}

            {!isSummaryLoading && aiSummary && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed">
                  {aiSummary.summary}
                </div>

                <div>
                  <h4 className="font-bold text-slate-300 mb-2">Key Account Facts</h4>
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

      {/* Create Contact Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-100">Create New Contact</h3>
            <form onSubmit={handleCreateContact} className="space-y-3">
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
                  <label className="block text-xs font-semibold text-slate-300">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white">
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
