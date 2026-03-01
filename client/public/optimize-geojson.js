/**
 * Decimate the GeoJSON ring coordinates to reduce file size for production.
 * Keeps 1 in every N points. Also rounds coordinates to 5 decimal places.
 * Run: node public/optimize-geojson.js
 */
const fs = require('fs');
const path = require('path');

const IN = path.join(__dirname, 'chennai-boundary.geojson');
const OUT = path.join(__dirname, 'chennai-boundary.geojson'); // overwrite

const raw = JSON.parse(fs.readFileSync(IN, 'utf8'));

const STEP = 8;   // keep 1 in every 8 points
const PREC = 5;   // 5 decimal places ≈ ~1m accuracy

function decimateRing(ring) {
    if (ring.length <= 6) return ring;
    const kept = ring.filter((_, i) => i % STEP === 0 || i === ring.length - 1);
    // ensure ring is still closed
    if (kept[0][0] !== kept[kept.length - 1][0] || kept[0][1] !== kept[kept.length - 1][1]) {
        kept.push([kept[0][0], kept[0][1]]);
    }
    return kept.map(([lng, lat]) => [
        parseFloat(lng.toFixed(PREC)),
        parseFloat(lat.toFixed(PREC))
    ]);
}

const optimized = {
    type: 'FeatureCollection',
    features: raw.features.map(f => ({
        ...f,
        geometry: {
            ...f.geometry,
            coordinates: f.geometry.coordinates.map(decimateRing)
        }
    }))
};

const outStr = JSON.stringify(optimized);
fs.writeFileSync(OUT, outStr, 'utf8');
const outSize = fs.statSync(OUT).size;
console.log(`[optimize] ✅ ${optimized.features.length} features → ${OUT}`);
console.log(`[optimize] Size: ${(outSize / 1024).toFixed(1)} KB`);
optimized.features.forEach(f => {
    console.log(`  ${f.properties.name}: ${f.geometry.coordinates[0].length} pts`);
});
