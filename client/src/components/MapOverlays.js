import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useCityEngine } from '../engine/CityEngine';
import { useMapContext } from '../context/MapContext';

const CHENNAI_CENTER = [13.0827, 80.2707];
const CHENNAI_ZOOM = 11;

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
  const builtForRef = useRef(null);
  const boundaryFetchedRef = useRef(false); // independent fetch guard

  // ── 1a. DIRECT GeoJSON boundary fetch (production-safe, independent of zones state)
  // This renders the Chennai boundary outline immediately — even before zones state loads.
  useEffect(() => {
    if (!mapInstance || boundaryFetchedRef.current) return;
    boundaryFetchedRef.current = true;

    const fetchBoundary = async () => {
      try {
        console.log('[MapOverlays] Fetching /chennai-boundary.geojson...');
        const res = await fetch('/chennai-boundary.geojson', { cache: 'no-cache' });

        if (!res.ok) {
          console.error(`[MapOverlays] Boundary fetch failed: HTTP ${res.status}`);
          // Fallback: snap map to Chennai center
          mapInstance.setView(CHENNAI_CENTER, CHENNAI_ZOOM, { animate: false });
          return;
        }

        const data = await res.json();
        console.log(`[MapOverlays] Boundary loaded: ${data.features?.length} features`);

        if (!data.features || data.features.length === 0) {
          console.warn('[MapOverlays] GeoJSON has no features — falling back to setView');
          mapInstance.setView(CHENNAI_CENTER, CHENNAI_ZOOM, { animate: false });
          return;
        }

        // Render the boundary outline layer
        const boundaryLayer = L.geoJSON(data, {
          style: {
            color: '#4F46E5',
            weight: 2,
            opacity: 0.9,
            fillColor: '#4F46E5',
            fillOpacity: 0.05,
          },
        }).addTo(mapInstance);

        // fitBounds to actual Chennai ward boundary
        const bounds = boundaryLayer.getBounds();
        if (bounds && bounds.isValid()) {
          console.log(`[MapOverlays] fitBounds SW=${bounds.getSouthWest()} NE=${bounds.getNorthEast()}`);
          mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
        } else {
          console.warn('[MapOverlays] Boundary bounds invalid — using setView fallback');
          mapInstance.setView(CHENNAI_CENTER, CHENNAI_ZOOM, { animate: false });
        }
      } catch (err) {
        console.error('[MapOverlays] Boundary load error:', err.message);
        mapInstance.setView(CHENNAI_CENTER, CHENNAI_ZOOM, { animate: false });
      }
    };

    // Small delay so map container finishes sizing before fitBounds
    const timer = setTimeout(fetchBoundary, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInstance]);

  // ── 1b. Render interactive ward zones from CityEngine state ───────────────
  useEffect(() => {
    if (!mapInstance || !layersRef.current) return;

    const zonesLayer = layersRef.current.zones;
    const zoneKeys = Object.keys(zones || {});
    const cacheKey = `${zoneKeys.length}:${activeZone}`;

    // Collect all flat features from all zones
    const allFeatures = [];
    zoneKeys.forEach(k => {
      const z = zones[k];
      const featureList = z.features || (z.feature ? [z.feature] : []);
      featureList.forEach(f => allFeatures.push(f));
    });

    zonesLayer.clearLayers();
    zoneLayerRef.current = null;

    if (allFeatures.length === 0) return;

    console.log(`[MapOverlays] Rendering ${allFeatures.length} interactive zone features`);

    const geojson = { type: 'FeatureCollection', features: allFeatures };

    zoneLayerRef.current = L.geoJSON(geojson, {
      style: feature => {
        const id = feature.properties?.id || feature.properties?.name || feature.id;
        const isActive = id === activeZone;
        return {
          color: isActive ? '#FFFFFF' : '#4F46E5',
          weight: isActive ? 3 : 2,
          opacity: isActive ? 1 : 0.85,
          fillColor: '#4F46E5',
          fillOpacity: isActive ? 0.25 : 0.05,
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
          layer.setStyle({ color: '#4F46E5', weight: 2, opacity: 0.85 });
        });
        layer.bindTooltip(`<b>${id}</b>`, { sticky: true, className: 'map-tooltip' });
      },
    }).addTo(zonesLayer);

    // fitBounds on first zone load only (boundary fetch already centres map earlier)
    if (builtForRef.current === null) {
      builtForRef.current = cacheKey;
      setTimeout(() => {
        try {
          if (!zoneLayerRef.current) return;
          const bounds = zoneLayerRef.current.getBounds();
          if (bounds && bounds.isValid()) {
            mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
          }
        } catch (_) { /* silent */ }
      }, 500);
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
    (water?.reservoirs || []).forEach(r => L.marker([r.lat, r.lng], { icon: dot('#00BFFF', 14) }).on('click', () => onNodeClick?.({ type: 'water', ...r })).addTo(layer));
    (water?.pumpStations || []).forEach(p => L.marker([p.lat, p.lng], { icon: dot('#38BDF8', 9) }).on('click', () => onNodeClick?.({ type: 'water', ...p })).addTo(layer));
    (water?.valves || []).forEach(v => L.marker([v.lat, v.lng], { icon: dot('#7DD3FC', 7) }).on('click', () => onNodeClick?.({ type: 'water', ...v })).addTo(layer));
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
