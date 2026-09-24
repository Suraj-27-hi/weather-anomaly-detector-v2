import { getWeatherInfo, determineClimate, determinePrecipType, getWindDirection } from '../data/weatherConditions';

export async function fetchCurrentAndHourlyWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation,precipitation_probability,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo API returned status ${res.status}`);
  }

  const data = await res.json();
  const current = data.current || {};
  const daily = data.daily || {};
  const hourly = data.hourly || {};

  const weatherMeta = getWeatherInfo(current.weather_code);
  const climateType = determineClimate(lat, lon, current.temperature_2m);
  const precipType = determinePrecipType(current.weather_code, current.precipitation, current.relative_humidity_2m);
  const windDirText = getWindDirection(current.wind_direction_10m);

  // Extract 24 hours centered around current time
  const hourlyPoints = [];
  if (hourly.time && Array.isArray(hourly.time)) {
    const nowIso = new Date().toISOString().slice(0, 13);
    let startIndex = hourly.time.findIndex(t => t.startsWith(nowIso));
    if (startIndex === -1) startIndex = 0;
    
    const start = Math.max(0, startIndex - 6);
    const end = Math.min(hourly.time.length, start + 24);

    for (let i = start; i < end; i++) {
      const timeStr = hourly.time[i];
      const dateObj = new Date(timeStr);
      const hours = dateObj.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHour = `${(hours % 12) || 12} ${ampm}`;

      const precipVal = Math.max(0, Math.round((hourly.precipitation?.[i] || 0) * 10) / 10);
      const humVal = Math.round(hourly.relative_humidity_2m?.[i] || 0);
      const code = hourly.weather_code?.[i] ?? 0;

      // Robust Rain percentage calculation:
      // 1. If Open-Meteo provides precipitation_probability (0-100), use it
      // 2. Otherwise calculate accurately from precipitation volume, humidity, and weather code
      let rainPercent = hourly.precipitation_probability?.[i];
      if (rainPercent === undefined || rainPercent === null) {
        if (precipVal >= 2.0) {
          rainPercent = Math.min(100, Math.round(85 + precipVal * 3));
        } else if (precipVal > 0) {
          rainPercent = Math.min(95, Math.round(60 + precipVal * 25));
        } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
          // Rain or shower weather codes
          rainPercent = Math.min(90, Math.max(65, humVal));
        } else if ([95, 96, 99].includes(code)) {
          // Thunderstorm codes
          rainPercent = 92;
        } else if ([1, 2, 3].includes(code)) {
          // Cloudy / Overcast
          rainPercent = Math.max(5, Math.min(55, Math.round((humVal - 45) * 1.1)));
        } else {
          // Clear / Sunny
          rainPercent = Math.max(0, Math.min(20, Math.round((humVal - 65) * 0.5)));
        }
      }

      hourlyPoints.push({
        rawTime: timeStr,
        displayTime: formattedHour,
        hour: hours,
        temperature: Math.round(hourly.temperature_2m?.[i] * 10) / 10,
        precipitation: precipVal,
        rainProbability: Math.min(100, Math.max(0, Math.round(rainPercent))),
        humidity: humVal,
        windSpeed: Math.round((hourly.wind_speed_10m?.[i] || 0) * 10) / 10,
        weatherCode: code
      });
    }
  }

  // Calculate current precipitation probability
  const currentRainProb = hourlyPoints.length > 0 
    ? hourlyPoints[Math.min(6, hourlyPoints.length - 1)].rainProbability 
    : (current.precipitation > 0 ? 85 : Math.max(10, Math.round((current.relative_humidity_2m - 50) * 1.2)));

  return {
    coordinates: { lat, lon },
    current: {
      temperature: Math.round(current.temperature_2m * 10) / 10,
      feelsLike: Math.round(current.apparent_temperature * 10) / 10,
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
      windDirectionDeg: current.wind_direction_10m,
      windDirectionText: windDirText,
      rainfall1h: Math.round((current.precipitation || 0) * 10) / 10,
      rainProbability: currentRainProb,
      weatherCode: current.weather_code,
      weatherInfo: weatherMeta,
      climateType,
      precipType
    },
    daily: {
      minTemp: Math.round(daily.temperature_2m_min?.[0] * 10) / 10 ?? 21,
      maxTemp: Math.round(daily.temperature_2m_max?.[0] * 10) / 10 ?? 29,
      rainfallToday: Math.round((daily.precipitation_sum?.[0] || 0) * 10) / 10,
      maxWindSpeed: Math.round((daily.wind_speed_10m_max?.[0] || current.wind_speed_10m || 16) * 10) / 10
    },
    hourly24: hourlyPoints
  };
}

export async function fetchHistoricalWeather(lat, lon, year = 2024) {
  try {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Historical API error: ${res.status}`);
    }
    const data = await res.json();
    const daily = data.daily || {};
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyStats = months.map((m) => ({
      month: m,
      avgMaxTemp: 0,
      avgMinTemp: 0,
      totalRainfall: 0,
      maxWind: 0,
      days: 0
    }));

    if (daily.time && Array.isArray(daily.time)) {
      for (let i = 0; i < daily.time.length; i++) {
        const d = new Date(daily.time[i]);
        const mIdx = d.getMonth();
        if (mIdx >= 0 && mIdx < 12) {
          monthlyStats[mIdx].days++;
          monthlyStats[mIdx].avgMaxTemp += daily.temperature_2m_max?.[i] || 0;
          monthlyStats[mIdx].avgMinTemp += daily.temperature_2m_min?.[i] || 0;
          monthlyStats[mIdx].totalRainfall += daily.precipitation_sum?.[i] || 0;
          if ((daily.wind_speed_10m_max?.[i] || 0) > monthlyStats[mIdx].maxWind) {
            monthlyStats[mIdx].maxWind = daily.wind_speed_10m_max[i];
          }
        }
      }

      monthlyStats.forEach(m => {
        if (m.days > 0) {
          m.avgMaxTemp = Math.round((m.avgMaxTemp / m.days) * 10) / 10;
          m.avgMinTemp = Math.round((m.avgMinTemp / m.days) * 10) / 10;
          m.avgTemp = Math.round(((m.avgMaxTemp + m.avgMinTemp) / 2) * 10) / 10;
          m.totalRainfall = Math.round(m.totalRainfall * 10) / 10;
          m.maxWind = Math.round(m.maxWind * 10) / 10;
        }
      });
    }

    return {
      year,
      monthly: monthlyStats,
      success: true
    };
  } catch (err) {
    console.warn(`Historical archive fetch fallback for ${year}:`, err);
    return generateFallbackHistorical(year);
  }
}

function generateFallbackHistorical(year) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const baseTemps = [27, 29, 32, 34, 33, 29, 27, 27, 28, 28, 27, 26];
  const baseRain = [2, 5, 14, 45, 110, 85, 120, 145, 180, 160, 60, 12];
  
  const monthly = months.map((m, i) => {
    const variance = ((year % 5) - 2) * 0.4;
    return {
      month: m,
      avgMaxTemp: Math.round((baseTemps[i] + 3 + variance) * 10) / 10,
      avgMinTemp: Math.round((baseTemps[i] - 5 + variance) * 10) / 10,
      avgTemp: Math.round((baseTemps[i] + variance) * 10) / 10,
      totalRainfall: Math.max(0, Math.round((baseRain[i] * (1 + (year % 3) * 0.1)) * 10) / 10),
      maxWind: Math.round((18 + Math.sin(i) * 6) * 10) / 10
    };
  });

  return { year, monthly, success: false };
}
