import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  Activity, 
  Info,
  TrendingDown,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';

export default function AnomalyCard({ anomalyData, onOpenDetails }) {
  if (!anomalyData) {
    return (
      <div className="glass-card p-5 my-3 border border-[var(--border-subtle)] text-center text-slate-400 text-xs">
        <div className="inline-block w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-2" />
        <p>Running AI Anomaly Detection Baseline Analysis...</p>
      </div>
    );
  }

  const { hasAnomaly, severity, topAnomaly, summary, isLiveBackend } = anomalyData;

  // Severity style configuration
  const severityConfig = {
    normal: {
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/40',
      border: 'border-emerald-500/30',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
      label: 'Normal Baseline'
    },
    low: {
      color: 'text-cyan-400',
      bg: 'bg-cyan-950/40',
      border: 'border-cyan-500/40',
      glow: 'shadow-[0_0_15px_rgba(0,242,254,0.2)]',
      label: 'Low Severity'
    },
    moderate: {
      color: 'text-amber-400',
      bg: 'bg-amber-950/40',
      border: 'border-amber-500/40',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
      label: 'Moderate Severity'
    },
    high: {
      color: 'text-orange-400',
      bg: 'bg-orange-950/40',
      border: 'border-orange-500/40',
      glow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]',
      label: 'High Severity'
    },
    extreme: {
      color: 'text-rose-400',
      bg: 'bg-rose-950/40',
      border: 'border-rose-500/40',
      glow: 'shadow-[0_0_25px_rgba(239,68,68,0.35)]',
      label: 'Severe Anomaly'
    },
    severe: {
      color: 'text-rose-400',
      bg: 'bg-rose-950/40',
      border: 'border-rose-500/40',
      glow: 'shadow-[0_0_25px_rgba(239,68,68,0.35)]',
      label: 'Severe Anomaly'
    }
  };

  const currentSev = severityConfig[severity] || severityConfig.moderate;

  return (
    <div className={`glass-card p-5 my-3 border ${hasAnomaly ? currentSev.border : 'border-emerald-500/30'} ${currentSev.glow} bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-secondary)] to-[#071322] relative overflow-hidden transition-all duration-300`}>
      
      {/* Decorative pulse indicator top right */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${hasAnomaly ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
        <span className="text-[10px] font-mono text-slate-400">
          {isLiveBackend ? 'Neural Engine Online' : 'Baseline Synthesized'}
        </span>
      </div>

      {/* Title */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
          <BrainCircuit className="w-4 h-4" />
        </div>
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
          AI WEATHER ANALYSIS
        </h3>
      </div>

      {/* Main Status Display */}
      {!hasAnomaly ? (
        <div className="my-2">
          <div className="flex items-center gap-2.5 text-emerald-400 font-heading text-lg font-bold">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <span>NO ANOMALY DETECTED</span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Conditions are normal for this region. Monitored atmospheric values conform to expected seasonal distributions.
          </p>
        </div>
      ) : (
        <div className="my-2">
          <div className="flex items-center gap-2.5 text-amber-300 font-heading text-lg font-bold">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 animate-pulse" />
            <span>ANOMALY DETECTED</span>
          </div>
          
          <div className="mt-2.5 p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white capitalize">
                {topAnomaly?.metric?.replace('_', ' ') || 'Atmospheric'} Anomaly
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold uppercase ${currentSev.bg} ${currentSev.color} border ${currentSev.border}`}>
                {topAnomaly?.severity || severity}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-1.5 flex items-center gap-1.5">
              {topAnomaly?.direction === 'below' ? (
                <TrendingDown className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
              <span>
                {topAnomaly?.direction === 'below' ? 'Below' : 'Above'} expected baseline ({topAnomaly?.expectedMean} {topAnomaly?.unit})
              </span>
            </p>

            {/* 27. AI ANALYSIS SUMMARY */}
            <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <p>
                {topAnomaly?.explanation || 
                  `${topAnomaly?.metric?.replace('_', ' ') || 'Value'} is currently ${Math.abs(topAnomaly?.zScore || 2.4).toFixed(2)} standard deviations ${topAnomaly?.direction || 'away from'} the recent baseline.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Footer with [Detailed] button */}
      <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
          <span>Active Events: <b className="text-white">{summary?.total || (hasAnomaly ? 1 : 0)}</b></span>
          {summary?.extreme > 0 && (
            <span className="text-rose-400">• {summary.extreme} Severe</span>
          )}
        </div>

        <button
          onClick={onOpenDetails}
          className="btn-cyber py-1.5 px-3.5 text-xs font-semibold text-cyan-300 border-cyan-500/40 hover:border-cyan-400 flex items-center gap-1 group shadow-[0_0_10px_rgba(0,242,254,0.15)]"
        >
          <span>Detailed</span>
          <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

    </div>
  );
}
