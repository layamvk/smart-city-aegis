import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getTrafficSignals, getWaterLevels, getGlobalThreatScore, getEmergencyIncidents } from '../services/infraAPI';
import { useAuth } from '../context/AuthContext';
import '../styles/ZoneMapNew.css';

const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map]);
  return null;
};

const ZoneMapFixed = () => {
  const { globalThreatScore, updateGlobalThreatScore, deviceTrustScore } = useAuth();
  const [zones, setZones] = useState({});
  const [selectedZone, setSelectedZone] = useState(null);
  const [signals, setSignals] = useState([]);
  const [waterZones, setWaterZones] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const mapRef = useRef(null);
  const geoJsonRef = useRef(null);
  const markerCoordsRef = useRef({});

  const zoneGeoJSON = useMemo(() => ({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: 'North',
        geometry: { type: 'Polygon', coordinates: [[[-73.95, 40.82], [-73.93, 40.82], [-73.93, 40.80], [-73.95, 40.80], [-73.95, 40.82]]] }
      },
      {
        type: 'Feature',
        id: 'South',
        geometry: { type: 'Polygon', coordinates: [[[-73.95, 40.70], [-73.93, 40.70], [-73.93, 40.68], [-73.95, 40.68], [-73.95, 40.70]]] }
      },
      {
        type: 'Feature',
        id: 'East',
        geometry: { type: 'Polygon', coordinates: [[[-73.85, 40.76], [-73.83, 40.76], [-73.83, 40.74], [-73.85, 40.74], [-73.85, 40.76]]] }
      },
      {
        type: 'Feature',
        id: 'West',
        geometry: { type: 'Polygon', coordinates: [[[-74.05, 40.76], [-74.03, 40.76], [-74.03, 40.74], [-74.05, 40.74], [-74.05, 40.76]]] }
      },
      {
        type: 'Feature',
        id: 'Central',
        geometry: { type: 'Polygon', coordinates: [[[-73.95, 40.76], [-73.93, 40.76], [-73.93, 40.74], [-73.95, 40.74], [-73.95, 40.76]]] }
      }
    ]
  }), []);

  const calculateZoneData = useCallback((allSignals, allWaterZones) => {
    const zoneData = {
      North: { trafficHealth: 0, waterLevel: 0, gridLoad: 50, lightStatus: 80, riskScore: 0, signalCount: 0, waterCount: 0 },
      South: { trafficHealth: 0, waterLevel: 0, gridLoad: 55, lightStatus: 75, riskScore: 0, signalCount: 0, waterCount: 0 },
      East: { trafficHealth: 0, waterLevel: 0, gridLoad: 60, lightStatus: 70, riskScore: 0, signalCount: 0, waterCount: 0 },
      West: { trafficHealth: 0, waterLevel: 0, gridLoad: 45, lightStatus: 85, riskScore: 0, signalCount: 0, waterCount: 0 },
      Central: { trafficHealth: 0, waterLevel: 0, gridLoad: 75, lightStatus: 90, riskScore: 0, signalCount: 0, waterCount: 0 }
    };

    allSignals.forEach(sig => {
      const zone = sig.location?.split('-')[0] || 'Central';
      if (zoneData[zone]) {
        const health = sig.status === 'GREEN' ? 100 : sig.status === 'YELLOW' ? 50 : 20;
        zoneData[zone].trafficHealth = (zoneData[zone].trafficHealth * zoneData[zone].signalCount + health) / (zoneData[zone].signalCount + 1);
        zoneData[zone].signalCount++;
      }
    });

    allWaterZones.forEach(wz => {
      if (zoneData[wz.zoneId]) {
        zoneData[wz.zoneId].waterLevel = wz.waterLevel;
        zoneData[wz.zoneId].waterCount++;
      }
    });

    Object.keys(zoneData).forEach(zone => {
      const data = zoneData[zone];
      let risk = 0;
      if (data.trafficHealth < 50) risk += 20;
      if (data.waterLevel < 30) risk += 25;
      if (data.gridLoad > 80) risk += 30;
      if (data.lightStatus < 50) risk += 15;
      risk += Math.max(0, (globalThreatScore - 30) * 0.3);
      zoneData[zone].riskScore = Math.min(100, risk);
    });

    return zoneData;
  }, [globalThreatScore]);

  const fetchData = useCallback(async () => {
    try {
      const [signalsRes, waterRes, threatRes, incidentsRes] = await Promise.all([
        getTrafficSignals(),
        getWaterLevels(),
        getGlobalThreatScore(),
        getEmergencyIncidents()
      ]);

      const sigs = signalsRes.data || [];
      const waters = waterRes.data || [];
      setSignals(sigs);
      setWaterZones(waters);
      setIncidents(incidentsRes.data || []);

      if (threatRes.data?.threatScore !== undefined) {
        updateGlobalThreatScore(threatRes.data.threatScore);
      }

      const zoneData = calculateZoneData(sigs, waters);
      setZones(zoneData);
    } catch (error) {
      console.error('Zone data fetch error:', error);
    }
  }, [calculateZoneData, updateGlobalThreatScore]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const getRiskColor = useCallback((riskScore) => {
    if (riskScore < 30) return '#00cc44';
    if (riskScore < 70) return '#ffaa00';
    return '#ff3333';
  }, []);

  const onEachZone = useCallback((feature, layer) => {
    const zoneData = zones[feature.id];
    if (zoneData) {
      const content = `
        <div class="zone-popup">
          <h4>${feature.id}</h4>
          <p>Risk: ${zoneData.riskScore.toFixed(0)}</p>
          <p>Traffic: ${zoneData.trafficHealth.toFixed(0)}%</p>
          <p>Water: ${zoneData.waterLevel}%</p>
          <p>Grid: ${zoneData.gridLoad}%</p>
        </div>
      `;
      layer.bindPopup(content);
    }
    layer.on('click', () => setSelectedZone(feature.id));
  }, [zones]);

  const setStyleToZone = useCallback((feature) => {
    const zoneData = zones[feature.id];
    const riskScore = zoneData?.riskScore || 0;
    const color = getRiskColor(riskScore);
    const opacity = 0.4 + (riskScore / 100) * 0.35;
    
    return {
      fillColor: color,
      weight: globalThreatScore > 80 ? 3 : 2,
      opacity: 1,
      color: globalThreatScore > 80 ? '#ff0000' : color,
      dashArray: globalThreatScore > 80 ? '5,5' : '3',
      fillOpacity: opacity
    };
  }, [zones, getRiskColor, globalThreatScore]);

  return (
    <div className="zone-map-container">
      <div className="zone-map">
        <MapContainer 
          ref={mapRef}
          center={[40.76, -73.94]} 
          zoom={12} 
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
            maxZoom={19}
          />
          <MapResizer />
          <GeoJSON ref={geoJsonRef} data={zoneGeoJSON} onEachFeature={onEachZone} style={setStyleToZone} />
          
          {signals.map((sig, i) => {
            if (!markerCoordsRef.current[sig.signalId]) {
              markerCoordsRef.current[sig.signalId] = [
                40.76 + (Math.random() - 0.5) * 0.1,
                -73.94 + (Math.random() - 0.5) * 0.1
              ];
            }
            return (
              <Marker key={sig.signalId} position={markerCoordsRef.current[sig.signalId]}>
                <Popup>{sig.signalId}: {sig.status}</Popup>
              </Marker>
            );
          })}

          {incidents.map((inc) => {
            if (!markerCoordsRef.current[inc.incidentId]) {
              markerCoordsRef.current[inc.incidentId] = [
                40.76 + (Math.random() - 0.5) * 0.15,
                -73.94 + (Math.random() - 0.5) * 0.15
              ];
            }
            return (
              <Marker key={inc.incidentId} position={markerCoordsRef.current[inc.incidentId]}>
                <Popup>{inc.incidentId}: {inc.type} ({inc.status})</Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="zone-details-panel">
        <h3>Zone Details</h3>
        {selectedZone && zones[selectedZone] && (
          <div className="zone-detail">
            <h4>{selectedZone}</h4>
            <div className={`risk-indicator risk-${zones[selectedZone].riskScore < 30 ? 'low' : zones[selectedZone].riskScore < 70 ? 'medium' : 'high'}`}>
              Risk: {zones[selectedZone].riskScore.toFixed(0)}
            </div>
            <ul>
              <li>Traffic Health: {zones[selectedZone].trafficHealth.toFixed(0)}%</li>
              <li>Water Level: {zones[selectedZone].waterLevel}%</li>
              <li>Grid Load: {zones[selectedZone].gridLoad}%</li>
              <li>Light Status: {zones[selectedZone].lightStatus}%</li>
            </ul>
          </div>
        )}
        <div className="global-status">
          <h4>Global Status</h4>
          <p>Threat: {globalThreatScore.toFixed(0)} {globalThreatScore > 80 ? '🔴' : globalThreatScore > 50 ? '🟡' : '🟢'}</p>
          <p>Device Trust: {deviceTrustScore}%</p>
        </div>
      </div>
    </div>
  );
};

export default ZoneMapFixed;
