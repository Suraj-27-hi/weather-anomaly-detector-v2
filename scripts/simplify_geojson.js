import fs from 'fs';

console.log("Reading raw geojson...");
const raw = JSON.parse(fs.readFileSync('src/data/india_states.json', 'utf8'));

console.log("Features count:", raw.features.length);
const stateNames = raw.features.map(f => f.properties.NAME_1 || f.properties.ST_NM || f.properties.name);
console.log("States:", stateNames);

// Let's create a simplified version keeping 1 point in every 8 or Douglas-Peucker style / rounding coordinates to 3 decimals (~100m accuracy)
function simplifyCoords(coords, step = 5) {
  if (typeof coords[0] === 'number') {
    return [Math.round(coords[0] * 1000) / 1000, Math.round(coords[1] * 1000) / 1000];
  }
  if (Array.isArray(coords[0]) && typeof coords[0][0] === 'number') {
    // Array of points: ring
    const res = [];
    for (let i = 0; i < coords.length; i++) {
      if (i === 0 || i === coords.length - 1 || i % step === 0) {
        res.push([Math.round(coords[i][0] * 1000) / 1000, Math.round(coords[i][1] * 1000) / 1000]);
      }
    }
    if (res.length < 4 && coords.length >= 4) {
      return coords.map(c => [Math.round(c[0] * 1000) / 1000, Math.round(c[1] * 1000) / 1000]);
    }
    return res;
  }
  return coords.map(c => simplifyCoords(c, step));
}

const simplifiedFeatures = raw.features.map(f => {
  return {
    type: "Feature",
    properties: {
      name: f.properties.NAME_1 || f.properties.ST_NM || f.properties.name || "Unknown",
      code: f.properties.HASC_1 || f.properties.ID_1 || ""
    },
    geometry: {
      type: f.geometry.type,
      coordinates: simplifyCoords(f.geometry.coordinates, 10)
    }
  };
});

const output = {
  type: "FeatureCollection",
  features: simplifiedFeatures
};

fs.writeFileSync('public/india_states_simplified.json', JSON.stringify(output));
const stats = fs.statSync('public/india_states_simplified.json');
console.log("Simplified GeoJSON saved to public/india_states_simplified.json! Size:", Math.round(stats.size / 1024), "KB");
