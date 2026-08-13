import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, LayoutGrid, List, DollarSign, AlertTriangle, Sparkles } from 'lucide-react';
import api from '../api/axios';
import { Deal, Pipeline, PipelineStage } from '../types/crm';
import { KanbanBoard } from '../components/kanban/KanbanBoard';

export const DealsPage: React.FC = () => {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStageId, setCreateStageId] = useState<string>('');

  // Form
  const [name, setName] = useState('');
  const [value, setValue] = useState('25000');
  const [stageId, setStageId] = useState('');

  useEffect(() => {
    fetchPipelines();
  }, []);

  useEffect(() => {
    if (selectedPipelineId) fetchDeals(selectedPipelineId);
  }, [selectedPipelineId]);

  const fetchPipelines = async () => {
    try {
      const res = await api.get('/pipelines');
      const list: Pipeline[] = res.data;
      setPipelines(list);
      if (list.length > 0) {
        const def = list.find((p) => p.isDefault) || list[0];
        setSelectedPipelineId(def.id);
      }
    } catch (e) {
      console.error('Failed to fetch pipelines', e);
    }
  };

  const fetchDeals = async (pId: string) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/deals/pipeline/${pId}`);
      setDeals(res.data);
    } catch (e) {
      console.error('Failed to fetch deals', e);
    } finally {
      setIsLoading(false);
    }
  };

  const currentPipeline = pipelines.find((p) => p.id === selectedPipelineId);
  const stages = currentPipeline?.stages || [];

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/deals', {
        name,
        value: parseFloat(value) || 0,
        pipelineId: selectedPipelineId,
        stageId: stageId || createStageId || (stages[0]?.id),
      });
      setShowCreateModal(false);
      setName('');
      setValue('25000');
      fetchDeals(selectedPipelineId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create deal');
    }
  };

  const openCreateForStage = (stgId: string) => {
    setCreateStageId(stgId);
    setStageId(stgId);
    setShowCreateModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-brand-400" />
            Sales Pipeline & Deals
          </h1>
          <p className="text-xs text-slate-400">Interactive Kanban pipeline board with automated risk evaluation</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'kanban' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'list' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Table</span>
            </button>
          </div>

          <button
            onClick={() => { setCreateStageId(stages[0]?.id || ''); setShowCreateModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg glow-brand transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Deal</span>
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          stages={stages}
          deals={deals}
          onDealUpdated={() => fetchDeals(selectedPipelineId)}
          onCreateDealClick={openCreateForStage}
        />
      ) : (
        /* Table View */
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Deal Opportunity</th>
                  <th className="p-4">Stage</th>
                  <th className="p-4">Value</th>
                  <th className="p-4">Win Prob</th>
                  <th className="p-4">Risk Level</th>
                  <th className="p-4">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {deals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-slate-800/40">
                    <td className="p-4 font-bold text-slate-100">{deal.name}</td>
                    <td className="p-4">{deal.stage?.name}</td>
                    <td className="p-4 font-bold text-brand-400">${deal.value?.toLocaleString()}</td>
                    <td className="p-4 font-mono text-slate-400">{deal.probability}%</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        deal.dealRiskLevel === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        deal.dealRiskLevel === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {deal.dealRiskLevel}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{deal.owner?.fullName || 'Unassigned'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Deal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-100">Create New Opportunity</h3>
            <form onSubmit={handleCreateDeal} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300">Deal Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Acme Enterprise SaaS Expansion"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Deal Value ($)</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Initial Pipeline Stage</label>
                <select
                  value={stageId}
                  onChange={(e) => setStageId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                >
                  {stages.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.winProbability}%)</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white">
                  Save Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
