import React, { useEffect, useState, useMemo } from 'react';
import { GeoJSON } from 'react-leaflet';
import { INDIAN_STATES } from '../../data/indianStatesData';

export default function IndiaStateLayer({ 
  selectedState, 
  onSelectState, 
  currentWeather, 
  anomalyData,
  isIndia = true
}) {
  const [geoData, setGeoData] = useState(null);

  // If selected location is NOT in India or no state, do not render India state overlay at all!
  if (!isIndia || !selectedState) {
    return null;
  }

  useEffect(() => {
    fetch('/india_states_simplified.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load simplified states');
        return res.json();
      })
      .then(data => {
        if (data && Array.isArray(data.features)) {
          setGeoData(data);
        }
      })
      .catch(err => console.warn('Could not load states geojson:', err));
  }, []);

  const normalize = (str) => (str || '').toLowerCase().replace(/[^a-z]/g, '');
  const activeNormalized = normalize(selectedState);

  // Filter geoData to ONLY contain the currently selected state feature to avoid any clutter or overlapping!
  const selectedFeatureCollection = useMemo(() => {
    if (!geoData || !geoData.features || !activeNormalized) return null;

    // Check if it really is one of India's states
    const isIndianState = INDIAN_STATES.some(s => {
      const sNorm = normalize(s.name);
      return sNorm === activeNormalized || activeNormalized.includes(sNorm) || sNorm.includes(activeNormalized);
    });
    if (!isIndianState) return null;

    const matchedFeatures = geoData.features.filter(f => {
      const name = normalize(f.properties?.name);
      return name === activeNormalized || activeNormalized.includes(name) || name.includes(activeNormalized);
    });

    if (matchedFeatures.length === 0) return null;

    return {
      type: "FeatureCollection",
      features: matchedFeatures
    };
  }, [geoData, activeNormalized]);

  if (!selectedFeatureCollection) return null;

  const styleFeature = () => {
    return {
      fillColor: '#0284c7',
      fillOpacity: 0.22,
      color: '#38bdf8',
      weight: 2.5,
      opacity: 0.9,
      dashArray: 'none'
    };
  };

  return (
    <GeoJSON
      key={`state-${selectedState}`}
      data={selectedFeatureCollection}
      style={styleFeature}
    />
  );
}
