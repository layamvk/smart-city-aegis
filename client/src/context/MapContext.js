import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import L from 'leaflet';

const MapContext = createContext(null);

export const useMapContext = () => {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error('useMapContext must be used within MapProvider');
  return ctx;
};

export const MapProvider = ({ children }) => {
  const [mapInstance, setMapInstance] = useState(null);
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  const layersRef = useRef(null);
  if (!layersRef.current) {
    layersRef.current = {
      zones: L.layerGroup(),
      traffic: L.layerGroup(),
      water: L.layerGroup(),
      grid: L.layerGroup(),
      incidents: L.layerGroup(),
    };
  }

  const value = useMemo(
    () => ({
      mapInstance,
      setMapInstance,
      mapRef,
      containerRef,
      layersRef,
    }),
    [mapInstance]
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

