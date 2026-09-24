import React from 'react';
import { X, Settings, Sliders, Moon, Zap, Layers, RefreshCw } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  unit,
  setUnit,
  animationsEnabled,
  setAnimationsEnabled,
  radarOpacity,
  setRadarOpacity,
  onResetDefaults
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-[var(--bg-secondary)] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-heading">
                SYSTEM SETTINGS
              </h2>
              <p className="text-[11px] font-mono text-cyan-400">
                Control Room Preferences
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

        {/* Settings options */}
        <div className="mt-5 space-y-5">
          
          {/* Temperature Unit */}
          <div>
            <label className="text-xs font-mono uppercase text-slate-400 block mb-2">
              Temperature Unit
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setUnit('C')}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 border transition-all ${
                  unit === 'C'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                    : 'bg-[var(--bg-tertiary)] text-slate-400 border-[var(--border-subtle)] hover:text-white'
                }`}
              >
                <span>Celsius (°C)</span>
              </button>

              <button
                onClick={() => setUnit('F')}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 border transition-all ${
                  unit === 'F'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                    : 'bg-[var(--bg-tertiary)] text-slate-400 border-[var(--border-subtle)] hover:text-white'
                }`}
              >
                <span>Fahrenheit (°F)</span>
              </button>
            </div>
          </div>

          {/* Radar Opacity Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-slate-400 uppercase">Radar Tile Opacity</span>
              <span className="text-cyan-300 font-bold">{Math.round(radarOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={radarOpacity}
              onChange={(e) => setRadarOpacity(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Animations Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-xs font-semibold text-white block">Micro-Animations</span>
                <span className="text-[10px] text-slate-400">Wind particles, weather dynamics, pulse rings</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={animationsEnabled}
              onChange={(e) => setAnimationsEnabled(e.target.checked)}
              className="w-4 h-4 accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* UI Theme */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
            <div className="flex items-center gap-2.5">
              <Moon className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-xs font-semibold text-white block">Control Room Theme</span>
                <span className="text-[10px] text-slate-400">Deep Space NASA Dark Palette (#050B14)</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              ACTIVE
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <button
            onClick={onResetDefaults}
            className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
          >
            <RefreshCw className="w-3 h-3" /> Reset Defaults
          </button>

          <button
            onClick={onClose}
            className="btn-cyber py-1.5 px-4 text-xs font-semibold text-white"
          >
            Save & Close
          </button>
        </div>

      </div>
    </div>
  );
}
