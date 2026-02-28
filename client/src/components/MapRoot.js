import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapContext } from '../context/MapContext';
import MapOverlays from './MapOverlays';

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

const MapRoot = ({ enabled = true, activeZone, onZoneClick, onNodeClick }) => {
  const { mapRef, setMapInstance, containerRef, layersRef } = useMapContext();
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current || !containerRef.current) return;
    initRef.current = true;

    // Use specific ID as requested
    const map = L.map(containerRef.current, {
      center: [13.0827, 80.2707],
      zoom: 11,
      zoomControl: false, // Adding custom position below
      scrollWheelZoom: true,
      dragging: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      touchZoom: true,
    });

    L.tileLayer(TILE_URL, {
      attribution: '&copy; CartoDB',
      maxZoom: 19
    }).addTo(map);

    // Zoom control topright as requested
    L.control.zoom({ position: 'topright' }).addTo(map);

    mapRef.current = map;
    setMapInstance(map);

    // Add layer groups to map once
    Object.values(layersRef.current).forEach(lg => lg.addTo(map));

    // Force size validation
    setTimeout(() => {
      map.invalidateSize();
    }, 300);

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
      map.keyboard, map.touchZoom
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
