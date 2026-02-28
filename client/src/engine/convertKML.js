import * as toGeoJSON from "@tmcw/togeojson";

export function convertKMLString(kmlText) {
    try {
        const parser = new DOMParser();
        const kml = parser.parseFromString(kmlText, "text/xml");
        const geojson = toGeoJSON.kml(kml);

        if (!geojson || !geojson.features) {
            console.warn("KML produced no features");
            return { type: "FeatureCollection", features: [] };
        }

        // Keep all valid features from KML (boundaries, points, etc)
        geojson.features = geojson.features.filter(f => f && f.geometry);

        console.log(`[KML] Extracted ${geojson.features.length} features`);
        return geojson;
    } catch (e) {
        console.error("KML Parse error", e);
        return { type: "FeatureCollection", features: [] };
    }
}
