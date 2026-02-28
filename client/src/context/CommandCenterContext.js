import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getGlobalThreatScore, getMonitoringStatus, getTrafficSignals, getWaterLevels, getEmergencyIncidents } from '../services/infraAPI';

const CommandCenterContext = createContext();

export const useCommandCenter = () => useContext(CommandCenterContext);

export const CommandCenterProvider = ({ children }) => {
  const [zoneStates, setZoneStates] = useState({});
  const [infrastructureStatus, setInfrastructureStatus] = useState({});
  const [globalThreatScore, setGlobalThreatScoreState] = useState(0);
  const [deviceTrustScore, setDeviceTrustScoreState] = useState(100);
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [apiTraffic, setApiTraffic] = useState([]);

  const computeZones = useCallback((signals, waters) => {
    const zones = ['North', 'South', 'East', 'West', 'Central'];
    const base = {};
    zones.forEach(z => {
      base[z] = {
        trafficHealth: 0,
        waterLevel: 0,
        gridLoad: 60,
        lightStatus: 80,
        riskScore: 0,
        signalCount: 0,
      };
    });

    signals.forEach(sig => {
      const zone = sig.location?.split('-')[0] || 'Central';
      if (!base[zone]) return;
      const health = sig.status === 'GREEN' ? 100 : sig.status === 'YELLOW' ? 50 : 20;
      const prev = base[zone];
      base[zone] = {
        ...prev,
        trafficHealth:
          (prev.trafficHealth * prev.signalCount + health) / (prev.signalCount + 1),
        signalCount: prev.signalCount + 1,
      };
    });

    waters.forEach(w => {
      if (!base[w.zoneId]) return;
      base[w.zoneId] = {
        ...base[w.zoneId],
        waterLevel: w.waterLevel,
      };
    });

    Object.keys(base).forEach(zone => {
      const d = base[zone];
      let risk = 0;
      if (d.trafficHealth < 50) risk += 20;
      if (d.waterLevel < 30) risk += 25;
      if (d.gridLoad > 80) risk += 30;
      if (d.lightStatus < 50) risk += 15;
      risk += Math.max(0, (globalThreatScore - 30) * 0.3);
      base[zone].riskScore = Math.min(100, risk);
    });

    return base;
  }, [globalThreatScore]);

  const poll = useCallback(async () => {
    try {
      const [threatRes, monitorRes, signalsRes, waterRes, incidentsRes] = await Promise.all([
        getGlobalThreatScore(),
        getMonitoringStatus(),
        getTrafficSignals(),
        getWaterLevels(),
        getEmergencyIncidents(),
      ]);

      if (threatRes.data?.threatScore !== undefined) {
        setGlobalThreatScoreState(threatRes.data.threatScore);
      }

      if (monitorRes.data?.deviceTrustScore !== undefined) {
        setDeviceTrustScoreState(monitorRes.data.deviceTrustScore);
      }

      if (monitorRes.data?.apiTraffic) {
        setApiTraffic(monitorRes.data.apiTraffic);
      }

      const signals = signalsRes.data || [];
      const waters = waterRes.data || [];
      setActiveIncidents(incidentsRes.data || []);

      const zones = computeZones(signals, waters);
      setZoneStates(zones);
      setInfrastructureStatus({ signals, waters });
    } catch (e) {
      console.error('CommandCenter poll error:', e);
    }
  }, [computeZones]);

  useEffect(() => {
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, [poll]);

  const value = {
    zoneStates,
    infrastructureStatus,
    globalThreatScore,
    deviceTrustScore,
    activeIncidents,
    apiTraffic,
  };

  return (
    <CommandCenterContext.Provider value={value}>
      {children}
    </CommandCenterContext.Provider>
  );
};
