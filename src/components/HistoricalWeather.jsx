import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { History, Calendar, Thermometer, CloudRain, Wind, ArrowUpDown } from 'lucide-react';
import { fetchHistoricalWeather } from '../api/weatherApi';

const AVAILABLE_YEARS = [2025, 2024, 2023, 2022, 2021, 2020];

export default function HistoricalWeather({ currentLocation, unit = 'C' }) {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [historicalData, setHistoricalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeMetric, setActiveMetric] = useState('all'); // 'all' | 'temperature' | 'rainfall' | 'wind'

  useEffect(() => {
    if (!currentLocation?.lat || !currentLocation?.lon) return;

    setLoading(true);
    fetchHistoricalWeather(currentLocation.lat, currentLocation.lon, selectedYear)
      .then(res => {
        setHistoricalData(res.monthly);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Historical weather load error:', err);
        setLoading(false);
      });
  }, [currentLocation, selectedYear]);

  const isF = unit === 'F';
  const formatTemp = (c) => {
    if (c === undefined || c === null) return '--';
    const val = isF ? (c * 9/5) + 32 : c;
    return `${Math.round(val * 10) / 10}°${unit}`;
  };

  // Convert chart data
  const chartData = (historicalData || []).map(d => ({
    ...d,
    maxTempConverted: isF ? Math.round(((d.avgMaxTemp * 9/5) + 32) * 10) / 10 : d.avgMaxTemp,
    minTempConverted: isF ? Math.round(((d.avgMinTemp * 9/5) + 32) * 10) / 10 : d.avgMinTemp,
    avgTempConverted: isF ? Math.round(((d.avgTemp * 9/5) + 32) * 10) / 10 : d.avgTemp
  }));

  // Summary aggregates
  const totalYearlyRain = chartData.reduce((acc, curr) => acc + (curr.totalRainfall || 0), 0);
  const avgYearlyMax = chartData.length > 0 
    ? Math.round((chartData.reduce((acc, curr) => acc + (curr.avgMaxTemp || 0), 0) / chartData.length) * 10) / 10 
    : 0;
  const maxGust = Math.max(...chartData.map(d => d.maxWind || 0), 0);

  return (
    <div className="glass-card p-5 my-6 border border-cyan-500/20 bg-[var(--bg-card)]">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <History className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-heading tracking-wide">
              HISTORICAL WEATHER ARCHIVE
            </h3>
            <span className="text-xs font-mono text-cyan-400 font-semibold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              {currentLocation.name}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Multi-year Open-Meteo climate baselines, precipitation accumulations, and diurnal temperature variance.
          </p>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
            <Calendar className="w-3.5 h-3.5 text-cyan-400 ml-2" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-xs font-mono font-semibold text-white pl-1 pr-6 py-1 outline-none cursor-pointer"
            >
              {AVAILABLE_YEARS.map(y => (
                <option key={y} value={y} className="bg-slate-900 text-white">
                  Year {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Aggregate Statistics Header Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
        <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Annual Mean Max
            </span>
            <p className="text-xl font-bold text-white font-mono mt-1">
              {formatTemp(avgYearlyMax)}
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">Archive {selectedYear}</span>
        </div>

        <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
              <CloudRain className="w-3.5 h-3.5 text-blue-400" /> Total Annual Rainfall
            </span>
            <p className="text-xl font-bold text-cyan-300 font-mono mt-1">
              {Math.round(totalYearlyRain)} <span className="text-xs font-normal text-slate-400">mm</span>
            </p>
          </div>
          <span className="text-xs font-mono text-blue-400">Accumulated</span>
        </div>

        <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-sky-400" /> Peak Gust Velocity
            </span>
            <p className="text-xl font-bold text-sky-300 font-mono mt-1">
              {maxGust} <span className="text-xs font-normal text-slate-400">km/h</span>
            </p>
          </div>
          <span className="text-xs font-mono text-sky-400">Historical Peak</span>
        </div>
      </div>

      {/* Main Chart */}
      <div className="w-full h-64 sm:h-72 mt-2">
        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs font-mono">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-2" />
            <span>Loading historical meteorological data for {selectedYear}...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="histRainBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity={0.15} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />

              <XAxis 
                dataKey="month" 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }} 
              />
              
              <YAxis 
                yAxisId="temp" 
                stroke="#64748b" 
                tick={{ fill: '#f59e0b', fontSize: 11, fontFamily: 'JetBrains Mono' }} 
                domain={['auto', 'auto']}
              />

              <YAxis 
                yAxisId="rain" 
                orientation="right" 
                stroke="#64748b" 
                tick={{ fill: '#38bdf8', fontSize: 11, fontFamily: 'JetBrains Mono' }} 
                domain={[0, 'auto']}
                hide={true}
              />

              <Tooltip content={<HistoricalTooltip unit={unit} isF={isF} year={selectedYear} />} />

              <Bar 
                yAxisId="rain" 
                dataKey="totalRainfall" 
                name="Rainfall (mm)" 
                fill="url(#histRainBar)" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={28}
              />

              <Line 
                yAxisId="temp" 
                type="monotone" 
                dataKey="maxTempConverted" 
                name={`Avg Max (°${unit})`} 
                stroke="#f97316" 
                strokeWidth={2.5} 
                dot={{ r: 3, fill: '#f97316' }} 
              />

              <Line 
                yAxisId="temp" 
                type="monotone" 
                dataKey="minTempConverted" 
                name={`Avg Min (°${unit})`} 
                stroke="#38bdf8" 
                strokeWidth={2} 
                dot={{ r: 3, fill: '#38bdf8' }} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-3 pt-2 border-t border-[var(--border-subtle)]">
        <span>Orange: Monthly Avg High • Blue Line: Monthly Avg Low • Bars: Total Monthly Rainfall</span>
        <span>ERA5 / Open-Meteo Global Reanalysis</span>
      </div>

    </div>
  );
}

function HistoricalTooltip({ active, payload, label, unit, isF, year }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 bg-slate-950/95 border border-cyan-500/40 rounded-lg shadow-2xl font-mono text-xs text-white">
        <p className="font-bold text-cyan-300 border-b border-slate-800 pb-1 mb-1.5">
          {label} {year}
        </p>
        <p className="text-amber-300">Avg Max: <b>{data.maxTempConverted}°{unit}</b></p>
        <p className="text-sky-300">Avg Min: <b>{data.minTempConverted}°{unit}</b></p>
        <p className="text-blue-400">Total Rain: <b>{data.totalRainfall} mm</b></p>
        <p className="text-slate-400">Peak Wind: <b>{data.maxWind} km/h</b></p>
      </div>
    );
  }
  return null;
}
