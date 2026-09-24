import React from 'react';
import { X, Bell, AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';

export default function NotificationsDrawer({ isOpen, onClose, anomalyData, currentLocation }) {
  if (!isOpen) return null;

  const anomalies = anomalyData?.allAnomalies || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[var(--bg-secondary)] border-l border-cyan-500/30 h-full overflow-y-auto p-5 sm:p-6 shadow-2xl flex flex-col justify-between slide-panel-in z-10">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-heading">
                  AI INTELLIGENCE ALERTS
                </h2>
                <p className="text-[11px] font-mono text-cyan-400">
                  Target: {currentLocation?.name || 'Bengaluru'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {anomalyData?.hasAnomaly ? (
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase font-mono">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Atmospheric Anomaly Active</span>
                </div>
                <p className="text-xs text-slate-200 mt-1">
                  {anomalyData.topAnomaly?.explanation || 'Significant statistical variance detected from baseline norms.'}
                </p>
                <div className="mt-2 text-[10px] font-mono text-amber-300/80">
                  Severity: {anomalyData.severity.toUpperCase()} • Z-Score: {anomalyData.topAnomaly?.zScore}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase font-mono">
                  <CheckCircle className="w-4 h-4" />
                  <span>Region Stable</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  All atmospheric parameters for {currentLocation?.name} remain within normal climatological deviations.
                </p>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold font-mono uppercase">
                <Info className="w-4 h-4" />
                <span>RainViewer Doppler Feed</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Radar frame caches synchronized with 10-minute automated satellite sweeps.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold font-mono uppercase">
                <ShieldAlert className="w-4 h-4" />
                <span>Backend Neural Engine</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Connected to Replit Python AI Anomaly baseline microservice with continuous variance estimation.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--border-subtle)] mt-6">
          <button
            onClick={onClose}
            className="w-full btn-cyber justify-center py-2 text-xs font-semibold text-white"
          >
            Close Feed
          </button>
        </div>
      </div>
    </div>
  );
}
