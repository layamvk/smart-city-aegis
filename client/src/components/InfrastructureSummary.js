import React, { useState, useEffect, useCallback } from 'react';
import { getTrafficSignals, getWaterLevels, getEmergencyIncidents } from '../services/infraAPI';
import { useAuth } from '../context/AuthContext';
import '../styles/InfrastructureSummary.css';

const InfrastructureSummary = () => {
  const { globalThreatScore } = useAuth();
  const [summary, setSummary] = useState({
    trafficOperational: 0,
    waterNormal: 0,
    gridLoad: 50,
    lightingEnabled: true,
    activeIncidents: 0,
    totalSignals: 0,
    totalZones: 0,
    zoneStatuses: {}
  });

  const fetchSummary = useCallback(async () => {
    try {
      const [signalsRes, waterRes, incidentsRes] = await Promise.all([
        getTrafficSignals(),
        getWaterLevels(),
        getEmergencyIncidents()
      ]);

      const signals = signalsRes.data || [];
      const waters = waterRes.data || [];
      const incidents = incidentsRes.data || [];

      const greenCount = signals.filter(s => s.status === 'GREEN').length;
      const operational = signals.length > 0 ? Math.round((greenCount / signals.length) * 100) : 0;

      const normalWater = waters.filter(w => w.waterLevel > 30 && w.waterLevel < 90).length;
      const waterNormal = waters.length > 0 ? Math.round((normalWater / waters.length) * 100) : 0;

      const activeIncs = incidents.filter(i => i.status !== 'Resolved').length;

      const zoneStatuses = {};
      const zones = ['North', 'South', 'East', 'West', 'Central'];
      zones.forEach(zone => {
        const zoneSignals = signals.filter(s => s.location?.startsWith(zone));
        const zoneWaters = waters.filter(w => w.zoneId === zone);
        zoneStatuses[zone] = {
          trafficGreen: zoneSignals.filter(s => s.status === 'GREEN').length,
          trafficTotal: zoneSignals.length,
          waterLevel: zoneWaters[0]?.waterLevel || 0
        };
      });

      setSummary({
        trafficOperational: operational,
        waterNormal,
        gridLoad: 50 + Math.random() * 30 - 15,
        lightingEnabled: true,
        activeIncidents: activeIncs,
        totalSignals: signals.length,
        totalZones: waters.length,
        zoneStatuses
      });
    } catch (error) {
      console.error('Summary fetch error:', error);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 5000);
    return () => clearInterval(interval);
  }, [fetchSummary]);

  const getThreatColor = (score) => {
    if (score < 30) return '#00cc44';
    if (score < 60) return '#ffaa00';
    if (score < 80) return '#ff6600';
    return '#ff3333';
  };

  return (
    <div className="infrastructure-summary">
      <div className="summary-header">
        <h3>Infrastructure Overview</h3>
        <div className="threat-indicator" style={{ borderColor: getThreatColor(globalThreatScore) }}>
          <span className="threat-label">System Status</span>
          <span className="threat-value" style={{ color: getThreatColor(globalThreatScore) }}>
            {globalThreatScore > 80 ? 'ELEVATED' : globalThreatScore > 50 ? 'ELEVATED' : 'NORMAL'}
          </span>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card traffic-card">
          <div className="card-icon">🚦</div>
          <div className="card-content">
            <span className="card-label">Traffic Operational</span>
            <span className="card-value">{summary.trafficOperational}%</span>
            <div className="card-bar">
              <div className="card-fill traffic-fill" style={{ width: `${summary.trafficOperational}%` }} />
            </div>
            <span className="card-detail">{summary.totalSignals} signals</span>
          </div>
        </div>

        <div className="summary-card water-card">
          <div className="card-icon">💧</div>
          <div className="card-content">
            <span className="card-label">Water Normal</span>
            <span className="card-value">{summary.waterNormal}%</span>
            <div className="card-bar">
              <div className="card-fill water-fill" style={{ width: `${summary.waterNormal}%` }} />
            </div>
            <span className="card-detail">{summary.totalZones} zones</span>
          </div>
        </div>

        <div className="summary-card grid-card">
          <div className="card-icon">⚡</div>
          <div className="card-content">
            <span className="card-label">Grid Load</span>
            <span className="card-value">{summary.gridLoad.toFixed(0)}%</span>
            <div className="card-bar">
              <div className="card-fill grid-fill" style={{ width: `${Math.min(100, summary.gridLoad)}%` }} />
            </div>
            <span className="card-detail">{summary.gridLoad > 85 ? '⚠️ High' : 'Normal'}</span>
          </div>
        </div>

        <div className="summary-card incidents-card">
          <div className="card-icon">🚨</div>
          <div className="card-content">
            <span className="card-label">Active Incidents</span>
            <span className="card-value">{summary.activeIncidents}</span>
            <div className="card-bar">
              <div className="card-fill incidents-fill" style={{ width: `${Math.min(100, summary.activeIncidents * 20)}%` }} />
            </div>
            <span className="card-detail">{summary.activeIncidents > 0 ? 'Needs attention' : 'All clear'}</span>
          </div>
        </div>
      </div>

      <div className="zone-mini-grid">
        <h4>Zone Status</h4>
        <div className="zones-row">
          {Object.entries(summary.zoneStatuses).map(([zone, status]) => (
            <div key={zone} className="zone-mini" title={`${zone}: ${status.trafficGreen}/${status.trafficTotal} signals, Water: ${status.waterLevel}%`}>
              <span className="zone-name">{zone.substr(0, 1)}</span>
              <div className="zone-mini-bar">
                <div 
                  className="zone-mini-fill" 
                  style={{ 
                    width: `${status.trafficTotal > 0 ? (status.trafficGreen / status.trafficTotal) * 100 : 0}%`,
                    backgroundColor: status.waterLevel < 30 ? '#ff3333' : '#00cc44'
                  }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfrastructureSummary;
