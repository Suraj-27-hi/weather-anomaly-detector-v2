import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchCurrentAndHourlyWeather } from '../api/weatherApi';
import { fetchAnomalyAnalysis } from '../api/anomalyApi';
import { reverseGeocode } from '../api/geocodingApi';
import { findMatchingState } from '../data/indianStatesData';

export const DEFAULT_LOCATION = {
  name: 'Bengaluru',
  state: 'Karnataka',
  country: 'India',
  displayName: 'Bengaluru, Karnataka, India',
  lat: 12.9716,
  lon: 77.5946
};

export function isCoordinateInIndia(lat, lon) {
  // India geographic bounding box: ~6.5°N to ~37.5°N, ~68.0°E to ~97.5°E
  return lat >= 6.5 && lat <= 37.5 && lon >= 68.0 && lon <= 97.5;
}

export function useWeather() {
  const [currentLocation, setCurrentLocation] = useState(DEFAULT_LOCATION);
  const [weatherData, setWeatherData] = useState(null);
  const [anomalyData, setAnomalyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzingAnomaly, setAnalyzingAnomaly] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg, type = 'info') => {
    setToastMessage({ msg, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(prev => (prev?.msg === msg ? null : prev));
    }, 4000);
  }, []);

  // Main fetch function for a location
  const loadWeatherData = useCallback(async (loc) => {
    if (!loc || typeof loc.lat !== 'number' || typeof loc.lon !== 'number') return;
    
    setLoading(true);
    setAnalyzingAnomaly(true);

    try {
      // 1. Fetch Open-Meteo Current and 24h Hourly Forecast
      const weather = await fetchCurrentAndHourlyWeather(loc.lat, loc.lon);
      setWeatherData(weather);
      setLoading(false);

      // 2. Fetch AI Anomaly Detection from Replit Backend
      try {
        const anomaly = await fetchAnomalyAnalysis(loc.lat, loc.lon, weather.current);
        setAnomalyData(anomaly);
      } catch (err) {
        console.warn('Anomaly detection error:', err);
      } finally {
        setAnalyzingAnomaly(false);
      }
    } catch (err) {
      console.error('Failed to load weather data:', err);
      showToast('Weather data temporarily unavailable for this coordinate.', 'error');
      setLoading(false);
      setAnalyzingAnomaly(false);
    }
  }, [showToast]);

  // Initial load
  useEffect(() => {
    loadWeatherData(currentLocation);
  }, []);

  // Handler: Select a location from search or recents
  const selectLocation = useCallback((newLoc) => {
    let stateName = newLoc.state || '';
    if (!stateName && newLoc.country === 'India') {
      const match = findMatchingState(newLoc.name);
      if (match) stateName = match.name;
    }

    const updated = {
      ...newLoc,
      state: stateName
    };

    setCurrentLocation(updated);
    loadWeatherData(updated);
  }, [loadWeatherData]);

  // Handler: Select by clicking on Map (Reverse geocode coordinates)
  const selectByCoords = useCallback(async (lat, lon) => {
    const inIndiaBounds = isCoordinateInIndia(lat, lon);

    // Immediately set new location so UI and map react instantly without geocoding delay
    const initialLoc = {
      name: `Target (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
      state: '',
      country: inIndiaBounds ? 'India' : 'International',
      displayName: `${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E`,
      lat,
      lon
    };
    setCurrentLocation(initialLoc);
    loadWeatherData(initialLoc);

    showToast(`Targeting: ${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E...`, 'info');

    // Reverse geocode in background with Nominatim
    try {
      const geo = await reverseGeocode(lat, lon);
      const isActuallyIndia = inIndiaBounds && (geo.country || '').toLowerCase().includes('india');
      
      const refinedLoc = {
        name: geo.name || `Target (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
        state: isActuallyIndia ? (geo.state || '') : '',
        country: isActuallyIndia ? 'India' : (geo.country || 'International'),
        displayName: geo.displayName || `${lat.toFixed(3)}, ${lon.toFixed(3)}`,
        lat,
        lon
      };
      setCurrentLocation(refinedLoc);
    } catch (err) {
      console.warn('Reverse geocode error:', err);
    }
  }, [loadWeatherData, showToast]);

  // Handler: Select by Indian State click
  const selectState = useCallback((stateName) => {
    const match = findMatchingState(stateName);
    if (match) {
      const loc = {
        name: match.capital,
        state: match.name,
        country: 'India',
        displayName: `${match.capital}, ${match.name}, India`,
        lat: match.lat,
        lon: match.lon
      };
      showToast(`Selected State: ${match.name} (${match.capital})`, 'success');
      setCurrentLocation(loc);
      loadWeatherData(loc);
    }
  }, [loadWeatherData, showToast]);

  // Handler: "Locate Me" button using browser geolocation
  const locateMe = useCallback(() => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }

    setIsLocating(true);
    showToast('Acquiring device GPS telemetry...', 'info');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        await selectByCoords(latitude, longitude);
        showToast('Device location acquired!', 'success');
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        showToast('Location permission denied or unavailable. Using default.', 'error');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [selectByCoords, showToast]);

  return {
    currentLocation,
    weatherData,
    anomalyData,
    loading,
    analyzingAnomaly,
    isLocating,
    toastMessage,
    selectLocation,
    selectByCoords,
    selectState,
    locateMe,
    refresh: () => loadWeatherData(currentLocation)
  };
}
