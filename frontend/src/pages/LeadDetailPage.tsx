import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Mail, Phone, Building, Briefcase, Calendar, Award } from 'lucide-react';
import api from '../api/axios';
import { Lead } from '../types/crm';

export const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) fetchLead(id);
  }, [id]);

  const fetchLead = async (leadId: string) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/leads/${leadId}`);
      setLead(res.data);
    } catch (e) {
      console.error('Failed to fetch lead details', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !lead) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/leads')}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Leads
      </button>

      {/* Profile Banner */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-100">{lead.firstName} {lead.lastName}</h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
              {lead.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{lead.jobTitle || 'Role N/A'} at {lead.companyName || 'Independent'}</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <Award className="w-6 h-6 text-brand-400" />
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-mono font-bold">AI Lead Score</p>
            <p className="text-lg font-extrabold text-brand-400">{lead.leadScore}/100</p>
          </div>
        </div>
      </div>

      {/* AI Score Explanation */}
      <div className="glass-card p-5 rounded-2xl border border-brand-500/20 bg-gradient-to-r from-brand-950/20 to-purple-950/20 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-400">
          <Sparkles className="w-4 h-4" />
          <span>AI Scoring Explanation</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {lead.scoreExplanation || 'Calculated using role seniority, inbound contact channel, company presence, and engagement metrics.'}
        </p>
      </div>

      {/* Info Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-200">Contact Details</h3>
          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-slate-500" />
              <span>{lead.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-slate-500" />
              <span>{lead.phone || 'No phone provided'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Building className="w-4 h-4 text-slate-500" />
              <span>{lead.companyName || 'Independent'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-slate-500" />
              <span>{lead.jobTitle || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-200">System Meta</h3>
          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Source:</span>
              <span className="font-semibold text-slate-200">{lead.source}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Industry:</span>
              <span className="font-semibold text-slate-200">{lead.industry || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Assigned Rep:</span>
              <span className="font-semibold text-slate-200">{lead.assignedTo?.fullName || 'Unassigned'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Created:</span>
              <span className="font-semibold text-slate-200">{new Date(lead.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
