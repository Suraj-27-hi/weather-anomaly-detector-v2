import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { Clock, Droplets, Thermometer } from 'lucide-react';

export default function HourlyGraph({ hourlyData, unit = 'C' }) {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [viewMode, setViewMode] = useState('mm'); // 'mm' (volume) or 'percent' (percentage chance)

  if (!hourlyData || hourlyData.length === 0) {
    return (
      <div className="w-full card-navy p-5 text-center text-slate-400 text-xs">
        Loading 24-hour telemetry curve...
      </div>
    );
  }

  const isF = unit === 'F';
  const formatTemp = (celsius) => {
    if (celsius === undefined || celsius === null) return '--';
    const val = isF ? (celsius * 9/5) + 32 : celsius;
    return `${Math.round(val * 10) / 10}°${unit}`;
  };

  // Prepare chart data with converted temperature and rain percentage
  const chartData = hourlyData.map(d => ({
    ...d,
    tempFormatted: isF ? Math.round(((d.temperature * 9/5) + 32) * 10) / 10 : d.temperature,
    // If viewMode is percent, bar displays probability (0-100), otherwise volume (mm)
    barValue: viewMode === 'percent' ? d.rainProbability : d.precipitation
  }));

  const activePoint = selectedPoint || chartData[0];

  const handleChartClick = (state) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      setSelectedPoint(state.activePayload[0].payload);
    }
  };

  const peakPoint = hourlyData.reduce((prev, curr) => (curr.rainProbability > prev.rainProbability ? curr : prev), hourlyData[0] || {});
  const avgRainProb = Math.round(hourlyData.reduce((acc, d) => acc + (d.rainProbability || 0), 0) / (hourlyData.length || 1));

  return (
    <div className="w-full card-navy p-5 mb-3">
      
      {/* Title matching Image 1 */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[#38bdf8] text-sm">◆</span>
          <h3 className="text-sm sm:text-base font-bold text-white font-heading tracking-wide">
            Last 24 Hours
          </h3>
          <span className="text-xs text-slate-400">
            (Temperature & Rainfall)
          </span>
        </div>
      </div>

      {/* Main Graph Canvas */}
      <div className="w-full h-56 sm:h-60">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={chartData} 
            onClick={handleChartClick}
            margin={{ top: 15, right: 10, left: -25, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#0e223d" vertical={false} />

            <XAxis 
              dataKey="displayTime" 
              stroke="#5e7694" 
              tick={{ fill: '#7b92ad', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              interval="preserveStartEnd"
              tickLine={false}
              axisLine={{ stroke: '#122543' }}
            />
            
            <YAxis 
              yAxisId="temp" 
              stroke="#5e7694" 
              tick={{ fill: '#7b92ad', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              tickFormatter={(v) => `${v}°`}
              domain={['dataMin - 3', 'dataMax + 4']}
              tickLine={false}
              axisLine={{ stroke: '#122543' }}
            />

            <YAxis 
              yAxisId="rain" 
              orientation="right" 
              domain={viewMode === 'percent' ? [0, 100] : [0, 'auto']}
              hide={true}
            />

            <Tooltip 
              content={<CustomTooltip unit={unit} isF={isF} viewMode={viewMode} />}
              cursor={{ stroke: '#38bdf8', strokeWidth: 1, strokeDasharray: '3 3' }}
            />

            {/* Rainfall Bars (Blue matching Image 1) */}
            <Bar 
              yAxisId="rain" 
              dataKey="barValue" 
              fill="#0284c7" 
              radius={[3, 3, 0, 0]} 
              maxBarSize={18}
            />

            {/* Temperature Line (Warm Amber/Orange matching Image 1) */}
            <Line 
              yAxisId="temp" 
              type="monotone" 
              dataKey="tempFormatted" 
              stroke="#f59e0b" 
              strokeWidth={2.8} 
              dot={{ r: 3.5, fill: '#f59e0b', stroke: '#07152b', strokeWidth: 1.5 }}
              activeDot={{ r: 6, fill: '#ffffff', stroke: '#f59e0b', strokeWidth: 2.5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend matching Image 1 */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-300 mt-4 pt-3 border-t border-[#122543]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" />
            <span>Temperature (°{unit})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#0284c7] shadow-[0_0_6px_#0284c7]" />
            <span>
              {viewMode === 'percent' ? 'Rain Probability (%)' : 'Rainfall (mm)'}
            </span>
          </div>
        </div>

        {activePoint && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#040a16] border border-[#142a4a] text-xs">
            <span className="text-slate-400">Selected:</span>
            <b className="text-white">{activePoint.displayTime}</b>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-bold">{formatTemp(activePoint.temperature)}</span>
            <span className="text-slate-600">|</span>
            <span className="text-[#38bdf8] font-bold">{activePoint.precipitation} mm</span>
            <span className="text-slate-400 text-[11px]">({activePoint.rainProbability}% chance)</span>
          </div>
        )}
      </div>

    </div>
  );
}

function CustomTooltip({ active, payload, label, unit, isF, viewMode }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const temp = isF ? ((data.temperature * 9/5) + 32).toFixed(1) : data.temperature;
    return (
      <div className="p-3 bg-[#07152b] border border-[#1a365f] rounded-lg shadow-2xl font-mono text-xs">
        <p className="text-white font-bold mb-1.5 flex items-center gap-1.5 border-b border-slate-800 pb-1">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{label}</span>
        </p>
        <p className="text-amber-400 flex items-center justify-between gap-4 font-bold">
          <span>Temperature:</span>
          <span>{temp}°{unit}</span>
        </p>
        <p className="text-sky-400 flex items-center justify-between gap-4 font-bold">
          <span>Rainfall (mm):</span>
          <span>{data.precipitation} mm</span>
        </p>
        <p className="text-blue-300 flex items-center justify-between gap-4 font-bold">
          <span>Rain Percentage:</span>
          <span>{data.rainProbability}%</span>
        </p>
        <p className="text-slate-400 flex items-center justify-between gap-4">
          <span>Humidity:</span>
          <span className="text-slate-200">{data.humidity}%</span>
        </p>
      </div>
    );
  }
  return null;
}
