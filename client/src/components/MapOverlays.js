import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { useCityEngine } from '../engine/CityEngine';
import { useMapContext } from '../context/MapContext';

// ─── Helpers ────────────────────────────────────────────────────────────────
const mkDotIcon = (color, size = 8) =>
  L.divIcon({
    className: 'map-marker-dot marker-reveal',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};
      border:1px solid rgba(255,255,255,0.4);
      box-shadow:0 0 12px ${color}33;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

// Helper removed

const MapOverlays = ({ activeZone, onZoneClick, onNodeClick }) => {
  const { mapRef, layersRef } = useMapContext();
  const {
    zones, traffic, water, grid, lights,
    emit,
  } = useCityEngine();

  const geoJsonRef = useRef(null);
  const infraRef = useRef({ traffic: null, water: null, power: null, lights: null });
  const mapReadyRef = useRef(false);

  // ── Phase 4 — Force Add Polygons Properly ─────────────────────────────────
  const buildZoneLayer = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const zonesLayer = layersRef.current.zones;

    const zoneKeys = Object.keys(zones || {});
    if (zoneKeys.length === 0) return;

    if (geoJsonRef.current) {
      // Update existing layer style on state change, do not recreate
      geoJsonRef.current.eachLayer(layer => {
        const id = layer.feature?.id || layer.feature?.properties?.id;
        const z = zones?.[id] || {};
        const isActive = id === activeZone;
        const risk = z.riskScore || 0;

        let riskColor = '#00FF64';
        if (risk >= 70) riskColor = '#FF3D3D';
        else if (risk >= 30) riskColor = '#FFA500';

        if (isActive) {
          layer.setStyle({
            color: '#FFFFFF',
            weight: 2.5,
            fillColor: riskColor,
            fillOpacity: 0.25,
            opacity: 1
          });
        } else {
          layer.setStyle({
            color: '#4FD1FF',
            weight: 1.2,
            fillColor: '#4FD1FF',
            fillOpacity: 0,
            opacity: 0.8
          });
        }
      });
      return;
    }

    const geojsonData = {
      type: "FeatureCollection",
      features: zoneKeys.map(k => zones[k].feature).filter(Boolean)
    };

    if (geojsonData.features.length === 0) return;

    geoJsonRef.current = L.geoJSON(geojsonData, {
      style: {
        color: "#4FD1FF",
        weight: 1.2,
        fillColor: '#4FD1FF',
        fillOpacity: 0,
        opacity: 0.8
      },
      onEachFeature: (feature, layer) => {
        const id = feature.id || feature.properties?.id;

        layer.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          console.log("Zone clicked:", id);
          if (onZoneClick) onZoneClick(id, zones?.[id] || {});
          emit('ZONE_SELECTED', { zone: id });
        });

        layer.on("mouseover", () => {
          if (activeZone === id) return;
          layer.setStyle({ weight: 2.5 });
        });

        layer.on("mouseout", () => {
          if (activeZone === id) return; // leave active style
          layer.setStyle({ weight: 1.2, fillOpacity: 0 });
        });

        layer.bindTooltip(`<strong>${id}</strong>`, { sticky: true, className: 'map-tooltip' });
      }
    }).addTo(zonesLayer);

    mapRef.current.fitBounds(geoJsonRef.current.getBounds(), { padding: [20, 20] });
    mapRef.current.invalidateSize();
  }, [mapRef, layersRef, zones, activeZone, onZoneClick, emit]);

  // ── Infrastructure Markers ────────────────────────────────────────────────
  const buildInfraMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const { traffic: tLayer, water: wLayer, grid: gLayer } = layersRef.current;

    // Traffic junctions
    if (!infraRef.current.traffic) infraRef.current.traffic = L.layerGroup().addTo(tLayer);
    infraRef.current.traffic.clearLayers();
    traffic.junctions.forEach(j => {
      const col = j.phase === 'GREEN' ? '#00FF64' : j.phase === 'RED' ? '#FF3D3D' : '#FFBF00';
      const m = L.marker([j.lat, j.lng], { icon: mkDotIcon(col, 6) }).addTo(infraRef.current.traffic);
      m.bindTooltip(`Junction: ${j.id.toUpperCase()}`);
      m.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (onNodeClick) onNodeClick({ type: 'traffic', ...j });
      });
    });

    // Water reservoirs
    if (!infraRef.current.water) infraRef.current.water = L.layerGroup().addTo(wLayer);
    infraRef.current.water.clearLayers();
    water.reservoirs.forEach(r => {
      const m = L.marker([r.lat, r.lng], { icon: mkDotIcon('#3B82F6', 8) }).addTo(infraRef.current.water);
      m.bindTooltip(`Reservoir: ${r.id}`);
      m.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (onNodeClick) onNodeClick({ type: 'water', ...r });
      });
    });

    // Grid substations
    if (!infraRef.current.power) infraRef.current.power = L.layerGroup().addTo(gLayer);
    infraRef.current.power.clearLayers();
    grid.substations.forEach(s => {
      const m = L.marker([s.lat, s.lng], { icon: mkDotIcon('#F59E0B', 8) }).addTo(infraRef.current.power);
      m.bindTooltip(`Substation: ${s.id}`);
      m.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (onNodeClick) onNodeClick({ type: 'grid', ...s });
      });
    });
  }, [mapRef, layersRef, traffic, water, grid, onNodeClick]);

  const buildLightMarkers = useCallback(() => {
    if (!mapRef.current || !lights?.clusters) return;
    if (!infraRef.current.lights) infraRef.current.lights = L.layerGroup().addTo(layersRef.current.incidents);
    infraRef.current.lights.clearLayers();
    lights.clusters.forEach(c => {
      const m = L.marker([c.lat, c.lng], { icon: mkDotIcon('#FFD700', 4) }).addTo(infraRef.current.lights);
      m.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (onNodeClick) onNodeClick({ type: 'lights', ...c });
      });
    });
  }, [mapRef, layersRef, lights, onNodeClick]);

  // Lifecycle
  useEffect(() => {
    const checkReady = setInterval(() => {
      if (mapRef.current) {
        clearInterval(checkReady);
        mapReadyRef.current = true;
        buildZoneLayer();
        buildInfraMarkers();
        buildLightMarkers();
      }
    }, 100);
    return () => clearInterval(checkReady);
  }, [buildZoneLayer, buildInfraMarkers, buildLightMarkers, mapRef]);

  useEffect(() => {
    if (mapReadyRef.current) buildZoneLayer();
  }, [zones, buildZoneLayer]);

  useEffect(() => {
    if (mapReadyRef.current) {
      buildInfraMarkers();
      buildLightMarkers();
    }
  }, [traffic, water, grid, lights, buildInfraMarkers, buildLightMarkers]);

  return null;
};

export default MapOverlays;
