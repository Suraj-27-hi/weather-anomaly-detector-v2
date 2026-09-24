import React from 'react';
import { Activity, ShieldCheck, Database, Radio, Globe2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full mt-10 py-6 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/80 text-xs font-mono text-slate-400">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe]" />
          <span className="font-bold text-white font-heading tracking-wide">
            Weather Anomaly Detector AI
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-[11px] text-slate-500">Autonomous Meteorological Intelligence</span>
        </div>

        {/* Data Attributions (Section 38: Data: Open-Meteo, Maps: OSM/ArcGIS, Radar: RainViewer, AI) */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px]">
          <span className="flex items-center gap-1 text-slate-300">
            <Database className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-500">Data:</span> Open-Meteo
          </span>

          <span className="text-slate-700">•</span>

          <span className="flex items-center gap-1 text-slate-300">
            <Globe2 className="w-3 h-3 text-sky-400" />
            <span className="text-slate-500">Maps:</span> OpenStreetMap / ArcGIS
          </span>

          <span className="text-slate-700">•</span>

          <span className="flex items-center gap-1 text-slate-300">
            <Radio className="w-3 h-3 text-blue-400" />
            <span className="text-slate-500">Radar:</span> RainViewer
          </span>

          <span className="text-slate-700">•</span>

          <span className="flex items-center gap-1 text-slate-300">
            <Activity className="w-3 h-3 text-amber-400" />
            <span className="text-slate-500">AI:</span> Weather Anomaly Analysis
          </span>
        </div>

        {/* Operational Status badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-semibold text-[11px] shadow-[0_0_10px_rgba(16,185,129,0.2)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>System: ● Operational</span>
        </div>

      </div>
    </footer>
  );
}
