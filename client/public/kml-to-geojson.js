/**
 * One-time KML → GeoJSON converter
 * Run from project root:  node client/public/kml-to-geojson.js
 *
 * Output: client/public/chennai-boundary.geojson
 */

const fs = require('fs');
const path = require('path');
const { DOMParser } = require('@xmldom/xmldom');

const KML_IN = path.join(__dirname, 'chennai-boundary.kml');
const JSON_OUT = path.join(__dirname, 'chennai-boundary.geojson');

const kmlText = fs.readFileSync(KML_IN, 'utf8');
console.log(`[convert] KML read: ${kmlText.length} bytes`);

const parser = new DOMParser();
const doc = parser.parseFromString(kmlText, 'text/xml');
const placemarks = Array.from(doc.getElementsByTagName('Placemark'));
console.log(`[convert] Found ${placemarks.length} placemarks`);

const features = [];

placemarks.forEach((pm, pi) => {
    const nameEl = pm.getElementsByTagName('name')[0];
    const name = nameEl ? nameEl.textContent.trim() : `Zone-${pi}`;

    const coordEls = Array.from(pm.getElementsByTagName('coordinates'));
    coordEls.forEach(coordEl => {
        const raw = coordEl.textContent.trim();
        const points = raw.split(/\s+/).filter(s => s.includes(','));
        const ring = points.map(p => {
            const parts = p.split(',');
            return [parseFloat(parts[0]), parseFloat(parts[1])];
        }).filter(([lng, lat]) => !isNaN(lng) && !isNaN(lat));

        if (ring.length < 3) return;
        if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
            ring.push([ring[0][0], ring[0][1]]);
        }

        features.push({
            type: 'Feature',
            id: name,
            properties: { name, id: name },
            geometry: { type: 'Polygon', coordinates: [ring] }
        });
    });
});

const geojson = { type: 'FeatureCollection', features };
fs.writeFileSync(JSON_OUT, JSON.stringify(geojson), 'utf8');
console.log(`[convert] ✅ Written ${features.length} features → ${JSON_OUT}`);
