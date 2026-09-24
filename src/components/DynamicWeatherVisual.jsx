import React, { useMemo } from 'react';

/**
 * 3D Weather Icons matching Image 3:
 * - Drizzle: Golden radiant sun peaking from top-left, soft puffy cloud in front, diagonal blue/cyan raindrops below
 * - Sunny: 3D golden sun with rotating rays
 * - Partly Cloudy: Sun behind cloud
 * - Cloudy: Dual 3D puffy clouds
 * - Rain: 3D cloud with falling rain and splash
 * - Heavy Rain: Darker cloud with rapid rain streaks
 * - Thunderstorm: Storm cloud with golden lightning bolt
 * - Fog: Soft drifting mist waves
 * - Snow: 3D cloud with soft snowflakes
 */
export default function DynamicWeatherVisual({ weatherCode = 0, category = 'partly-cloudy', size = 80 }) {
  const condition = useMemo(() => {
    if (weatherCode === 0 || weatherCode === 1) return 'sunny';
    if (weatherCode === 2) return 'partly-cloudy';
    if (weatherCode === 3) return 'cloudy';
    if (weatherCode === 45 || weatherCode === 48) return 'fog';
    if (weatherCode >= 51 && weatherCode <= 57) return 'drizzle';
    if (weatherCode === 61 || weatherCode === 63 || weatherCode === 80 || weatherCode === 81) return 'rain';
    if (weatherCode === 65 || weatherCode === 82) return 'heavy-rain';
    if (weatherCode >= 71 && weatherCode <= 77 || weatherCode === 85 || weatherCode === 86) return 'snow';
    if (weatherCode >= 95) return 'thunderstorm';
    return category || 'drizzle';
  }, [weatherCode, category]);

  return (
    <div 
      className="relative flex items-center justify-center overflow-visible select-none pointer-events-none"
      style={{ width: size, height: size }}
    >
      {/* 1. DRIZZLE (Exactly matching Image 3 with sun + 3D puffy cloud + falling drops) */}
      {condition === 'drizzle' && (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Golden Sun peaking out top-left */}
          <div className="absolute top-1 left-2 w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 shadow-[0_0_16px_rgba(251,191,36,0.8)] animate-pulse" />
          
          {/* Sunlight rays */}
          <svg className="absolute top-0 left-1 w-11 h-11 text-amber-400/70 animate-spin-rays" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4">
            <line x1="50" y1="12" x2="50" y2="2" />
            <line x1="12" y1="50" x2="2" y2="50" />
            <line x1="23" y1="23" x2="16" y2="16" />
          </svg>

          {/* 3D Puffy Glossy Cloud in front */}
          <div className="relative z-10 drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] animate-drift-cloud">
            <svg width="68" height="42" viewBox="0 0 68 42" fill="none">
              <path 
                d="M18 38H54C60.6274 38 66 32.6274 66 26C66 19.3726 60.6274 14 54 14C53.3769 14 52.7661 14.0478 52.17 14.1396C49.9103 6.00287 42.4938 0 33.6667 0C23.6334 0 15.3421 7.69707 14.4172 17.5147C13.6267 17.1777 12.759 17 11.8462 17C5.30325 17 0 22.3033 0 28.8462C0 35.3891 5.30325 40.6923 11.8462 40.6923" 
                fill="url(#cloud3dDrizzle)" 
              />
              {/* Cloud highlight */}
              <path 
                d="M20 18C23 10 32 4 40 7C48 10 52 14 52 14" 
                stroke="#ffffff" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                opacity="0.6" 
              />
              <defs>
                <linearGradient id="cloud3dDrizzle" x1="10" y1="0" x2="58" y2="42" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ffffff" />
                  <stop offset="0.6" stopColor="#e2e8f0" />
                  <stop offset="1" stopColor="#94a3b8" />
                </linearGradient>
              </defs>
            </svg>

            {/* Falling Drizzle Drops (matching Image 3 blue/purple raindrops) */}
            <div className="absolute -bottom-4 left-3 w-12 h-6 flex justify-around">
              <span className="w-1.5 h-3.5 rounded-full bg-gradient-to-b from-indigo-400 to-blue-500 shadow-[0_0_6px_#38bdf8] animate-drizzle-1 -rotate-12" />
              <span className="w-1.5 h-3.5 rounded-full bg-gradient-to-b from-indigo-400 to-blue-500 shadow-[0_0_6px_#38bdf8] animate-drizzle-2 -rotate-12" />
              <span className="w-1.5 h-3.5 rounded-full bg-gradient-to-b from-indigo-400 to-blue-500 shadow-[0_0_6px_#38bdf8] animate-drizzle-3 -rotate-12" />
            </div>
          </div>
        </div>
      )}

      {/* 2. SUNNY / CLEAR */}
      {condition === 'sunny' && (
        <div className="relative w-full h-full flex items-center justify-center animate-gentle-float">
          <div className="absolute inset-0 rounded-full bg-amber-400/25 blur-xl animate-pulse" />
          <svg className="absolute inset-0 w-full h-full text-amber-400/80 animate-spin-rays" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
            <line x1="50" y1="10" x2="50" y2="2" />
            <line x1="50" y1="90" x2="50" y2="98" />
            <line x1="10" y1="50" x2="2" y2="50" />
            <line x1="90" y1="50" x2="98" y2="50" />
            <line x1="21.7" y1="21.7" x2="16" y2="16" />
            <line x1="78.3" y1="78.3" x2="84" y2="84" />
            <line x1="21.7" y1="78.3" x2="16" y2="84" />
            <line x1="78.3" y1="21.7" x2="84" y2="16" />
          </svg>
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 shadow-[0_0_24px_rgba(251,191,36,0.9)]" />
        </div>
      )}

      {/* 3. PARTLY CLOUDY */}
      {condition === 'partly-cloudy' && (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute top-1 right-2 w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-[0_0_16px_rgba(251,191,36,0.7)] animate-pulse" />
          <div className="relative z-10 -bottom-1 left-0 drop-shadow-[0_6px_12px_rgba(0,0,0,0.5)] animate-drift-cloud">
            <svg width="68" height="42" viewBox="0 0 68 42" fill="none">
              <path d="M18 38H54C60.6 38 66 32.6 66 26C66 19.4 60.6 14 54 14C53.4 14 52.8 14 52.2 14.1C49.9 6 42.5 0 33.7 0C23.6 0 15.3 7.7 14.4 17.5C13.6 17.2 12.8 17 11.8 17C5.3 17 0 22.3 0 28.8C0 35.4 5.3 40.7 11.8 40.7" fill="url(#cloud3dPartly)" />
              <defs>
                <linearGradient id="cloud3dPartly" x1="0" y1="0" x2="68" y2="42">
                  <stop stopColor="#ffffff" />
                  <stop offset="0.6" stopColor="#e2e8f0" />
                  <stop offset="1" stopColor="#94a3b8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      )}

      {/* 4. CLOUDY / OVERCAST */}
      {condition === 'cloudy' && (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute top-1 right-1 opacity-70 animate-drift-cloud-slow">
            <svg width="56" height="34" viewBox="0 0 68 42" fill="#64748b">
              <path d="M18 38H54C60.6 38 66 32.6 66 26C66 19.4 60.6 14 54 14C53.4 14 52.8 14 52.2 14.1C49.9 6 42.5 0 33.7 0C23.6 0 15.3 7.7 14.4 17.5C13.6 17.2 12.8 17 11.8 17C5.3 17 0 22.3 0 28.8C0 35.4 5.3 40.7 11.8 40.7" />
            </svg>
          </div>
          <div className="relative z-10 bottom-1 left-0 drop-shadow-xl animate-drift-cloud">
            <svg width="68" height="42" viewBox="0 0 68 42" fill="url(#cloud3dOvercast)">
              <path d="M18 38H54C60.6 38 66 32.6 66 26C66 19.4 60.6 14 54 14C53.4 14 52.8 14 52.2 14.1C49.9 6 42.5 0 33.7 0C23.6 0 15.3 7.7 14.4 17.5C13.6 17.2 12.8 17 11.8 17C5.3 17 0 22.3 0 28.8C0 35.4 5.3 40.7 11.8 40.7" />
              <defs>
                <linearGradient id="cloud3dOvercast" x1="0" y1="0" x2="68" y2="42">
                  <stop stopColor="#e2e8f0" />
                  <stop offset="1" stopColor="#64748b" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      )}

      {/* 5. RAIN */}
      {condition === 'rain' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <div className="relative drop-shadow-xl animate-drift-cloud">
            <svg width="68" height="40" viewBox="0 0 68 42" fill="url(#cloud3dRain)">
              <path d="M18 38H54C60.6 38 66 32.6 66 26C66 19.4 60.6 14 54 14C53.4 14 52.8 14 52.2 14.1C49.9 6 42.5 0 33.7 0C23.6 0 15.3 7.7 14.4 17.5C13.6 17.2 12.8 17 11.8 17C5.3 17 0 22.3 0 28.8C0 35.4 5.3 40.7 11.8 40.7" />
              <defs>
                <linearGradient id="cloud3dRain" x1="0" y1="0" x2="68" y2="42">
                  <stop stopColor="#cbd5e1" />
                  <stop offset="1" stopColor="#475569" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="relative w-14 h-7 flex justify-around mt-1">
            <span className="w-1.5 h-4 rounded-full bg-cyan-400 shadow-[0_0_6px_#38bdf8] animate-rain-drop-1" />
            <span className="w-1.5 h-4 rounded-full bg-blue-400 shadow-[0_0_6px_#0284c7] animate-rain-drop-2" />
            <span className="w-1.5 h-4 rounded-full bg-cyan-400 shadow-[0_0_6px_#38bdf8] animate-rain-drop-3" />
          </div>
        </div>
      )}

      {/* 6. HEAVY RAIN */}
      {condition === 'heavy-rain' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <div className="relative drop-shadow-2xl">
            <svg width="68" height="40" viewBox="0 0 68 42" fill="url(#cloud3dHeavy)">
              <path d="M18 38H54C60.6 38 66 32.6 66 26C66 19.4 60.6 14 54 14C53.4 14 52.8 14 52.2 14.1C49.9 6 42.5 0 33.7 0C23.6 0 15.3 7.7 14.4 17.5C13.6 17.2 12.8 17 11.8 17C5.3 17 0 22.3 0 28.8C0 35.4 5.3 40.7 11.8 40.7" />
              <defs>
                <linearGradient id="cloud3dHeavy" x1="0" y1="0" x2="68" y2="42">
                  <stop stopColor="#64748b" />
                  <stop offset="1" stopColor="#1e293b" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="relative w-16 h-8 flex justify-around mt-1">
            <span className="w-1.5 h-5 rounded-full bg-cyan-400 animate-rain-fast-1" />
            <span className="w-1.5 h-5 rounded-full bg-sky-300 animate-rain-fast-2" />
            <span className="w-1.5 h-5 rounded-full bg-blue-500 animate-rain-fast-3" />
            <span className="w-1.5 h-5 rounded-full bg-cyan-400 animate-rain-fast-1" />
          </div>
        </div>
      )}

      {/* 7. THUNDERSTORM */}
      {condition === 'thunderstorm' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <div className="relative drop-shadow-2xl">
            <svg width="68" height="40" viewBox="0 0 68 42" fill="url(#cloud3dStorm)">
              <path d="M18 38H54C60.6 38 66 32.6 66 26C66 19.4 60.6 14 54 14C53.4 14 52.8 14 52.2 14.1C49.9 6 42.5 0 33.7 0C23.6 0 15.3 7.7 14.4 17.5C13.6 17.2 12.8 17 11.8 17C5.3 17 0 22.3 0 28.8C0 35.4 5.3 40.7 11.8 40.7" />
              <defs>
                <linearGradient id="cloud3dStorm" x1="0" y1="0" x2="68" y2="42">
                  <stop stopColor="#475569" />
                  <stop offset="1" stopColor="#0f172a" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute top-5 left-7 animate-lightning drop-shadow-[0_0_10px_#fde047]">
              <svg width="18" height="26" viewBox="0 0 24 24" fill="#fde047">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
          </div>
          <div className="relative w-12 h-5 flex justify-around">
            <span className="w-1.5 h-3.5 rounded-full bg-cyan-400 animate-rain-drop-1" />
            <span className="w-1.5 h-3.5 rounded-full bg-amber-300 animate-rain-drop-2" />
            <span className="w-1.5 h-3.5 rounded-full bg-cyan-400 animate-rain-drop-3" />
          </div>
        </div>
      )}

      {/* 8. FOG */}
      {condition === 'fog' && (
        <div className="relative w-full h-full flex flex-col justify-center gap-2 px-2">
          <div className="w-full h-2 rounded-full bg-slate-400/60 animate-fog-drift-1" />
          <div className="w-3/4 h-2.5 rounded-full bg-slate-300/80 animate-fog-drift-2 ml-auto" />
          <div className="w-full h-2 rounded-full bg-slate-400/60 animate-fog-drift-3" />
          <div className="w-2/3 h-2 rounded-full bg-slate-300/70 animate-fog-drift-1" />
        </div>
      )}

      {/* 9. SNOW */}
      {condition === 'snow' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <svg width="64" height="36" viewBox="0 0 68 42" fill="#94a3b8">
            <path d="M18 38H54C60.6 38 66 32.6 66 26C66 19.4 60.6 14 54 14C53.4 14 52.8 14 52.2 14.1C49.9 6 42.5 0 33.7 0C23.6 0 15.3 7.7 14.4 17.5C13.6 17.2 12.8 17 11.8 17C5.3 17 0 22.3 0 28.8C0 35.4 5.3 40.7 11.8 40.7" />
          </svg>
          <div className="relative w-14 h-6 flex justify-around mt-1">
            <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#fff] animate-snow-1" />
            <span className="w-2.5 h-2.5 rounded-full bg-sky-100 shadow-[0_0_8px_#fff] animate-snow-2" />
            <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#fff] animate-snow-3" />
          </div>
        </div>
      )}

    </div>
  );
}
