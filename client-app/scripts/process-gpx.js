// Pre-processes Boston_Marathon.gpx into a compact JSON suitable for the elevation chart.
// Output: public/boston-marathon-elevation.json
// Format: [[lat, lon, eleFt, distMi], ...]
// Run: node scripts/process-gpx.js

const fs = require('fs');
const path = require('path');

const gpxPath = path.join(__dirname, '..', 'public', 'Boston_Marathon.gpx');
const outPath = path.join(__dirname, '..', 'public', 'boston-marathon-elevation.json');

const gpxText = fs.readFileSync(gpxPath, 'utf8');

// Parse trackpoints with regex (GPX is regular enough)
const trkptRegex = /<trkpt lat="([^"]+)" lon="([^"]+)"[^>]*>[\s\S]*?<ele>([^<]+)<\/ele>/g;
const metersToFeet = 3.28084;
const rawPoints = [];
let match;
while ((match = trkptRegex.exec(gpxText)) !== null) {
  rawPoints.push({
    lat: parseFloat(match[1]),
    lon: parseFloat(match[2]),
    ele: parseFloat(match[3]) * metersToFeet
  });
}
console.log(`Parsed ${rawPoints.length} trackpoints`);

// Compute cumulative distances (Haversine)
function calcDistanceMiles(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 0.621371;
}

let totalDist = 0;
const points = rawPoints.map((p, i) => {
  if (i > 0) totalDist += calcDistanceMiles(rawPoints[i - 1].lat, rawPoints[i - 1].lon, p.lat, p.lon);
  return { lat: p.lat, lon: p.lon, ele: p.ele, dist: totalDist };
});

// Smooth elevation with sliding window
const windowSize = Math.min(50, Math.floor(points.length / 20) || 1);
const smoothed = points.map((p, i) => {
  const start = Math.max(0, i - windowSize);
  const end = Math.min(points.length, i + windowSize + 1);
  let sum = 0;
  for (let j = start; j < end; j++) sum += points[j].ele;
  return { ...p, ele: sum / (end - start) };
});

// Downsample to ~600 points for chart performance
const targetPoints = 600;
const sampleInterval = Math.max(1, Math.floor(smoothed.length / targetPoints));
const result = [];
for (let i = 0; i < smoothed.length; i += sampleInterval) {
  const p = smoothed[i];
  result.push([
    Math.round(p.lat * 100000) / 100000,
    Math.round(p.lon * 100000) / 100000,
    Math.round(p.ele * 10) / 10,
    Math.round(p.dist * 10000) / 10000
  ]);
}
// Ensure last point is included
const last = smoothed[smoothed.length - 1];
if (result[result.length - 1][3] !== Math.round(last.dist * 10000) / 10000) {
  result.push([
    Math.round(last.lat * 100000) / 100000,
    Math.round(last.lon * 100000) / 100000,
    Math.round(last.ele * 10) / 10,
    Math.round(last.dist * 10000) / 10000
  ]);
}

fs.writeFileSync(outPath, JSON.stringify(result));
const sizeKb = Math.round(fs.statSync(outPath).size / 1024);
console.log(`Wrote ${result.length} points to boston-marathon-elevation.json (${sizeKb} KB)`);
