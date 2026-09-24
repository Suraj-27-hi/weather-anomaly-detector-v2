import React, { useState } from 'react';
import { 
  X, 
  AlertCircle, 
  HelpCircle, 
  Activity, 
  Calendar, 
  TrendingDown, 
  TrendingUp, 
  Info,
  CheckCircle2,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function AnomalyDrawer({ isOpen, onClose, anomalyData }) {
  if (!isOpen) return null;

  const anomalies = anomalyData?.allAnomalies || [];
  const [selectedAnomaly, setSelectedAnomaly] = useState(
    anomalyData?.topAnomaly || anomalies[0] || null
  );

  const active = selectedAnomaly || anomalyData?.topAnomaly;

  const severityColor = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'low': return 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40';
      case 'moderate': return 'text-amber-400 bg-amber-950/60 border-amber-500/40';
      case 'high': return 'text-orange-400 bg-orange-950/60 border-orange-500/40';
      case 'severe':
      case 'extreme': return 'text-rose-400 bg-rose-950/60 border-rose-500/40';
      default: return 'text-slate-300 bg-slate-800 border-slate-700';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '24 Sep 2026';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      
      {/* Backdrop overlay click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-lg bg-[var(--bg-secondary)] border-l border-cyan-500/30 h-full overflow-y-auto p-5 sm:p-6 shadow-2xl flex flex-col justify-between slide-panel-in z-10">
        
        <div>
          {/* Top Bar with Close Button */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white font-heading tracking-wide">
                  ANOMALY DETAILS
                </h2>
                <p className="text-[11px] font-mono text-cyan-400">
                  Statistical Deviation & Telemetry Baseline
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close details panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Anomaly Inspector */}
          {active ? (
            <div className="mt-5 space-y-4">
              
              {/* Metric Card */}
              <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-cyan-500/30 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-slate-400">Target Metric</span>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase border ${severityColor(active.severity)}`}>
                    {active.severity || 'Moderate'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1 capitalize">
                  {active.metric?.replace('_', ' ') || 'Atmospheric Variable'}
                </h3>
                
                {/* Metric values breakdown */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800">
                  <div className="p-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-slate-800">
                    <span className="text-[11px] text-slate-400 block font-mono">Observed</span>
                    <span className="text-lg font-bold text-cyan-300 font-mono">
                      {active.value} {active.unit || ''}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-slate-800">
                    <span className="text-[11px] text-slate-400 block font-mono">Expected</span>
                    <span className="text-lg font-bold text-slate-200 font-mono">
                      {active.expectedMean || active.expected || '--'} {active.unit || ''}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-slate-800">
                    <span className="text-[11px] text-slate-400 block font-mono">Z-Score</span>
                    <span className={`text-lg font-bold font-mono ${active.zScore < 0 ? 'text-sky-400' : 'text-amber-400'}`}>
                      {active.zScore ? (active.zScore > 0 ? `+${active.zScore}` : active.zScore) : '--'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-slate-800">
                    <span className="text-[11px] text-slate-400 block font-mono">Direction</span>
                    <span className="text-lg font-bold text-white font-mono capitalize flex items-center gap-1">
                      {active.direction === 'below' ? (
                        <TrendingDown className="w-4 h-4 text-sky-400" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-amber-400" />
                      )}
                      <span>{active.direction || 'Deviation'}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Timestamp:</span>
                  <span className="text-slate-200">{formatDate(active.date)}</span>
                </div>
              </div>

              {/* 24. ANOMALY EXPLANATION */}
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>WHAT THIS MEANS</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {active.explanation || 
                    `The observed weather value is significantly different from the recent baseline for this location. At a Z-score of ${active.zScore}, this occurrence falls outside expected 95% confidence intervals.`}
                </p>
                <div className="mt-2 text-[11px] text-slate-400 italic">
                  Standard deviations: ±{active.standardDeviation || '2.87'} {active.unit} regional variance.
                </div>
              </div>

              {/* 26. ANOMALY HISTORY (Recent events) */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-mono uppercase font-bold text-slate-300 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>Recent Regional Anomalies</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">Click event to inspect</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {anomalies.map((item, idx) => {
                    const isSelected = selectedAnomaly === item;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedAnomaly(item)}
                        className={`w-full p-2.5 rounded-lg text-left transition-all flex items-center justify-between text-xs border ${
                          isSelected 
                            ? 'bg-cyan-950/40 border-cyan-400 shadow-sm' 
                            : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)] hover:border-slate-600'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white capitalize">
                              {item.metric?.replace('_', ' ')}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono uppercase border ${severityColor(item.severity)}`}>
                              {item.severity}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Obs: {item.value}{item.unit} • Z: {item.zScore} • {formatDate(item.date)}
                          </p>
                        </div>
                        <ArrowRight className={`w-3.5 h-3.5 text-slate-500 ${isSelected ? 'text-cyan-400' : ''}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-white">No Active Anomalies</p>
              <p className="text-xs text-slate-400 mt-1">Regional conditions are within seasonal standard bounds.</p>
            </div>
          )}
        </div>

        {/* Panel Footer */}
        <div className="pt-4 border-t border-[var(--border-subtle)] mt-6">
          <button
            onClick={onClose}
            className="w-full btn-cyber justify-center py-2 text-xs font-semibold text-white"
          >
            Dismiss Panel
          </button>
        </div>

      </div>
    </div>
  );
}
