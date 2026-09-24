import React from 'react';
import { AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import DynamicWeatherVisual from './DynamicWeatherVisual';

export default function WeatherCard({ 
  weatherData, 
  anomalyData, 
  unit = 'C',
  onOpenDetails 
}) {
  if (!weatherData || !weatherData.current) return null;

  const { current } = weatherData;
  const isF = unit === 'F';
  const formatTemp = (celsius) => {
    if (celsius === undefined || celsius === null) return '--';
    const val = isF ? (celsius * 9/5) + 32 : celsius;
    return `${Math.round(val)}°${unit}`;
  };

  const hasAnomaly = anomalyData?.hasAnomaly ?? false;
  const topAnomaly = anomalyData?.topAnomaly;

  return (
    <div className="w-full card-navy overflow-hidden p-5 sm:p-6 mb-3">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* LEFT HALF: Weather visual + Temperature + Condition label */}
        <div className="flex items-center gap-5 flex-1 w-full md:w-auto">
          {/* Dynamic Weather Visual Animation matching real conditions */}
          <div className="shrink-0 w-20 h-20 flex items-center justify-center">
            <DynamicWeatherVisual
              weatherCode={current.weatherCode}
              category={current.weatherInfo?.category}
              size={76}
            />
          </div>

          <div>
            <div className="text-4xl sm:text-5xl font-bold text-white tracking-tight font-heading">
              {formatTemp(current.temperature)}
            </div>
            <div className="text-sm sm:text-base font-medium text-slate-300 mt-1">
              {current.weatherInfo?.label || 'Drizzle'}
            </div>
          </div>
        </div>

        {/* Vertical divider on desktop, horizontal on mobile */}
        <div className="hidden md:block w-px h-16 bg-[#142a4a] shrink-0" />
        <div className="block md:hidden w-full h-px bg-[#142a4a] shrink-0" />

        {/* RIGHT HALF: Anomaly Detected / Normal Status */}
        <div className="flex items-start gap-3.5 flex-1 w-full md:w-auto">
          {hasAnomaly ? (
            <>
              {/* Solid Amber circular warning icon matching Image 3 */}
              <div className="w-9 h-9 rounded-full bg-[#f59e0b] flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_14px_rgba(245,158,11,0.6)]">
                <span className="text-[#071426] font-black text-xl font-mono leading-none">!</span>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-amber-400 tracking-wide font-heading">
                    Anomaly detected
                  </h3>
                  {onOpenDetails && (
                    <button
                      onClick={onOpenDetails}
                      className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Detailed</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {topAnomaly?.explanation || 
                    `mean humidity was 3.96 standard deviations below the recent baseline (77.4 %).`}
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Green checkmark icon for Normal status */}
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>

              <div className="flex-1">
                <h3 className="text-base font-bold text-emerald-400 tracking-wide font-heading">
                  No anomaly detected
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Conditions are normal for this region. Atmospheric variables conform to recent historical baselines.
                </p>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
