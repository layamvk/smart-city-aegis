import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../components/CommandCenter.css';
import ZoneControls from './ZoneControls';

// Chennai bounding box
const chennaiBounds = [
  [12.9, 80.1],
  [13.25, 80.35],
];

const ZoneMap = ({ zones }) => {
  return (
    <section
      style={{
        gridArea: 'center',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
      className="command-center-panel"
    >
      <div className="command-center-panel-header">
        <div className="command-center-panel-title">Infrastructure Zone Map</div>
      </div>
      <div className="command-center-panel-body" style={{ padding: 0 }}>
        <MapContainer
          center={[13.0827, 80.2707]}
          zoom={12}
          minZoom={11}
          maxZoom={17}
          maxBounds={chennaiBounds}
          maxBoundsViscosity={1.0}
          scrollWheelZoom={true}
          whenCreated={(map) => {
            map.flyTo([13.0827, 80.2707], 12);
          }}
          style={{ height: 320, width: '100%', borderRadius: '0 0 12px 12px' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {zones.map((zone, index) => {
            const { lat, lng } = zone;

            if (
              typeof lat !== 'number' ||
              typeof lng !== 'number' ||
              lat < 12.9 ||
              lat > 13.25 ||
              lng < 80.1 ||
              lng > 80.35
            ) {
              return null;
            }

            return (
              <Marker key={index} position={[lat, lng]}>
                <Popup>
                  <div style={{ fontSize: 13 }}>
                    <div style={{ fontWeight: 600 }}>{zone.name}</div>
                    <div>Zone: {zone.zone}</div>
                    <div>Status: {zone.status}</div>
                    <div>Risk: {zone.threat}</div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        <ZoneControls />
      </div>
    </section>
  );
};

export default ZoneMap;
