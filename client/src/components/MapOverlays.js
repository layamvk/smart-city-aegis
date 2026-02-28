import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useCityEngine } from '../engine/CityEngine';
import { useMapContext } from '../context/MapContext';

// ─── Icon Factory ────────────────────────────────────────────────────────────
function dot(color, size) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:1.5px solid rgba(255,255,255,0.8);
      box-shadow:0 0 10px ${color}99;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// ─── Main Component ──────────────────────────────────────────────────────────
const MapOverlays = ({ activeZone, onZoneClick, onNodeClick }) => {
  const { mapInstance, layersRef } = useMapContext();
  const { zones, traffic, water, grid, lights, emit } = useCityEngine();

  // Store the last rendered geoJSON layer so we can replace it
  const zoneLayerRef = useRef(null);
  const prevZoneCountRef = useRef(0);

  // ── 1. Render Ward Boundaries ─────────────────────────────────────────────
  useEffect(() => {
    if (!mapInstance || !layersRef.current) return;

    const zonesLayer = layersRef.current.zones;
    const zoneKeys = Object.keys(zones || {});

    // Clear previous layer completely
    if (zoneLayerRef.current) {
      zonesLayer.removeLayer(zoneLayerRef.current);
      zoneLayerRef.current = null;
    }

    if (zoneKeys.length === 0) return;

    const features = zoneKeys
      .map(k => zones[k]?.feature)
      .filter(f => f && f.geometry);

    if (features.length === 0) return;

    const geojson = { type: 'FeatureCollection', features };

    zoneLayerRef.current = L.geoJSON(geojson, {
      style: feature => {
        const id = feature.id || feature.properties?.id || feature.properties?.name;
        const isActive = id === activeZone;
        const isPolygon = feature.geometry?.type?.includes('Polygon');
        return {
          color: isActive ? '#FFFFFF' : '#00E5FF',
          weight: isActive ? 3.5 : 1.5,
          opacity: isActive ? 1 : 0.85,
          fillColor: '#00E5FF',
          fillOpacity: isPolygon ? (isActive ? 0.3 : 0.05) : 0,
        };
      },
      onEachFeature: (feature, layer) => {
        const id = feature.id || feature.properties?.id || feature.properties?.name;

        layer.on('click', e => {
          L.DomEvent.stopPropagation(e);
          if (onZoneClick) onZoneClick(id, zones[id] || {});
          emit('ZONE_SELECTED', { zone: id });
        });

        layer.on('mouseover', () => {
          if (id === activeZone) return;
          layer.setStyle({ weight: 3, color: '#FFFFFF', opacity: 1 });
        });
        layer.on('mouseout', () => {
          if (id === activeZone) return;
          layer.setStyle({ weight: 1.5, color: '#00E5FF', opacity: 0.85 });
        });

        layer.bindTooltip(`<b>${id}</b>`, { sticky: true, className: 'map-tooltip' });
      },
    }).addTo(zonesLayer);

    // Auto-fit on first real load
    if (features.length !== prevZoneCountRef.current) {
      prevZoneCountRef.current = features.length;
      try {
        const bounds = zoneLayerRef.current.getBounds();
        if (bounds.isValid()) mapInstance.fitBounds(bounds, { padding: [50, 50] });
      } catch (_) { }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInstance, zones, activeZone]);

  // ── 2. Render Traffic Junctions ───────────────────────────────────────────
  useEffect(() => {
    if (!mapInstance || !layersRef.current) return;
    const layer = layersRef.current.traffic;
    layer.clearLayers();

    (traffic?.junctions || []).forEach(j => {
      const color =
        j.phase === 'GREEN' ? '#00FF64' :
          j.phase === 'RED' ? '#FF3D3D' : '#FFD600';
      L.marker([j.lat, j.lng], { icon: dot(color, 10) })
        .bindTooltip(`Junction: ${j.id}`)
        .on('click', () => onNodeClick?.({ type: 'traffic', ...j }))
        .addTo(layer);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInstance, traffic]);

  // ── 3. Render Water Infrastructure ────────────────────────────────────────
  useEffect(() => {
    if (!mapInstance || !layersRef.current) return;
    const layer = layersRef.current.water;
    layer.clearLayers();

    (water?.reservoirs || []).forEach(r => {
      L.marker([r.lat, r.lng], { icon: dot('#00BFFF', 14) })
        .bindTooltip(`Reservoir: ${r.id}`)
        .on('click', () => onNodeClick?.({ type: 'water', ...r }))
        .addTo(layer);
    });

    (water?.pumpStations || []).forEach(p => {
      L.marker([p.lat, p.lng], { icon: dot('#38BDF8', 9) })
        .bindTooltip(`Pump: ${p.id}`)
        .on('click', () => onNodeClick?.({ type: 'water', ...p }))
        .addTo(layer);
    });

    (water?.valves || []).forEach(v => {
      L.marker([v.lat, v.lng], { icon: dot('#7DD3FC', 7) })
        .bindTooltip(`Valve: ${v.id}`)
        .on('click', () => onNodeClick?.({ type: 'water', ...v }))
        .addTo(layer);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInstance, water]);

  // ── 4. Render Grid Substations ────────────────────────────────────────────
  useEffect(() => {
    if (!mapInstance || !layersRef.current) return;
    const layer = layersRef.current.grid;
    layer.clearLayers();

    (grid?.substations || []).forEach(s => {
      const color = s.status === 'WARNING' ? '#FF3D3D' : '#FF8C00';
      L.marker([s.lat, s.lng], { icon: dot(color, 12) })
        .bindTooltip(`Substation: ${s.id}`)
        .on('click', () => onNodeClick?.({ type: 'grid', ...s }))
        .addTo(layer);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInstance, grid]);

  // ── 5. Render Street Light Clusters ──────────────────────────────────────
  useEffect(() => {
    if (!mapInstance || !layersRef.current) return;
    const layer = layersRef.current.incidents;
    layer.clearLayers();

    (lights?.clusters || []).forEach(c => {
      L.marker([c.lat, c.lng], { icon: dot('#FACC15', 8) })
        .bindTooltip(`Lights: ${c.id}`)
        .on('click', () => onNodeClick?.({ type: 'lights', ...c }))
        .addTo(layer);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInstance, lights]);

  return null;
};

export default MapOverlays;
