import React, { useState } from 'react';
import { Deal, PipelineStage } from '../../types/crm';
import { AlertTriangle, Plus, DollarSign, Calendar, ChevronRight } from 'lucide-react';
import api from '../../api/axios';

interface KanbanBoardProps {
  stages: PipelineStage[];
  deals: Deal[];
  onDealUpdated: () => void;
  onCreateDealClick: (stageId: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  stages,
  deals,
  onDealUpdated,
  onCreateDealClick,
}) => {
  const [selectedDealForLost, setSelectedDealForLost] = useState<{ deal: Deal; targetStage: PipelineStage } | null>(null);
  const [lostReason, setLostReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStageChange = async (deal: Deal, targetStage: PipelineStage) => {
    if (targetStage.isLostStage) {
      setSelectedDealForLost({ deal, targetStage });
      return;
    }

    try {
      await api.patch(`/deals/${deal.id}/stage`, { stageId: targetStage.id });
      onDealUpdated();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to move deal stage');
    }
  };

  const handleConfirmLost = async () => {
    if (!selectedDealForLost || !lostReason.trim()) return;
    setIsSubmitting(true);
    try {
      await api.patch(`/deals/${selectedDealForLost.deal.id}/stage`, {
        stageId: selectedDealForLost.targetStage.id,
        lostReason: lostReason.trim(),
      });
      setSelectedDealForLost(null);
      setLostReason('');
      onDealUpdated();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to move deal to Closed Lost');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 min-h-[calc(100vh-220px)]">
      {stages.map((stage) => {
        const stageDeals = deals.filter((d) => d.stage?.id === stage.id);
        const stageTotal = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);

        return (
          <div
            key={stage.id}
            className="w-80 flex-shrink-0 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col glass-card"
          >
            {/* Stage Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-200">{stage.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
                    {stageDeals.length}
                  </span>
                </div>
                <p className="text-xs font-semibold text-brand-400 mt-1">
                  ${stageTotal.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => onCreateDealClick(stage.id)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Add Deal to Stage"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Stage Cards Column */}
            <div className="p-3 flex-1 overflow-y-auto space-y-3 min-h-[300px]">
              {stageDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-brand-500/50 shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-slate-100 group-hover:text-brand-300 transition-colors">
                      {deal.name}
                    </h4>
                    {deal.dealRiskLevel === 'HIGH' && (
                      <span
                        className="p-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        title={deal.riskExplanation || 'High risk deal'}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mt-1">
                    {deal.company?.name || deal.contact ? `${deal.contact?.firstName || ''} ${deal.contact?.lastName || ''}` : 'No company linked'}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-200 flex items-center">
                      <DollarSign className="w-3.5 h-3.5 text-brand-400 -mr-0.5" />
                      {deal.value?.toLocaleString()}
                    </span>

                    {deal.expectedCloseDate && (
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(deal.expectedCloseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>

                  {/* Stage Move Controls */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-mono">
                      {deal.probability}% win prob
                    </span>

                    <select
                      value={stage.id}
                      onChange={(e) => {
                        const target = stages.find((s) => s.id === e.target.value);
                        if (target) handleStageChange(deal, target);
                      }}
                      className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2 py-0.5 text-[11px] focus:outline-none cursor-pointer hover:border-slate-700"
                    >
                      {stages.map((s) => (
                        <option key={s.id} value={s.id}>
                          Move to {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}

              {stageDeals.length === 0 && (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-800/60 rounded-xl p-6 text-center text-xs text-slate-600">
                  No deals in this stage
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Closed Lost Reason Modal */}
      {selectedDealForLost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-lg text-slate-100">Closed Lost Reason Required</h3>
            </div>
            <p className="text-xs text-slate-400">
              Please specify the primary reason why opportunity <strong className="text-slate-200">"{selectedDealForLost.deal.name}"</strong> was lost.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select or type lost reason</label>
              <select
                onChange={(e) => setLostReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 mb-2 focus:outline-none"
              >
                <option value="">-- Choose reason --</option>
                <option value="Competitor pricing lower">Competitor pricing lower</option>
                <option value="Budget constraints / Project frozen">Budget constraints / Project frozen</option>
                <option value="Feature / Product mismatch">Feature / Product mismatch</option>
                <option value="No response from prospect">No response from prospect</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="text"
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                placeholder="Or custom explanation..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedDealForLost(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLost}
                disabled={!lostReason.trim() || isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Confirm Lost'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
