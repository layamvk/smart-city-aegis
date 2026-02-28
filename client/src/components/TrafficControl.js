import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTrafficSignals, changeTrafficSignal, emergencyTrafficOverride } from '../services/infraAPI';
import { canWriteModule } from '../config/uiPermissions';
import '../styles/TrafficControl.css';

const TrafficControl = ({ globalThreatScore }) => {
  const { user, deviceTrustScore, globalThreatScore: threatScore } = useAuth();
  const [signals, setSignals] = useState([]);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [denialMessage, setDenialMessage] = useState('');
  const [elevatedZoneRisk, setElevatedZoneRisk] = useState({});

  const role = user?.role || 'Viewer';
  const hasWriteAccess = canWriteModule(role, 'traffic');

  const canModifySignal = useCallback(() => {
    if (hasWriteAccess) {
      if (deviceTrustScore < 40) {
        return false;
      }
      if (threatScore > 80 && user?.role !== 'Admin' && user?.role !== 'SuperAdmin') {
        return false;
      }
      return true;
    }
    return false;
  }, [hasWriteAccess, deviceTrustScore, threatScore, user?.role]);

  const fetchSignals = useCallback(async () => {
    try {
      const res = await getTrafficSignals();
      setSignals(res.data || []);
    } catch (error) {
      console.error('Traffic signals fetch error:', error);
    }
  }, []);

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, 5000);
    return () => clearInterval(interval);
  }, [fetchSignals]);

  const handleSignalChange = async (signalId, newStatus) => {
    if (!canModifySignal()) {
      setAccessDenied(true);
      if (!hasWriteAccess) {
        setDenialMessage('Read-only mode. Controls are disabled.');
      } else if (deviceTrustScore < 40) {
        setDenialMessage('Low device trust score. Cannot modify traffic signals.');
      } else if (threatScore > 80 && user?.role !== 'Admin' && user?.role !== 'SuperAdmin') {
        setDenialMessage('System in elevated threat mode. Admin access required.');
      } else {
        setDenialMessage('Insufficient permissions to modify traffic signals.');
      }

      const zone = selectedSignal?.location?.split('-')[0] || 'Central';
      setElevatedZoneRisk(prev => ({
        ...prev,
        [zone]: (prev[zone] || 0) + 15
      }));

      setTimeout(() => setAccessDenied(false), 3000);
      return;
    }

    try {
      await changeTrafficSignal(signalId, newStatus);
      fetchSignals();
      setSelectedSignal(null);
    } catch (error) {
      console.error('Signal change error:', error);
    }
  };

  const handleEmergencyOverride = async (signalId) => {
    if (!hasWriteAccess) {
      setAccessDenied(true);
      setDenialMessage('Emergency override requires write authority.');
      setTimeout(() => setAccessDenied(false), 3000);
      return;
    }

    try {
      await emergencyTrafficOverride(signalId);
      fetchSignals();
      setSelectedSignal(null);
    } catch (error) {
      console.error('Emergency override error:', error);
    }
  };

  const getSignalColor = (status) => {
    const colors = { RED: '#ff3333', YELLOW: '#ffaa00', GREEN: '#00cc44' };
    return colors[status] || '#666';
  };

  return (
    <div className="traffic-control-module">
      {!hasWriteAccess && (
        <div style={{ backgroundColor: 'rgba(255, 170, 0, 0.2)', border: '1px solid #ffaa00', color: '#ffaa00', padding: '10px', textAlign: 'center', fontWeight: 'bold', marginBottom: '15px', borderRadius: '4px' }}>
          READ-ONLY MODE — Controls Disabled
        </div>
      )}

      <div className="module-header">
        <h3>Traffic Control System</h3>
        <span className={`auth-status ${hasWriteAccess ? 'authorized' : 'restricted'}`}>
          {hasWriteAccess ? '✓ Write Authorized' : '✗ Read Only'}
        </span>
      </div>

      {accessDenied && (
        <div className="access-denied-alert">
          <span className="alert-icon">🚫</span>
          <span>{denialMessage}</span>
        </div>
      )}

      <div className="signals-grid">
        {signals.map(signal => (
          <div
            key={signal._id}
            className={`signal-card ${selectedSignal?._id === signal._id ? 'selected' : ''}`}
            onClick={() => setSelectedSignal(signal)}
            style={{ borderLeftColor: getSignalColor(signal.status) }}
          >
            <div className="signal-status" style={{ backgroundColor: getSignalColor(signal.status) }}>
              {signal.status}
            </div>
            <div className="signal-info">
              <h4>{signal.signalId}</h4>
              <p>Zone: {signal.location?.split('-')[0] || 'N/A'}</p>
              <p className="signal-timestamp">Updated: {new Date(signal.lastModified).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedSignal && (
        <div className="signal-detail-panel">
          <h4>{selectedSignal.signalId} Control Panel</h4>
          <div className="detail-info">
            <p><strong>ID:</strong> {selectedSignal.signalId}</p>
            <p><strong>Zone:</strong> {selectedSignal.location?.split('-')[0] || 'N/A'}</p>
            <p><strong>Current Status:</strong> {selectedSignal.status}</p>
            <p><strong>Last Modified By:</strong> {selectedSignal.modifiedBy}</p>
            <p><strong>Last Updated:</strong> {new Date(selectedSignal.lastModified).toLocaleString()}</p>
          </div>

          <div className="control-buttons">
            <button
              onClick={() => handleSignalChange(selectedSignal.signalId, 'RED')}
              className={`btn-red ${!hasWriteAccess ? 'read-only' : ''}`}
              disabled={!hasWriteAccess}
              title={!hasWriteAccess ? "Read-only access" : ""}
              style={!hasWriteAccess ? { cursor: 'not-allowed', opacity: 0.5 } : {}}
            >
              Set RED
            </button>
            <button
              onClick={() => handleSignalChange(selectedSignal.signalId, 'YELLOW')}
              className={`btn-yellow ${!hasWriteAccess ? 'read-only' : ''}`}
              disabled={!hasWriteAccess}
              title={!hasWriteAccess ? "Read-only access" : ""}
              style={!hasWriteAccess ? { cursor: 'not-allowed', opacity: 0.5 } : {}}
            >
              Set YELLOW
            </button>
            <button
              onClick={() => handleSignalChange(selectedSignal.signalId, 'GREEN')}
              className={`btn-green ${!hasWriteAccess ? 'read-only' : ''}`}
              disabled={!hasWriteAccess}
              title={!hasWriteAccess ? "Read-only access" : ""}
              style={!hasWriteAccess ? { cursor: 'not-allowed', opacity: 0.5 } : {}}
            >
              Set GREEN
            </button>

            <button
              onClick={() => handleEmergencyOverride(selectedSignal.signalId)}
              className={`btn-emergency ${!hasWriteAccess ? 'read-only' : ''}`}
              disabled={!hasWriteAccess}
              title={!hasWriteAccess ? "Read-only access" : "Requires Emergency Authority"}
              style={!hasWriteAccess ? { cursor: 'not-allowed', opacity: 0.5 } : {}}
            >
              Emergency Override (Green)
            </button>
          </div>
        </div>
      )}

      {Object.keys(elevatedZoneRisk).length > 0 && (
        <div className="zone-risk-elevated">
          <h4>Access Denial Events Recorded</h4>
          <ul>
            {Object.entries(elevatedZoneRisk).map(([zone, risk]) => (
              <li key={zone}>
                {zone} Zone: Risk +{risk} (Unauthorized Access Attempt)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TrafficControl;
