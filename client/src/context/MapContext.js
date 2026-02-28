import React, { createContext, useContext, useMemo, useRef } from 'react';
import L from 'leaflet';

const MapContext = createContext(null);

export const useMapContext = () => {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error('useMapContext must be used within MapProvider');
  return ctx;
};

export const MapProvider = ({ children }) => {
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
      mapRef,
      containerRef,
      layersRef,
    }),
    []
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

