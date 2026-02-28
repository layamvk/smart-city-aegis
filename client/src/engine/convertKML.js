/**
 * Direct KML parser — does NOT use @tmcw/togeojson.
 * Reads <coordinates> from all <Placemark> elements directly.
 * This avoids the GeometryCollection issue where togeojson wraps
 * MultiGeometry in a GeometryCollection that Leaflet cannot render.
 */
export function convertKMLString(kmlText) {
    try {
        const parser = new DOMParser();
        const kmlDoc = parser.parseFromString(kmlText, 'text/xml');

        const placemarks = Array.from(kmlDoc.querySelectorAll('Placemark'));
        console.log(`[KML] Found ${placemarks.length} Placemarks`);

        const features = [];

        placemarks.forEach((pm, pi) => {
            const name = pm.querySelector('name')?.textContent?.trim() || `Zone-${pi}`;
            const coordEls = Array.from(pm.querySelectorAll('coordinates'));

            coordEls.forEach((coordEl, ci) => {
                const raw = coordEl.textContent.trim();
                // KML coordinates are "lng,lat,alt" space-separated
                const points = raw.split(/\s+/).filter(s => s.includes(','));
                const ring = points.map(p => {
                    const parts = p.split(',');
                    const lng = parseFloat(parts[0]);
                    const lat = parseFloat(parts[1]);
                    return [lng, lat]; // GeoJSON order: [lng, lat]
                }).filter(([lng, lat]) => !isNaN(lng) && !isNaN(lat) && isFinite(lng) && isFinite(lat));

                if (ring.length < 3) return;

                // Close the ring if not already closed
                if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
                    ring.push([ring[0][0], ring[0][1]]);
                }

                features.push({
                    type: 'Feature',
                    id: name,
                    properties: { name, id: name },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [ring],
                    },
                });
            });
        });

        console.log(`[KML] Extracted ${features.length} polygon features from ${placemarks.length} placemarks`);
        return { type: 'FeatureCollection', features };
    } catch (e) {
        console.error('[KML] Parse error:', e);
        return { type: 'FeatureCollection', features: [] };
    }
}
