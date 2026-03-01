const fs = require('fs');
const { DOMParser } = require('@xmldom/xmldom');
const toGeoJSON = require('@tmcw/togeojson');

try {
    const kmlText = fs.readFileSync('c:/Users/Administrator/Downloads/0f0ccbda-9485-4964-b3b1-6ce53af82bbb.kml', 'utf8');
    const parser = new DOMParser();
    const kml = parser.parseFromString(kmlText, 'text/xml');
    const geojson = toGeoJSON.kml(kml);

    console.log('Total features:', geojson.features.length);
    if (geojson.features.length > 0) {
        const first = geojson.features[0];
        console.log('First feature properties:', JSON.stringify(first.properties, null, 2));
        console.log('First feature geometry type:', first.geometry.type);
    }
} catch (e) {
    console.error('Error:', e);
}
