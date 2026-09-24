import React, { useEffect, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMap, 
  useMapEvents 
} from 'react-leaflet';
import L from 'leaflet';
import RadarLayer from './RadarLayer';
import { Target, AlertTriangle } from 'lucide-react';

// Target Pin Marker matching Image 2 & Image 4 (circular white border with bright blue center)
function createCustomPin() {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position:relative;width:28px;height:28px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:24px;height:24px;border-radius:50%;background:#0284c7;border:3px solid #ffffff;box-shadow:0 0 10px rgba(0,0,0,0.6), 0 0 14px rgba(2,132,199,0.8);display:flex;align-items:center;justify-content:center;">
          <div style="width:6px;height:6px;border-radius:50%;background:#ffffff;"></div>
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
}

// Controller to smoothly pan & zoom ONLY when target coordinates actually change
function ChangeView({ lat, lon, zoom }) {
  const map = useMap();
  const prevRef = useRef({ lat: null, lon: null });

  useEffect(() => {
    if (lat !== prevRef.current.lat || lon !== prevRef.current.lon) {
      prevRef.current = { lat, lon };
      map.flyTo([lat, lon], zoom, {
        duration: 0.8,
        easeLinearity: 0.25
      });
    }
  }, [lat, lon, zoom, map]);
  return null;
}

// Map resizer to ensure tiles render immediately without blank gray canvas
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);
  return null;
}

// Click listener on Map for reverse geocoding with normalized coordinates
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        // Normalize longitude between -180 and 180 to avoid wrapping glitches
        const normalizedLng = ((((e.latlng.lng + 180) % 360) + 360) % 360) - 180;
        const normalizedLat = Math.max(-85, Math.min(85, e.latlng.lat));
        onMapClick(normalizedLat, normalizedLng);
      }
    }
  });
  return null;
}

export default function SatelliteMap({
  currentLocation,
  currentWeather,
  anomalyData,
  mapMode = 'satellite',
  onSelectState,
  onMapClick,
  onLocateMe,
  radarOpacity = 0.75
}) {
  const lat = currentLocation.lat || 12.9716;
  const lon = currentLocation.lon || 77.5946;
  const center = [lat, lon];
  const severity = anomalyData?.hasAnomaly ? (anomalyData.severity || 'moderate') : 'normal';

  // Strict check: ONLY India if country says India AND coords fall within India boundaries AND state is present
  const isIndia = Boolean(
    (currentLocation.country || '').toLowerCase().includes('india') &&
    lat >= 6.5 && lat <= 37.5 &&
    lon >= 68.0 && lon <= 97.5 &&
    currentLocation.state
  );

  return (
    <div className="relative w-full h-full min-h-[520px] rounded-2xl overflow-hidden border border-[#142a4a] shadow-2xl flex-1 flex flex-col bg-[#040a16]">
      <MapContainer
        center={center}
        zoom={isIndia ? 5 : 4}
        minZoom={2}
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={true}
        style={{ height: '100%', minHeight: '520px', width: '100%' }}
        className="w-full h-full min-h-[520px] z-10"
      >
        <MapResizer />
        <ChangeView lat={lat} lon={lon} zoom={isIndia ? 5 : 4} />
        <MapClickHandler onMapClick={onMapClick} />

        {/* 100% Free / Open Basemaps without any paid subscription or API key */}
        {mapMode === 'satellite' ? (
          /* Satellite Imagery: ArcGIS World Imagery */
          <TileLayer
            attribution='&copy; Esri World Imagery'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />
        ) : (
          /* Radar / Rainfall: OpenStreetMap Basemap */
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}

        {/* Selected Location Marker with popup */}
        <Marker position={center} icon={createCustomPin()}>
          <Popup>
            <div className="font-mono text-xs text-white p-1">
              <div className="font-bold text-sky-400 text-sm">{currentLocation.name}</div>
              {currentLocation.state && <div className="text-slate-300">{currentLocation.state}, {currentLocation.country}</div>}
              <div className="mt-1 pt-1 border-t border-slate-700">
                Temp: <b>{currentWeather?.current?.temperature}°C</b>
              </div>
              <div className="text-slate-400">
                Rainfall: <b>{currentWeather?.current?.rainfall1h} mm</b>
              </div>
              {anomalyData?.hasAnomaly && (
                <div className="mt-1 font-bold text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {anomalyData.severity.toUpperCase()} ANOMALY
                </div>
              )}
            </div>
          </Popup>
        </Marker>

        {/* Radar layer (RainViewer Free Doppler Radar matching Image 4) */}
        {mapMode === 'radar' && (
          <RadarLayer opacity={radarOpacity} />
        )}
      </MapContainer>

      {/* Top-Right Crosshair / Locate Me Button matching Image 2 & Image 4 (◎) */}
      <button
        onClick={onLocateMe}
        className="absolute top-3 right-3 z-[1000] w-10 h-10 rounded-lg bg-[#07152b]/90 border border-slate-700/80 text-white hover:text-sky-300 flex items-center justify-center shadow-xl backdrop-blur-md transition-all cursor-pointer hover:border-sky-400"
        title="Locate Device Position"
      >
        <Target className="w-5 h-5 text-white" />
      </button>

    </div>
  );
}
