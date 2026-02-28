import * as toGeoJSON from "@tmcw/togeojson";

export function convertKMLString(kmlText) {
    const parser = new DOMParser();
    const kml = parser.parseFromString(kmlText, "text/xml");
    const geojson = toGeoJSON.kml(kml);

    // Validate output
    if (!geojson || geojson.type !== "FeatureCollection") {
        console.warn("Invalid GeoJSON output from KML");
        return { type: "FeatureCollection", features: [] };
    }

    geojson.features = geojson.features.filter(f => {
        if (!f || !f.geometry || !f.geometry.type || !f.geometry.coordinates) return false;
        if (f.geometry.type !== "Polygon" && f.geometry.type !== "MultiPolygon") return false;
        return true;
    });

    return geojson;
}
