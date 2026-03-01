/**
 * One-time KML → GeoJSON converter (no external deps — uses Node's built-in)
 * Run from client/ directory:  node public/convert.js
 */

const fs = require('fs');
const path = require('path');

const KML_IN = path.join(__dirname, 'chennai-boundary.kml');
const JSON_OUT = path.join(__dirname, 'chennai-boundary.geojson');

const kmlText = fs.readFileSync(KML_IN, 'utf8');
console.log(`[convert] KML read: ${kmlText.length} bytes`);

/* ── Minimal regex-based KML parser (no DOM dep needed in Node 18+) ── */
const features = [];

// Extract all Placemarks
const pmRegex = /<Placemark>([\s\S]*?)<\/Placemark>/g;
let pmMatch;

while ((pmMatch = pmRegex.exec(kmlText)) !== null) {
    const pmBody = pmMatch[1];

    // Name
    const nameMatch = /<name>([\s\S]*?)<\/name>/.exec(pmBody);
    const name = nameMatch ? nameMatch[1].trim() : `Zone-${features.length}`;

    // All coordinate blocks inside this placemark
    const coordRegex = /<coordinates>([\s\S]*?)<\/coordinates>/g;
    let coordMatch;

    while ((coordMatch = coordRegex.exec(pmBody)) !== null) {
        const raw = coordMatch[1].trim();
        const points = raw.split(/\s+/).filter(s => s.includes(','));
        const ring = points
            .map(p => { const [lng, lat] = p.split(',').map(Number); return [lng, lat]; })
            .filter(([lng, lat]) => !isNaN(lng) && !isNaN(lat) && isFinite(lng) && isFinite(lat));

        if (ring.length < 3) continue;

        // Close ring if needed
        if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
            ring.push([ring[0][0], ring[0][1]]);
        }

        features.push({
            type: 'Feature',
            id: name,
            properties: { name, id: name },
            geometry: { type: 'Polygon', coordinates: [ring] }
        });
    }
}

const geojson = { type: 'FeatureCollection', features };
fs.writeFileSync(JSON_OUT, JSON.stringify(geojson, null, 2), 'utf8');

const outSize = fs.statSync(JSON_OUT).size;
console.log(`[convert] ✅ ${features.length} features → ${JSON_OUT} (${outSize} bytes)`);
