export const WMO_CODES = {
  0: { label: 'Clear', category: 'clear', icon: 'Sun', description: 'Sunny and clear conditions' },
  1: { label: 'Clear', category: 'clear', icon: 'Sun', description: 'Mainly clear sky' },
  2: { label: 'Partly Cloudy', category: 'partly-cloudy', icon: 'CloudSun', description: 'Partly cloudy sky' },
  3: { label: 'Cloudy', category: 'cloudy', icon: 'Cloud', description: 'Overcast cloud cover' },
  45: { label: 'Fog', category: 'fog', icon: 'CloudFog', description: 'Dense ground fog' },
  48: { label: 'Fog', category: 'fog', icon: 'CloudFog', description: 'Freezing rime fog' },
  51: { label: 'Rain', category: 'rain', icon: 'CloudDrizzle', description: 'Light rain drizzle' },
  53: { label: 'Rain', category: 'rain', icon: 'CloudDrizzle', description: 'Moderate drizzle' },
  55: { label: 'Rain', category: 'rain', icon: 'CloudDrizzle', description: 'Dense drizzle' },
  56: { label: 'Rain', category: 'rain', icon: 'CloudSnow', description: 'Freezing drizzle' },
  57: { label: 'Rain', category: 'rain', icon: 'CloudSnow', description: 'Dense freezing drizzle' },
  61: { label: 'Rain', category: 'rain', icon: 'CloudRain', description: 'Light rainfall' },
  63: { label: 'Rain', category: 'rain', icon: 'CloudRain', description: 'Moderate rain' },
  65: { label: 'Heavy Rain', category: 'heavy-rain', icon: 'CloudRain', description: 'Heavy downpour' },
  66: { label: 'Rain', category: 'rain', icon: 'CloudSnow', description: 'Freezing rainfall' },
  67: { label: 'Heavy Rain', category: 'heavy-rain', icon: 'CloudSnow', description: 'Severe freezing rainfall' },
  71: { label: 'Snow', category: 'snow', icon: 'Snowflake', description: 'Light snowfall' },
  73: { label: 'Snow', category: 'snow', icon: 'Snowflake', description: 'Moderate snowfall' },
  75: { label: 'Snow', category: 'snow', icon: 'Snowflake', description: 'Heavy blizzard' },
  77: { label: 'Snow', category: 'snow', icon: 'Snowflake', description: 'Granular snow ice' },
  80: { label: 'Rain', category: 'rain', icon: 'CloudRain', description: 'Passing rain showers' },
  81: { label: 'Rain', category: 'rain', icon: 'CloudRain', description: 'Moderate rain showers' },
  82: { label: 'Heavy Rain', category: 'heavy-rain', icon: 'CloudLightning', description: 'Violent torrential showers' },
  85: { label: 'Snow', category: 'snow', icon: 'Snowflake', description: 'Passing snow showers' },
  86: { label: 'Snow', category: 'snow', icon: 'Snowflake', description: 'Heavy snow bursts' },
  95: { label: 'Thunderstorm', category: 'thunderstorm', icon: 'CloudLightning', description: 'Thunderstorm with lightning' },
  96: { label: 'Thunderstorm', category: 'thunderstorm', icon: 'CloudLightning', description: 'Thunderstorm with hail' },
  99: { label: 'Thunderstorm', category: 'thunderstorm', icon: 'CloudLightning', description: 'Violent severe thunderstorm' }
};

export function getStandardCondition(code) {
  if (code === 0 || code === 1) return 'Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Cloudy';
  if (code === 45 || code === 48) return 'Fog';
  if (code === 65 || code === 67 || code === 82) return 'Heavy Rain';
  if ((code >= 51 && code <= 63) || code === 80 || code === 81) return 'Rain';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  if (code >= 71 && code <= 86) return 'Snow';
  return 'Partly Cloudy';
}

export function getWeatherInfo(code) {
  const base = WMO_CODES[code];
  if (base) return base;
  const standard = getStandardCondition(code);
  return {
    label: standard,
    category: standard.toLowerCase().replace(' ', '-'),
    icon: 'CloudSun',
    description: standard
  };
}

export function determineClimate(lat, lon, temp) {
  const absLat = Math.abs(lat);
  if (absLat <= 23.5) {
    if (lon >= 68 && lon <= 97) {
      return 'Tropical / Monsoon';
    }
    return temp > 28 ? 'Tropical / Humid' : 'Tropical Maritime';
  } else if (absLat <= 35) {
    return 'Subtropical / Semi-Arid';
  } else if (absLat <= 50) {
    return 'Temperate Continental';
  } else {
    return 'Sub-Polar / Boreal';
  }
}

export function determinePrecipType(weatherCode, rain, humidity) {
  if (weatherCode >= 95) return 'Convective / Storm';
  if (weatherCode >= 65 || rain > 5) return 'Intense Convective';
  if (rain > 0.5) return 'Stratiform / Frontal';
  if (humidity > 80) return 'Maritime Humid';
  return 'Mixed Atmospheric';
}

export function getWindDirection(degrees) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index] || 'N';
}
