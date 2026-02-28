import * as toGeoJSON from "@tmcw/togeojson";

/**
 * Flattens a GeoJSON feature that may have a GeometryCollection
 * into one or more features with simple geometry types.
 * Leaflet cannot render GeometryCollection natively.
 */
function flattenFeature(feature) {
    if (!feature || !feature.geometry) return [];
    const { geometry, properties, id } = feature;

    if (geometry.type !== "GeometryCollection") {
        return [feature];
    }

    // GeometryCollection → one feature per geometry
    return (geometry.geometries || [])
        .filter(g => g && g.type && g.coordinates)
        .map((g, i) => ({
            type: "Feature",
            id: id ? `${id}_${i}` : undefined,
            properties: { ...properties },
            geometry: g,
        }));
}

export function convertKMLString(kmlText) {
    try {
        const parser = new DOMParser();
        const kml = parser.parseFromString(kmlText, "text/xml");
        const geojson = toGeoJSON.kml(kml);

        if (!geojson || !geojson.features) {
            console.warn("[KML] No features found in KML");
            return { type: "FeatureCollection", features: [] };
        }

        // Flatten GeometryCollections so Leaflet can render them
        const flattened = [];
        geojson.features.forEach(f => {
            flattenFeature(f).forEach(flat => flattened.push(flat));
        });

        // Filter to renderable types only
        const validTypes = new Set(["Polygon", "MultiPolygon", "LineString", "MultiLineString", "Point"]);
        const valid = flattened.filter(f => f.geometry && validTypes.has(f.geometry.type));

        console.log(`[KML] Total features after flattening: ${valid.length} (from ${geojson.features.length} originals)`);
        return { type: "FeatureCollection", features: valid };
    } catch (e) {
        console.error("[KML] Parse error:", e);
        return { type: "FeatureCollection", features: [] };
    }
}
