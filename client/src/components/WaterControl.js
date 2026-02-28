import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWaterLevels, adjustWaterFlow, shutdownWaterZone } from '../services/infraAPI';
import '../styles/WaterControl.css';

const WaterControl = () => {
  const { user, globalThreatScore } = useAuth();
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [contaminationFlags, setContaminationFlags] = useState({});
  const [flowAdjustment, setFlowAdjustment] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);

  const canAdjustFlow = useCallback(() => {
    return user?.role === 'Admin' || user?.role === 'EmergencyAuthority';
  }, [user?.role]);

  const fetchWaterData = useCallback(async () => {
    try {
      const res = await getWaterLevels();
      const waterZones = res.data || [];
      setZones(waterZones);

      // Simulate water level decrease
      waterZones.forEach(zone => {
        const newLevel = Math.max(0, zone.waterLevel - (Math.random() * 0.5));
        zone.waterLevel = newLevel;

        // Simulate contamination based on zone
        if (Math.random() > 0.95 && !contaminationFlags[zone.zoneId]) {
          setContaminationFlags(prev => ({
            ...prev,
            [zone.zoneId]: true
          }));
        }
      });
    } catch (error) {
      console.error('Water data fetch error:', error);
    }
  }, [contaminationFlags]);

  useEffect(() => {
    fetchWaterData();
    const interval = setInterval(fetchWaterData, 5000);
    return () => clearInterval(interval);
  }, [fetchWaterData]);

  const handleFlowAdjust = async () => {
    if (!canAdjustFlow()) {
      setAccessDenied(true);
      setTimeout(() => setAccessDenied(false), 2000);
      return;
    }

    try {
      const flowRate = parseFloat(flowAdjustment);
      if (!isNaN(flowRate)) {
        await adjustWaterFlow(selectedZone.zoneId, flowRate);
        setFlowAdjustment('');
        fetchWaterData();
      }
    } catch (error) {
      console.error('Flow adjustment error:', error);
    }
  };

  const handleShutdown = async () => {
    if (user?.role !== 'Admin') {
      setAccessDenied(true);
      setTimeout(() => setAccessDenied(false), 2000);
      return;
    }

    try {
      await shutdownWaterZone(selectedZone.zoneId);
      fetchWaterData();
      setSelectedZone(null);
    } catch (error) {
      console.error('Shutdown error:', error);
    }
  };

  const getWaterLevelColor = (level) => {
    if (level > 70) return '#00cc44';
    if (level > 30) return '#ffaa00';
    return '#ff3333';
  };

  const getContaminationStatus = (zoneId) => {
    return contaminationFlags[zoneId] || false;
  };

  return (
    <div className="water-control-module">
      <div className="module-header">
        <h3>Water Control & Management</h3>
      </div>

      {accessDenied && (
        <div className="access-denied-alert">
          <span>Admin access required for water system controls</span>
        </div>
      )}

      <div className="water-zones-grid">
        {zones.map(zone => (
          <div
            key={zone._id}
            className={`water-zone-card ${selectedZone?._id === zone._id ? 'selected' : ''} ${getContaminationStatus(zone.zoneId) ? 'contaminated' : ''}`}
            onClick={() => setSelectedZone(zone)}
          >
            <div className="zone-name">{zone.zoneId}</div>
            <div className="water-level-display">
              <div 
                className="water-level-bar"
                style={{ 
                  height: `${zone.waterLevel}%`,
                  backgroundColor: getWaterLevelColor(zone.waterLevel)
                }}
              />
            </div>
            <div className="zone-stats">
              <p className="water-level-text">{zone.waterLevel.toFixed(1)}%</p>
              <p className="flow-rate">Flow: {zone.flowRate.toFixed(1)}</p>
              {getContaminationStatus(zone.zoneId) && (
                <p className="contamination-warning">⚠ Contaminated</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedZone && (
        <div className="water-detail-panel">
          <h4>{selectedZone.zoneId} Water Zone Control</h4>
          <div className="detail-info">
            <p><strong>Reservoir Level:</strong> {selectedZone.waterLevel.toFixed(2)}%</p>
            <p><strong>Flow Rate:</strong> {selectedZone.flowRate.toFixed(2)} L/s</p>
            <p><strong>Status:</strong> {selectedZone.isShutdown ? 'SHUTDOWN' : 'OPERATIONAL'}</p>
            <p><strong>Contamination:</strong> {getContaminationStatus(selectedZone.zoneId) ? 'DETECTED' : 'Clear'}</p>
            <p><strong>Last Modified:</strong> {new Date(selectedZone.lastModified).toLocaleString()}</p>
            <p><strong>Modified By:</strong> {selectedZone.modifiedBy}</p>
          </div>

          {canAdjustFlow() && !selectedZone.isShutdown ? (
            <div className="control-section">
              <div className="flow-adjustment">
                <input
                  type="number"
                  value={flowAdjustment}
                  onChange={(e) => setFlowAdjustment(e.target.value)}
                  placeholder="Enter flow rate (L/s)"
                  min="0"
                  step="0.1"
                />
                <button onClick={handleFlowAdjust} className="btn-adjust">
                  Adjust Flow
                </button>
              </div>
              {user?.role === 'Admin' && (
                <button onClick={handleShutdown} className="btn-shutdown">
                  Emergency Shutdown
                </button>
              )}
            </div>
          ) : (
            <div className="access-denied-notice">
              <p>Controls unavailable</p>
              <small>{selectedZone.isShutdown ? 'Zone is shutdown' : 'Admin access required'}</small>
            </div>
          )}
        </div>
      )}

      {Object.keys(contaminationFlags).length > 0 && globalThreatScore > 40 && (
        <div className="contamination-alert">
          <h4>Contamination Events</h4>
          <ul>
            {Object.entries(contaminationFlags).map(([zoneId, isContaminated]) => (
              isContaminated && <li key={zoneId}>{zoneId}: Contamination detected - Risk increased</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WaterControl;
