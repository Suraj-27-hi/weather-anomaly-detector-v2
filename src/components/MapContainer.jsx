import React, { useState } from 'react';
import { Satellite, CloudRain, Maximize2, Minimize2 } from 'lucide-react';
import SatelliteMap from './Map/SatelliteMap';

export default function MapContainer({
  currentLocation,
  currentWeather,
  anomalyData,
  onSelectCoords,
  onSelectState,
  onLocateMe,
  radarOpacity = 0.75
}) {
  const [mapMode, setMapMode] = useState('satellite'); // 'satellite' | 'radar'
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className={`card-navy flex flex-col justify-between overflow-hidden transition-all duration-300 ${
      isFullscreen ? 'fixed inset-4 z-50 bg-[#040a16] shadow-2xl p-4' : 'h-full min-h-[580px] p-3 sm:p-4'
    }`}>
      
      {/* Top Controls: Mode Switch & Telemetry */}
      <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-[#142a4a]">
        
        {/* Toggle between Live Satellite and Radar / Rainfall */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#040a16] border border-[#142a4a]">
          <button
            onClick={() => setMapMode('satellite')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              mapMode === 'satellite'
                ? 'bg-[#0284c7] text-white shadow-[0_0_10px_rgba(2,132,199,0.5)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>Live Satellite</span>
          </button>

          <button
            onClick={() => setMapMode('radar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              mapMode === 'radar'
                ? 'bg-[#0284c7] text-white shadow-[0_0_10px_rgba(2,132,199,0.5)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Radar / Rainfall</span>
          </button>
        </div>

        {/* Target telemetry label & Fullscreen */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block text-xs font-mono text-slate-300">
            <span className="text-[#38bdf8] font-semibold">{currentLocation.name}</span>
            {currentLocation.state ? <span className="text-[#8ea4be]">, {currentLocation.state}</span> : ''}
            {currentLocation.country && <span className="text-[#5e7694]"> ({currentLocation.country})</span>}
          </span>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-[#040a16] border border-[#142a4a] text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Main Map Viewport matching Image 2 (Satellite) & Image 4 (Radar) */}
      <div className="relative flex-1 w-full min-h-[500px] h-full rounded-xl overflow-hidden">
        <SatelliteMap
          currentLocation={currentLocation}
          currentWeather={currentWeather}
          anomalyData={anomalyData}
          mapMode={mapMode}
          onSelectState={onSelectState}
          onMapClick={onSelectCoords}
          onLocateMe={onLocateMe}
          radarOpacity={radarOpacity}
        />
      </div>

    </div>
  );
}
