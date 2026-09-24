import React from 'react';
import { Bell, Settings, Cloud, Radio, Activity } from 'lucide-react';
import { useISTClock } from '../hooks/useISTClock';

export default function Header({ 
  onOpenSettings, 
  onOpenNotifications, 
  hasAnomaly = false,
  unreadAlertsCount = 0 
}) {
  const { date, time, timezone } = useISTClock();

  // Notification is ONLY enabled if an anomaly is detected!
  const showNotificationBadge = hasAnomaly && unreadAlertsCount > 0;

  return (
    <header className="w-full border-b border-[#142a4a] bg-[#07152b] px-4 py-3 sm:px-6 z-30">
      <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Brand Logo & Title matching user screenshot */}
        <div className="flex items-center gap-3.5">
          {/* Circular AI logo with cloud and 'AI' */}
          <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#0a192f] border-2 border-cyan-400 shadow-[0_0_15px_rgba(0,210,255,0.4)]">
            <Cloud className="w-6 h-6 text-sky-300" />
            <span className="absolute text-[9px] font-black text-white font-mono tracking-tighter pt-0.5">
              AI
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-1.5 font-heading">
                <span>Weather Anomaly</span> 
                <span className="text-[#38bdf8] font-bold">Detector</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 tracking-wide mt-0.5 flex items-center gap-2">
              <span>Real-time weather data</span>
              <span className="text-slate-600">•</span>
              <span>Satellite view</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400 font-medium">Anomaly detection</span>
            </p>
          </div>
        </div>

        {/* Telemetry & Controls */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 self-end md:self-auto">
          {/* Live Data Badge */}
          <div className="cyber-badge cyber-badge-live px-2.5 py-1">
            <span className="live-dot" />
            <span>LIVE DATA</span>
          </div>

          {/* Real-time IST Clock */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs font-mono text-slate-300 shadow-inner">
            <span className="text-slate-400">{date}</span>
            <span className="text-cyan-500/40">|</span>
            <span className="text-cyan-300 font-semibold tracking-wider">{time}</span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1 py-0.2 rounded font-bold">{timezone}</span>
          </div>

          {/* Settings Action Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-[#040a16] border border-[#142a4a] hover:border-[#38bdf8] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="System Settings"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4 text-[#38bdf8]" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
