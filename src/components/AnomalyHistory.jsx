import React from 'react';
import { ShieldAlert, AlertCircle, ArrowUpRight, TrendingDown, TrendingUp, Calendar } from 'lucide-react';

export default function AnomalyHistory({ anomalyData, onSelectAnomaly }) {
  const anomalies = anomalyData?.allAnomalies || [];

  const getSeverityBadge = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'severe':
      case 'extreme':
        return 'text-rose-400 bg-rose-950/60 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]';
      case 'high':
        return 'text-orange-400 bg-orange-950/60 border-orange-500/50 shadow-[0_0_8px_rgba(249,115,22,0.3)]';
      case 'moderate':
        return 'text-amber-400 bg-amber-950/60 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.2)]';
      default:
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '24 Sep 2026';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (!anomalies || anomalies.length === 0) {
    return null;
  }

  return (
    <div className="glass-card p-5 my-6 border border-cyan-500/20 bg-[var(--bg-card)]">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)] mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white font-heading tracking-wide">
              ANOMALY TELEMETRY LOG
            </h3>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              {anomalies.length} Events Detected
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historical events exceeding regional ±1.5σ baseline thresholds. Click any event to inspect full statistical telemetry.
          </p>
        </div>
      </div>

      {/* Table / Cards */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <th className="pb-2 pl-2">Date</th>
              <th className="pb-2">Metric</th>
              <th className="pb-2">Observed</th>
              <th className="pb-2">Expected Mean</th>
              <th className="pb-2">Z-Score</th>
              <th className="pb-2">Severity</th>
              <th className="pb-2 text-right pr-2">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {anomalies.map((item, idx) => (
              <tr 
                key={idx}
                onClick={() => onSelectAnomaly(item)}
                className="hover:bg-cyan-950/30 transition-colors cursor-pointer group"
              >
                <td className="py-3 pl-2 text-slate-300 flex items-center gap-1.5 whitespace-nowrap">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400/70" />
                  <span>{formatDate(item.date)}</span>
                </td>
                <td className="py-3 text-white font-semibold capitalize whitespace-nowrap">
                  {item.metric?.replace('_', ' ')}
                </td>
                <td className="py-3 text-cyan-300 font-bold whitespace-nowrap">
                  {item.value} {item.unit || ''}
                </td>
                <td className="py-3 text-slate-400 whitespace-nowrap">
                  {item.expectedMean || '--'} {item.unit || ''}
                </td>
                <td className="py-3 whitespace-nowrap">
                  <span className={`font-bold flex items-center gap-1 ${item.zScore < 0 ? 'text-sky-400' : 'text-amber-400'}`}>
                    {item.zScore < 0 ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : (
                      <TrendingUp className="w-3 h-3" />
                    )}
                    {item.zScore > 0 ? `+${item.zScore}` : item.zScore}
                  </span>
                </td>
                <td className="py-3 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getSeverityBadge(item.severity)}`}>
                    {item.severity}
                  </span>
                </td>
                <td className="py-3 text-right pr-2">
                  <span className="text-cyan-400 group-hover:translate-x-1 inline-block transition-transform">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
