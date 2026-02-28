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
      background:${color};border:1.5px solid rgba(255,255,255,0.85);
      box-shadow:0 0 8px ${color}99;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// ─── Main Component ──────────────────────────────────────────────────────────
const MapOverlays = ({ activeZone, onZoneClick, onNodeClick }) => {
  const { mapInstance, layersRef } = useMapContext();
  const { zones, traffic, water, grid, lights, emit } = useCityEngine();

  const zoneLayerRef = useRef(null);
  const builtForRef = useRef(null); // tracks zone key count + active zone to detect changes

  // ── 1. Render Ward Boundaries ─────────────────────────────────────────────
  useEffect(() => {
    if (!mapInstance || !layersRef.current) return;

    const zonesLayer = layersRef.current.zones;
    const zoneKeys = Object.keys(zones || {});
    const cacheKey = `${zoneKeys.length}:${activeZone}`;

    // Collect all flat features from all zones
    // Each zone stores an array `features` of individual Polygon/LineString features
    const allFeatures = [];
    zoneKeys.forEach(k => {
      const z = zones[k];
      const featureList = z.features || (z.feature ? [z.feature] : []);
      featureList.forEach(f => allFeatures.push(f));
    });

    // Always fully rebuild the layer (clear + redraw)
    zonesLayer.clearLayers();
    zoneLayerRef.current = null;

    if (allFeatures.length === 0) {
      console.log('[MapOverlays] No features to render yet');
      return;
    }

    console.log(`[MapOverlays] Rendering ${allFeatures.length} features for ${zoneKeys.length} zones`);

    const geojson = { type: 'FeatureCollection', features: allFeatures };

    zoneLayerRef.current = L.geoJSON(geojson, {
      style: feature => {
        const id = feature.properties?.id || feature.properties?.name || feature.id;
        const isActive = id === activeZone;
        return {
          color: isActive ? '#FFFFFF' : '#00E5FF',
          weight: isActive ? 3 : 1.5,
          opacity: isActive ? 1 : 0.85,
          fillColor: '#00E5FF',
          fillOpacity: isActive ? 0.25 : 0.06,
        };
      },
      onEachFeature: (feature, layer) => {
        const id = feature.properties?.id || feature.properties?.name || feature.id;

        layer.on('click', e => {
          L.DomEvent.stopPropagation(e);
          if (onZoneClick) onZoneClick(id, zones[id] || {});
          emit('ZONE_SELECTED', { zone: id });
        });

        layer.on('mouseover', () => {
          if (id === activeZone) return;
          layer.setStyle({ color: '#FFFFFF', weight: 2.5, opacity: 1 });
        });
        layer.on('mouseout', () => {
          if (id === activeZone) return;
          layer.setStyle({ color: '#00E5FF', weight: 1.5, opacity: 0.85 });
        });

        layer.bindTooltip(`<b>${id}</b>`, { sticky: true, className: 'map-tooltip' });
      },
    }).addTo(zonesLayer);

    // Auto-fit view when zones first load
    if (builtForRef.current === null) {
      builtForRef.current = cacheKey;
      try {
        const bounds = zoneLayerRef.current.getBounds();
        if (bounds.isValid()) mapInstance.fitBounds(bounds, { padding: [50, 50] });
      } catch (_) { }
    }
    builtForRef.current = cacheKey;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInstance, zones, activeZone]);

  // ── 2. Traffic Junctions ──────────────────────────────────────────────────
  useEffect(() => {
    if (!mapInstance || !layersRef.current) return;
    const layer = layersRef.current.traffic;
    layer.clearLayers();
    (traffic?.junctions || []).forEach(j => {
      const color = j.phase === 'GREEN' ? '#00FF64' : j.phase === 'RED' ? '#FF3D3D' : '#FFD600';
      L.marker([j.lat, j.lng], { icon: dot(color, 10) })
        .bindTooltip(j.id)
        .on('click', () => onNodeClick?.({ type: 'traffic', ...j }))
        .addTo(layer);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInstance, traffic]);

  // ── 3. Water Infrastructure ───────────────────────────────────────────────
  useEffect(() => {
    if (!mapInstance || !layersRef.current) return;
    const layer = layersRef.current.water;
    layer.clearLayers();
    (water?.reservoirs || []).forEach(r =>
      L.marker([r.lat, r.lng], { icon: dot('#00BFFF', 14) }).on('click', () => onNodeClick?.({ type: 'water', ...r })).addTo(layer)
    );
    (water?.pumpStations || []).forEach(p =>
      L.marker([p.lat, p.lng], { icon: dot('#38BDF8', 9) }).on('click', () => onNodeClick?.({ type: 'water', ...p })).addTo(layer)
    );
    (water?.valves || []).forEach(v =>
      L.marker([v.lat, v.lng], { icon: dot('#7DD3FC', 7) }).on('click', () => onNodeClick?.({ type: 'water', ...v })).addTo(layer)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInstance, water]);

  // ── 4. Grid Substations ───────────────────────────────────────────────────
  useEffect(() => {
    if (!mapInstance || !layersRef.current) return;
    const layer = layersRef.current.grid;
    layer.clearLayers();
    (grid?.substations || []).forEach(s => {
      const color = s.status === 'WARNING' ? '#FF3D3D' : '#FF8C00';
      L.marker([s.lat, s.lng], { icon: dot(color, 12) }).on('click', () => onNodeClick?.({ type: 'grid', ...s })).addTo(layer);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInstance, grid]);

  // ── 5. Street Light Clusters ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapInstance || !layersRef.current) return;
    const layer = layersRef.current.incidents;
    layer.clearLayers();
    (lights?.clusters || []).forEach(c =>
      L.marker([c.lat, c.lng], { icon: dot('#FACC15', 8) }).on('click', () => onNodeClick?.({ type: 'lights', ...c })).addTo(layer)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInstance, lights]);

  return null;
};

export default MapOverlays;
