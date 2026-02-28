import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { overrideGrid } from '../services/infraAPI';
import '../styles/GridControl.css';

const GridControl = () => {
  const { user, globalThreatScore } = useAuth();
  const [substations, setSubstations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [warningFlash, setWarningFlash] = useState({});

  const substationData = [
    { id: 'SUB-NORTH-01', zone: 'North', load: Math.random() * 100 },
    { id: 'SUB-SOUTH-01', zone: 'South', load: Math.random() * 100 },
    { id: 'SUB-EAST-01', zone: 'East', load: Math.random() * 100 },
    { id: 'SUB-WEST-01', zone: 'West', load: Math.random() * 100 },
    { id: 'SUB-CENTRAL-01', zone: 'Central', load: Math.random() * 100 },
  ];

  const generateSubstations = useCallback(() => {
    const updated = substationData.map(station => ({
      ...station,
      load: Math.max(10, Math.min(100, station.load + (Math.random() - 0.5) * 10)),
      isFlashing: station.load > 85
    }));
    setSubstations(updated);

    // Set warning flash for high load
    updated.forEach(station => {
      if (station.load > 85) {
        setWarningFlash(prev => ({
          ...prev,
          [station.id]: true
        }));
        setTimeout(() => {
          setWarningFlash(prev => ({
            ...prev,
            [station.id]: false
          }));
        }, 300);
      }
    });
  }, []);

  useEffect(() => {
    generateSubstations();
    const interval = setInterval(generateSubstations, 5000);
    return () => clearInterval(interval);
  }, [generateSubstations]);

  const handleRebalance = async (stationId) => {
    const station = substations.find(s => s.id === stationId);
    if (station && station.load > 85) {
      try {
        await overrideGrid(stationId, 'REBALANCE');
        const updated = substations.map(s => 
          s.id === stationId ? { ...s, load: Math.max(50, s.load - 20) } : s
        );
        setSubstations(updated);
      } catch (error) {
        console.error('Rebalance error:', error);
      }
    }
  };

  const handleIsolate = async (stationId) => {
    if (user?.role !== 'Admin') {
      return;
    }

    if (globalThreatScore > 80) {
      return;
    }

    try {
      await overrideGrid(stationId, 'ISOLATE');
      const updated = substations.map(s => 
        s.id === stationId ? { ...s, load: 0, status: 'ISOLATED' } : s
      );
      setSubstations(updated);
      setSelectedStation(null);
    } catch (error) {
      console.error('Isolate error:', error);
    }
  };

  const getLoadColor = (load) => {
    if (load < 60) return '#00cc44';
    if (load < 85) return '#ffaa00';
    return '#ff3333';
  };

  return (
    <div className="grid-control-module">
      <div className="module-header">
        <h3>Electricity Grid Control</h3>
        {globalThreatScore > 80 && (
          <span className="threat-mode-indicator">HIGH THREAT - Isolation functions disabled</span>
        )}
      </div>

      <div className="substations-grid">
        {substations.map(station => (
          <div
            key={station.id}
            className={`substation-card ${selectedStation?.id === station.id ? 'selected' : ''} ${warningFlash[station.id] ? 'warning-flash' : ''}`}
            onClick={() => setSelectedStation(station)}
            style={{ borderLeftColor: getLoadColor(station.load) }}
          >
            <div className="station-name">{station.id}</div>
            <div className="station-zone">{station.zone}</div>
            
            <div className="load-display">
              <svg viewBox="0 0 100 100" className="load-gauge">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="8" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke={getLoadColor(station.load)}
                  strokeWidth="8"
                  strokeDasharray={`${station.load * 2.83} 283`}
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'all 0.3s ease' }}
                />
                <text x="50" y="50" textAnchor="middle" dy="0.3em" fontSize="20" fill="#fff">
                  {station.load.toFixed(0)}%
                </text>
              </svg>
            </div>

            {station.load > 85 && (
              <div className="high-load-warning">
                ⚠ HIGH LOAD
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedStation && (
        <div className={`station-detail-panel ${globalThreatScore > 80 ? 'threat-mode' : ''}`}>
          <h4>{selectedStation.id}</h4>
          <div className="detail-info">
            <p><strong>Zone:</strong> {selectedStation.zone}</p>
            <p><strong>Load:</strong> {selectedStation.load.toFixed(1)}%</p>
            <p><strong>Status:</strong> {selectedStation.load > 85 ? 'CRITICAL' : 'NORMAL'}</p>
            <p><strong>Operational:</strong> {selectedStation.status === 'ISOLATED' ? 'OFFLINE' : 'ONLINE'}</p>
          </div>

          <div className="control-buttons">
            {selectedStation.load > 85 && (
              <button 
                onClick={() => handleRebalance(selectedStation.id)} 
                className="btn-rebalance"
              >
                Rebalance Load
              </button>
            )}
            
            {user?.role === 'Admin' && globalThreatScore <= 80 && (
              <button 
                onClick={() => handleIsolate(selectedStation.id)} 
                className="btn-isolate"
              >
                Isolate Substation
              </button>
            )}
            
            {globalThreatScore > 80 && user?.role === 'Admin' && (
              <div className="threat-notice">
                <strong>Isolation Disabled</strong>
                <small>System in elevated threat mode</small>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid-summary">
        <h4>Grid Status Summary</h4>
        <div className="summary-stats">
          <div className="stat">
            <span>Critical Loads:</span>
            <strong>{substations.filter(s => s.load > 85).length}</strong>
          </div>
          <div className="stat">
            <span>Avg Load:</span>
            <strong>{(substations.reduce((a, s) => a + s.load, 0) / substations.length).toFixed(0)}%</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GridControl;
