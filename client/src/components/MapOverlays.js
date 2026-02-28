import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { useCityEngine } from '../engine/CityEngine';
import { useMapContext } from '../context/MapContext';

// ─── Helpers ────────────────────────────────────────────────────────────────
const mkDotIcon = (color, size = 10, shadow = true) =>
  L.divIcon({
    className: 'map-marker-dot marker-reveal',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};
      border:1.5px solid #FFFFFF;
      ${shadow ? `box-shadow: 0 0 12px ${color}, 0 0 24px ${color}66;` : ''}
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

const MapOverlays = ({ activeZone, onZoneClick, onNodeClick }) => {
  const { mapInstance, layersRef } = useMapContext();
  const {
    zones, traffic, water, grid, lights,
    emit,
  } = useCityEngine();

  const geoJsonRef = useRef(null);

  // ── Zones Layer ──────────────────────────────────────────────────────────
  const buildZoneLayer = useCallback(() => {
    if (!mapInstance || !layersRef.current) return;
    const zonesLayer = layersRef.current.zones;

    const zoneKeys = Object.keys(zones || {});

    // Total clear to ensure no ghosting and fresh data
    zonesLayer.clearLayers();
    geoJsonRef.current = null;

    if (zoneKeys.length === 0) return;

    const geojsonData = {
      type: "FeatureCollection",
      features: zoneKeys.map(k => zones[k].feature).filter(Boolean)
    };

    if (geojsonData.features.length === 0) return;

    geoJsonRef.current = L.geoJSON(geojsonData, {
      style: (feature) => {
        const id = feature.id || feature.properties?.id || feature.properties?.name;
        const isActive = id === activeZone;
        const z = zones[id] || {};
        const risk = z.riskScore || 0;

        let riskColor = '#00FF64';
        if (risk >= 70) riskColor = '#FF3D3D';
        else if (risk >= 30) riskColor = '#FFA500';

        const isPoly = JSON.stringify(feature.geometry).includes('Polygon');

        return {
          color: isActive ? "#FFFFFF" : "#00E5FF",
          weight: isActive ? 4 : 1.5,
          fillColor: isActive ? riskColor : "#00E5FF",
          fillOpacity: isPoly ? (isActive ? 0.35 : 0.05) : 0,
          opacity: 0.85
        };
      },
      onEachFeature: (feature, layer) => {
        const id = feature.id || feature.properties?.id || feature.properties?.name;

        layer.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          if (onZoneClick) onZoneClick(id, zones?.[id] || {});
          emit('ZONE_SELECTED', { zone: id });
        });

        layer.on("mouseover", () => {
          if (activeZone === id) return;
          layer.setStyle({ weight: 3, opacity: 1, color: '#FFFFFF' });
        });

        layer.on("mouseout", () => {
          if (activeZone === id) return;
          layer.setStyle({ weight: 1.5, opacity: 0.85, color: '#00E5FF' });
        });

        layer.bindTooltip(`<strong>${id}</strong>`, { sticky: true, className: 'map-tooltip' });
      }
    }).addTo(zonesLayer);

    // Fit view on first data load
    if (mapInstance && geoJsonRef.current) {
      const bounds = geoJsonRef.current.getBounds();
      if (bounds.isValid()) {
        mapInstance.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [mapInstance, layersRef, zones, activeZone, onZoneClick, emit]);

  // ── Infrastructure Markers ────────────────────────────────────────────────
  const buildInfraMarkers = useCallback(() => {
    if (!mapInstance || !layersRef.current) return;
    const { traffic: tLayer, water: wLayer, grid: gLayer, incidents: lLayer } = layersRef.current;

    // 1. Traffic Junctions
    tLayer.clearLayers();
    traffic.junctions.forEach(j => {
      const col = j.phase === 'GREEN' ? '#00FF64' : j.phase === 'RED' ? '#FF3D3D' : '#FFD600';
      const m = L.marker([j.lat, j.lng], { icon: mkDotIcon(col, 10) }).addTo(tLayer);
      m.on('click', () => onNodeClick && onNodeClick({ type: 'traffic', ...j }));
    });

    // 2. Water Infrastructure (Pump Stations + Reservoirs + Valves)
    wLayer.clearLayers();
    water.reservoirs.forEach(r => {
      L.marker([r.lat, r.lng], { icon: mkDotIcon('#00E5FF', 14) }).addTo(wLayer)
        .on('click', () => onNodeClick && onNodeClick({ type: 'water', ...r }));
    });
    water.pumpStations.forEach(p => {
      L.marker([p.lat, p.lng], { icon: mkDotIcon('#0091FF', 10, false) }).addTo(wLayer)
        .on('click', () => onNodeClick && onNodeClick({ type: 'water', ...p }));
    });
    water.valves.forEach(v => {
      L.marker([v.lat, v.lng], { icon: mkDotIcon('#00D1FF', 8, false) }).addTo(wLayer)
        .on('click', () => onNodeClick && onNodeClick({ type: 'water', ...v }));
    });

    // 3. Electricity Grid (Substations + Feeders)
    gLayer.clearLayers();
    grid.substations.forEach(s => {
      L.marker([s.lat, s.lng], { icon: mkDotIcon('#FF8C00', 14) }).addTo(gLayer)
        .on('click', () => onNodeClick && onNodeClick({ type: 'grid', ...s }));
    });
    // Add point markers for feeders if they have coordinates (they usually don't in mock, but let's check)
    if (grid.feeders) {
      // Feeders in mock don't have coords, but let's interpolate or skip
    }

    // 4. Street Lights (Clusters)
    lLayer.clearLayers();
    if (lights?.clusters) {
      lights.clusters.forEach(c => {
        L.marker([c.lat, c.lng], { icon: mkDotIcon('#FFEA00', 6, false) }).addTo(lLayer)
          .on('click', () => onNodeClick && onNodeClick({ type: 'lights', ...c }));
      });
    }

  }, [mapInstance, layersRef, traffic, water, grid, lights, onNodeClick]);

  // Main Sync Effect
  useEffect(() => {
    if (mapInstance) {
      buildZoneLayer();
      buildInfraMarkers();
    }
  }, [mapInstance, zones, traffic, water, grid, lights, buildZoneLayer, buildInfraMarkers]);

  return null;
};

export default MapOverlays;
