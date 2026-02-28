import { useEffect, useRef, useCallback, useState } from 'react';
import L from 'leaflet';
import { useCityEngine } from '../engine/CityEngine';
import { useMapContext } from '../context/MapContext';

// ─── Helpers ────────────────────────────────────────────────────────────────
const mkDotIcon = (color, size = 10) =>
  L.divIcon({
    className: 'map-marker-dot marker-reveal',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};
      border:1.5px solid rgba(255,255,255,0.7);
      box-shadow:0 0 15px ${color};
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

const MapOverlays = ({ activeZone, onZoneClick, onNodeClick }) => {
  const { mapRef, layersRef } = useMapContext();
  const {
    zones, traffic, water, grid, lights,
    emit,
  } = useCityEngine();

  const [mapReady, setMapReady] = useState(false);
  const geoJsonRef = useRef(null);
  const infraRef = useRef({ traffic: null, water: null, power: null, lights: null });
  const featureCountRef = useRef(0);

  useEffect(() => {
    let timer;
    const check = () => {
      if (mapRef.current) {
        setMapReady(true);
      } else {
        timer = setTimeout(check, 100);
      }
    };
    check();
    return () => clearTimeout(timer);
  }, [mapRef]);

  // ── Zones Layer ──────────────────────────────────────────────────────────
  const buildZoneLayer = useCallback(() => {
    const map = mapRef.current;
    if (!map || !layersRef.current) return;
    const zonesLayer = layersRef.current.zones;

    const zoneKeys = Object.keys(zones || {});

    if (geoJsonRef.current && zoneKeys.length !== featureCountRef.current) {
      zonesLayer.removeLayer(geoJsonRef.current);
      geoJsonRef.current = null;
    }

    if (zoneKeys.length === 0) {
      if (geoJsonRef.current) {
        zonesLayer.removeLayer(geoJsonRef.current);
        geoJsonRef.current = null;
      }
      featureCountRef.current = 0;
      return;
    }

    if (geoJsonRef.current) {
      geoJsonRef.current.eachLayer(layer => {
        const feat = layer.feature;
        const id = feat?.id || feat?.properties?.id || feat?.properties?.name;
        const z = zones?.[id] || {};
        const isActive = id === activeZone;
        const risk = z.riskScore || 0;

        let riskColor = '#00FF64';
        if (risk >= 70) riskColor = '#FF3D3D';
        else if (risk >= 30) riskColor = '#FFA500';

        const hasPolygon = JSON.stringify(feat?.geometry).includes('Polygon');

        if (isActive) {
          layer.setStyle({
            color: '#FFFFFF',
            weight: 4,
            fillColor: riskColor,
            fillOpacity: hasPolygon ? 0.4 : 0,
            opacity: 1
          });
        } else {
          layer.setStyle({
            color: '#4FD1FF',
            weight: 2.5,
            fillColor: '#4FD1FF',
            fillOpacity: hasPolygon ? 0.1 : 0,
            opacity: 0.9
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
    featureCountRef.current = geojsonData.features.length;

    geoJsonRef.current = L.geoJSON(geojsonData, {
      style: (feature) => {
        const hasPolygon = JSON.stringify(feature.geometry).includes('Polygon');
        return {
          color: "#4FD1FF",
          weight: 2.5,
          fillColor: '#4FD1FF',
          fillOpacity: hasPolygon ? 0.1 : 0,
          opacity: 0.9
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
          layer.setStyle({ weight: 4, opacity: 1, fillOpacity: 0.2 });
        });

        layer.on("mouseout", () => {
          if (activeZone === id) return;
          const hasPolygon = JSON.stringify(feature.geometry).includes('Polygon');
          layer.setStyle({ weight: 2.5, opacity: 0.9, fillOpacity: hasPolygon ? 0.1 : 0 });
        });

        layer.bindTooltip(`<strong>${id}</strong>`, { sticky: true, className: 'map-tooltip' });
      }
    }).addTo(zonesLayer);

    if (map && geoJsonRef.current && geojsonData.features.length > 0) {
      try {
        const bounds = geoJsonRef.current.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (e) { }
    }
  }, [mapRef, layersRef, zones, activeZone, onZoneClick, emit]);

  // ── Infrastructure Markers ────────────────────────────────────────────────
  const buildInfraMarkers = useCallback(() => {
    if (!mapRef.current || !layersRef.current) return;
    const { traffic: tLayer, water: wLayer, grid: gLayer } = layersRef.current;

    if (!infraRef.current.traffic) infraRef.current.traffic = L.layerGroup().addTo(tLayer);
    infraRef.current.traffic.clearLayers();
    traffic.junctions.forEach(j => {
      const col = j.phase === 'GREEN' ? '#00FF64' : j.phase === 'RED' ? '#FF3D3D' : '#FFBF00';
      const m = L.marker([j.lat, j.lng], { icon: mkDotIcon(col, 8) }).addTo(infraRef.current.traffic);
      m.bindTooltip(`Junction: ${j.id.toUpperCase()}`);
      m.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (onNodeClick) onNodeClick({ type: 'traffic', ...j });
      });
    });

    if (!infraRef.current.water) infraRef.current.water = L.layerGroup().addTo(wLayer);
    infraRef.current.water.clearLayers();
    water.reservoirs.forEach(r => {
      const m = L.marker([r.lat, r.lng], { icon: mkDotIcon('#3B82F6', 10) }).addTo(infraRef.current.water);
      m.bindTooltip(`Reservoir: ${r.id}`);
      m.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (onNodeClick) onNodeClick({ type: 'water', ...r });
      });
    });

    if (!infraRef.current.power) infraRef.current.power = L.layerGroup().addTo(gLayer);
    infraRef.current.power.clearLayers();
    grid.substations.forEach(s => {
      const m = L.marker([s.lat, s.lng], { icon: mkDotIcon('#F59E0B', 10) }).addTo(infraRef.current.power);
      m.bindTooltip(`Substation: ${s.id}`);
      m.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (onNodeClick) onNodeClick({ type: 'grid', ...s });
      });
    });
  }, [mapRef, layersRef, traffic, water, grid, onNodeClick]);

  const buildLightMarkers = useCallback(() => {
    if (!mapRef.current || !layersRef.current || !lights?.clusters) return;
    if (!infraRef.current.lights) infraRef.current.lights = L.layerGroup().addTo(layersRef.current.incidents);
    infraRef.current.lights.clearLayers();
    lights.clusters.forEach(c => {
      const m = L.marker([c.lat, c.lng], { icon: mkDotIcon('#FFD700', 6) }).addTo(infraRef.current.lights);
      m.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (onNodeClick) onNodeClick({ type: 'lights', ...c });
      });
    });
  }, [mapRef, layersRef, lights, onNodeClick]);

  useEffect(() => {
    if (mapReady) {
      buildZoneLayer();
      buildInfraMarkers();
      buildLightMarkers();
    }
  }, [mapReady, zones, traffic, water, grid, lights, buildZoneLayer, buildInfraMarkers, buildLightMarkers]);

  return null;
};

export default MapOverlays;
