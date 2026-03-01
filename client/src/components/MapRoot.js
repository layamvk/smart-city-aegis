import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapContext } from '../context/MapContext';
import MapOverlays from './MapOverlays';

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

// Chennai viewport constants
const CHENNAI_CENTER = [13.0827, 80.2707];
const CHENNAI_ZOOM = 11;
const CHENNAI_BOUNDS = L.latLngBounds(
  L.latLng(12.75, 79.95),   // SW corner — beyond district boundary
  L.latLng(13.35, 80.50)    // NE corner — beyond district boundary
);

const MapRoot = ({ enabled = true, activeZone, onZoneClick, onNodeClick }) => {
  const { mapRef, setMapInstance, containerRef, layersRef } = useMapContext();
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current || !containerRef.current) return;
    initRef.current = true;

    const map = L.map(containerRef.current, {
      center: CHENNAI_CENTER,
      zoom: CHENNAI_ZOOM,
      minZoom: 10,           // never zoom out past district level
      maxZoom: 18,
      maxBounds: CHENNAI_BOUNDS,
      maxBoundsViscosity: 1.0,          // hard stop — cannot pan outside bounds
      zoomControl: false,
      scrollWheelZoom: true,
      dragging: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      touchZoom: true,
    });

    L.tileLayer(TILE_URL, {
      attribution: '&copy; CartoDB',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Force Chennai view explicitly — eliminates any centering drift
    map.setView(CHENNAI_CENTER, CHENNAI_ZOOM, { animate: false });

    mapRef.current = map;

    // CRITICAL: layers must be on map BEFORE setMapInstance so overlays
    // can safely addTo() them on first render.
    Object.values(layersRef.current).forEach(lg => lg.addTo(map));

    setMapInstance(map);

    // Double invalidate: once at mount, once after layout settles
    setTimeout(() => { if (mapRef.current) mapRef.current.invalidateSize(); }, 100);
    setTimeout(() => { if (mapRef.current) mapRef.current.invalidateSize(); }, 600);

    return () => {
      map.remove();
      mapRef.current = null;
      setMapInstance(null);
      initRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync interactivity with enabled prop
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handlers = [
      map.dragging, map.scrollWheelZoom,
      map.doubleClickZoom, map.boxZoom,
      map.keyboard, map.touchZoom,
    ].filter(Boolean);

    handlers.forEach(h => enabled ? h.enable() : h.disable());

    if (map._container) {
      map._container.style.pointerEvents = enabled ? 'auto' : 'none';
    }
  }, [enabled, mapRef]);

  return (
    <div className="map-container" style={{ height: '100%', width: '100%', position: 'absolute', inset: 0 }}>
      <div
        ref={containerRef}
        id="map"
        style={{ height: '100%', width: '100%', position: 'relative' }}
      />
      <MapOverlays activeZone={activeZone} onZoneClick={onZoneClick} onNodeClick={onNodeClick} />
    </div>
  );
};

export default MapRoot;
