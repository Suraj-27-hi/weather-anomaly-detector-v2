const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

const geoCache = new Map();

export async function searchLocations(query) {
  if (!query || query.trim().length < 2) return [];

  const trimmed = query.trim();
  if (geoCache.has(`search:${trimmed}`)) {
    return geoCache.get(`search:${trimmed}`);
  }

  try {
    const url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(trimmed)}&addressdetails=1&limit=6`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en'
      }
    });

    if (!res.ok) throw new Error(`Nominatim returned ${res.status}`);
    const data = await res.json();

    const results = data.map(item => {
      const addr = item.address || {};
      const cityName = addr.city || addr.town || addr.municipality || addr.village || addr.county || item.name;
      const stateName = addr.state || addr.province || '';
      const countryName = addr.country || '';

      return {
        id: item.place_id,
        name: cityName,
        state: stateName,
        country: countryName,
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        type: item.type
      };
    });

    geoCache.set(`search:${trimmed}`, results);
    return results;
  } catch (err) {
    console.warn('Geocoding search failed:', err);
    return [];
  }
}

export async function reverseGeocode(lat, lon) {
  const key = `rev:${lat.toFixed(3)},${lon.toFixed(3)}`;
  if (geoCache.has(key)) {
    return geoCache.get(key);
  }

  try {
    const url = `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en'
      }
    });

    if (!res.ok) throw new Error(`Reverse geocode error: ${res.status}`);
    const data = await res.json();
    const addr = data.address || {};

    const result = {
      name: addr.city || addr.town || addr.village || addr.suburb || addr.county || data.name || 'Custom Coordinates',
      state: addr.state || addr.province || '',
      country: addr.country || '',
      displayName: data.display_name,
      lat,
      lon
    };

    geoCache.set(key, result);
    return result;
  } catch (err) {
    console.warn('Reverse geocode failed:', err);
    return {
      name: `Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
      state: '',
      country: '',
      displayName: `${lat.toFixed(4)} N, ${lon.toFixed(4)} E`,
      lat,
      lon
    };
  }
}
