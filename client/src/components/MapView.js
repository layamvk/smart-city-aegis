import React, { useEffect, useRef, memo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapResizer = () => {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => {
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    };

    invalidate();
    window.addEventListener('resize', invalidate);
    return () => {
      window.removeEventListener('resize', invalidate);
    };
  }, [map]);

  return null;
};

const MapView = () => {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
    }
  }, []);

  return (
    <div
      style={{
        height: '100%',
        minHeight: '500px',
        width: '100%',
        position: 'relative',
        backgroundColor: '#0b0b0b',
      }}
    >
      <MapContainer
        center={[13.0827, 80.2707]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          attribution="© OpenStreetMap contributors"
        />
        <MapResizer />
      </MapContainer>
    </div>
  );
};

export default memo(MapView);
