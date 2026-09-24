import React from 'react';
import { Droplet, Waves, Thermometer, Wind } from 'lucide-react';

export default function MetricsRow({ weatherData, unit = 'C' }) {
  if (!weatherData?.current) return null;
  const { current, daily } = weatherData;

  const isF = unit === 'F';
  const formatTemp = (celsius) => {
    if (celsius === undefined || celsius === null) return '--';
    const val = isF ? (celsius * 9/5) + 32 : celsius;
    return `${Math.round(val)}°${unit}`;
  };

  return (
    <div className="space-y-3 mb-3">
      
      {/* ROW 1: Rainfall & Wind Speed matching Image 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        
        {/* Rainfall Card */}
        <div className="card-navy p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
              <Droplet className="w-5 h-5 text-[#38bdf8] fill-[#38bdf8]/20" />
            </div>
            <div>
              <span className="text-xs text-[#8ea4be] font-medium block">
                Rainfall
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-white font-mono mt-1">
                {current.rainfall1h ?? '0.2'} mm
              </div>
              <span className="text-xs text-[#8ea4be] block mt-0.5">
                (Last 1 hour)
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#122543] flex items-center justify-between text-xs text-slate-300 font-mono">
            <span>{daily.rainfallToday ?? '10.2'} mm <span className="text-[#8ea4be]">(Today)</span></span>
            <span className="text-[#38bdf8] font-bold">
              {current.rainProbability ?? 65}% Chance
            </span>
          </div>
        </div>

        {/* Wind Speed Card */}
        <div className="card-navy p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
              <Waves className="w-5 h-5 text-[#38bdf8]" />
            </div>
            <div>
              <span className="text-xs text-[#8ea4be] font-medium block">
                Wind Speed
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-white font-mono mt-1">
                {current.windSpeed} km/h <span className="text-sm font-normal text-[#8ea4be]">({current.windDirectionText || 'W'})</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#122543] flex items-center justify-between text-xs text-slate-300 font-mono">
            <span>Max: <span className="text-white font-semibold">{daily.maxWindSpeed || '16'} km/h</span></span>
            <span className="text-[#8ea4be] font-medium">Direction: {current.windDirectionDeg || 270}°</span>
          </div>
        </div>

      </div>

      {/* ROW 2: Temperature Card matching Image 1 (Thermometer icon, NO cup) */}
      <div className="card-navy p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-[#38bdf8] tracking-wide">
          <div className="p-1 rounded bg-sky-500/10 flex items-center justify-center">
            <Thermometer className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <span className="text-sm font-bold text-[#38bdf8] font-heading">Temperature</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center divide-x divide-[#122543]">
          <div className="px-2">
            <span className="text-xs text-[#8ea4be] font-medium block">
              Current
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-white font-mono mt-1.5 block">
              {formatTemp(current.temperature)}
            </span>
          </div>

          <div className="px-2">
            <span className="text-xs text-[#8ea4be] font-medium block">
              Min (Today)
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-white font-mono mt-1.5 block">
              {formatTemp(daily.minTemp)}
            </span>
          </div>

          <div className="px-2">
            <span className="text-xs text-[#8ea4be] font-medium block">
              Max (Today)
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-white font-mono mt-1.5 block">
              {formatTemp(daily.maxTemp)}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
