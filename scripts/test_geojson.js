import fs from 'fs';

try {
  const content = fs.readFileSync('public/india_states_simplified.json', 'utf8');
  const d = JSON.parse(content);
  console.log("SUCCESS! Feature count:", d.features.length);
  console.log("First feature name:", d.features[0].properties.name);
  console.log("Geometry type:", d.features[0].geometry.type);
} catch (err) {
  console.error("ERROR parsing geojson:", err);
}
