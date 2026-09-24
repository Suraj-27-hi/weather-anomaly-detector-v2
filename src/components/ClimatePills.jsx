import React from 'react';
import { Cloud, CloudSun } from 'lucide-react';

export default function ClimatePills({ weatherData }) {
  if (!weatherData?.current) return null;
  const { current } = weatherData;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
      
      {/* 1. WEATHER */}
      <div className="card-navy p-4 flex items-center gap-3.5 shadow-md">
        <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
          <Cloud className="w-5 h-5 text-[#38bdf8]" />
        </div>
        <div>
          <span className="text-xs text-[#8ea4be] font-medium block">
            Weather
          </span>
          <span className="text-sm sm:text-base font-bold text-white mt-0.5 block truncate">
            {current.weatherInfo?.label || 'Drizzle'}
          </span>
        </div>
      </div>

      {/* 2. CLIMATE */}
      <div className="card-navy p-4 flex items-center gap-3.5 shadow-md">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
          <div className="w-4 h-4 border-2 border-emerald-400 rotate-45 rounded-[2px]" />
        </div>
        <div>
          <span className="text-xs text-[#8ea4be] font-medium block">
            Climate
          </span>
          <span className="text-sm sm:text-base font-bold text-white mt-0.5 block truncate">
            {current.climateType || 'Tropical / Monsoon'}
          </span>
        </div>
      </div>

      {/* 3. TYPE */}
      <div className="card-navy p-4 flex items-center gap-3.5 shadow-md">
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
          <CloudSun className="w-5 h-5 text-[#38bdf8]" />
        </div>
        <div>
          <span className="text-xs text-[#8ea4be] font-medium block">
            Type
          </span>
          <span className="text-sm sm:text-base font-bold text-white mt-0.5 block truncate">
            {current.precipType || 'Cloudy'}
          </span>
        </div>
      </div>

    </div>
  );
}
