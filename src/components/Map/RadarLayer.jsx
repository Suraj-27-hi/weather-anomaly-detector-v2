import React, { useState, useEffect, useRef } from 'react';
import { TileLayer } from 'react-leaflet';
import { Play, Pause, RotateCcw, FastForward, Droplets } from 'lucide-react';
import { fetchRadarFrames } from '../../api/rainviewerApi';

export default function RadarLayer({ opacity = 0.75, onFrameChange }) {
  const [radarData, setRadarData] = useState(null);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Load frames
  useEffect(() => {
    fetchRadarFrames().then(data => {
      setRadarData(data);
      if (data.frames && data.frames.length > 0) {
        setCurrentFrameIdx(data.frames.length - 1);
      }
    });
  }, []);

  // Animation interval
  useEffect(() => {
    if (!isPlaying || !radarData || !radarData.frames || radarData.frames.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentFrameIdx(prev => {
        const next = (prev + 1) % radarData.frames.length;
        if (onFrameChange) onFrameChange(radarData.frames[next]);
        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isPlaying, radarData, onFrameChange]);

  const frames = radarData?.frames || [];
  const activeFrame = frames[currentFrameIdx];

  return (
    <>
      {activeFrame && (
        <TileLayer
          key={activeFrame.path}
          url={activeFrame.tileUrl}
          opacity={opacity}
          zIndex={300}
        />
      )}

      {/* Clean Compact Radar Controls & Legend */}
      <div className="leaflet-bottom leaflet-left" style={{ pointerEvents: 'auto', margin: '14px', zIndex: 1000 }}>
        <div className="p-2.5 bg-[#07152b]/95 border border-[#142a4a] rounded-xl flex flex-col gap-2 shadow-xl backdrop-blur-md w-60 text-xs font-mono">
          
          <div className="flex items-center justify-between">
            <span className="text-[#38bdf8] font-bold flex items-center gap-1.5 text-[11px]">
              <Droplets className="w-3.5 h-3.5 text-[#38bdf8]" /> Radar {activeFrame?.timeFormatted || 'LIVE'}
            </span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-2 py-0.5 rounded bg-[#040a16] border border-[#142a4a] hover:border-[#38bdf8] text-slate-300 text-[10px] flex items-center gap-1 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
          </div>

          {/* Rainfall Intensity Legend */}
          <div className="pt-1.5 border-t border-[#142a4a] text-[10px] text-slate-300">
            <div className="flex justify-between items-center mb-1 text-[9px] text-slate-400">
              <span>Light</span>
              <span className="text-[#38bdf8] font-semibold">Intensity</span>
              <span>Heavy</span>
            </div>
            <div 
              className="w-full h-1.5 rounded-full" 
              style={{
                background: 'linear-gradient(90deg, #38bdf8 0%, #10b981 30%, #facc15 65%, #ef4444 85%, #a855f7 100%)'
              }}
            />
          </div>

        </div>
      </div>
    </>
  );
}
