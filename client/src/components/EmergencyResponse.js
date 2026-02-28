import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEmergencyIncidents, dispatchUnit } from '../services/infraAPI';
import '../styles/EmergencyResponse.css';

const EmergencyResponse = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [dispatchInput, setDispatchInput] = useState('');
  const [pulseIncidents, setPulseIncidents] = useState({});

  const fetchIncidents = useCallback(async () => {
    try {
      const res = await getEmergencyIncidents();
      const data = res.data || [];
      setIncidents(data);

      // Add pulse animation to high severity incidents
      data.forEach(incident => {
        if (incident.type === 'Fire' || incident.severity === 'HIGH') {
          setPulseIncidents(prev => ({
            ...prev,
            [incident._id]: true
          }));
        }
      });
    } catch (error) {
      console.error('Emergency incidents fetch error:', error);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  // Simulate random incident generation
  useEffect(() => {
    const simulationInterval = setInterval(() => {
      if (Math.random() > 0.85) {
        const types = ['Fire', 'Accident', 'Medical'];
        const locations = ['North', 'South', 'East', 'West', 'Central'];
        const newIncident = {
          _id: `INC-${Date.now()}`,
          incidentId: `INC-${Math.floor(Math.random() * 1000)}`,
          type: types[Math.floor(Math.random() * types.length)],
          location: locations[Math.floor(Math.random() * locations.length)],
          status: 'OPEN',
          assignedUnit: null,
          createdAt: new Date()
        };
        setIncidents(prev => [newIncident, ...prev.slice(0, 9)]);
        setPulseIncidents(prev => ({
          ...prev,
          [newIncident._id]: true
        }));
      }
    }, 8000);
    return () => clearInterval(simulationInterval);
  }, []);

  const handleDispatch = async () => {
    if (user?.role !== 'EmergencyAuthority' && user?.role !== 'Admin') {
      return;
    }

    try {
      if (dispatchInput.trim()) {
        await dispatchUnit(selectedIncident.incidentId, dispatchInput);
        setDispatchInput('');
        fetchIncidents();
        setSelectedIncident(null);
      }
    } catch (error) {
      console.error('Dispatch error:', error);
    }
  };

  const handleEscalateSeverity = (incidentId) => {
    setIncidents(prev => prev.map(incident => 
      incident._id === incidentId 
        ? { ...incident, severity: incident.severity === 'HIGH' ? 'CRITICAL' : 'HIGH' }
        : incident
    ));
    setPulseIncidents(prev => ({
      ...prev,
      [incidentId]: true
    }));
  };

  const getIncidentColor = (type) => {
    const colors = {
      'Fire': '#ff3333',
      'Accident': '#ffaa00',
      'Medical': '#ff6699'
    };
    return colors[type] || '#666';
  };

  const getIncidentIcon = (type) => {
    const icons = {
      'Fire': '🔥',
      'Accident': '⚠️',
      'Medical': '🚑'
    };
    return icons[type] || '📍';
  };

  return (
    <div className="emergency-response-module">
      <div className="module-header">
        <h3>Emergency Response System</h3>
        <span className="incident-count">
          {incidents.filter(i => i.status === 'OPEN').length} Active
        </span>
      </div>

      <div className="incidents-list">
        {incidents.length === 0 ? (
          <div className="no-incidents">
            <p>No incidents at this time</p>
          </div>
        ) : (
          incidents.slice(0, 10).map(incident => (
            <div
              key={incident._id}
              className={`incident-card ${selectedIncident?._id === incident._id ? 'selected' : ''} ${pulseIncidents[incident._id] ? 'pulsing' : ''}`}
              onClick={() => setSelectedIncident(incident)}
              style={{ borderLeftColor: getIncidentColor(incident.type) }}
            >
              <div className="incident-type-icon">
                {getIncidentIcon(incident.type)}
              </div>
              <div className="incident-info">
                <h4>{incident.type}</h4>
                <p className="incident-location">{incident.location} Zone</p>
                <p className="incident-status">
                  <span className={`status-badge status-${incident.status.toLowerCase()}`}>
                    {incident.status}
                  </span>
                </p>
                <p className="incident-time">
                  {new Date(incident.createdAt).toLocaleTimeString()}
                </p>
              </div>
              {incident.assignedUnit && (
                <div className="assigned-unit">
                  Unit: {incident.assignedUnit}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {selectedIncident && (
        <div className="incident-detail-panel">
          <h4>{selectedIncident.incidentId} - {selectedIncident.type}</h4>
          <div className="detail-info">
            <p><strong>Type:</strong> {selectedIncident.type}</p>
            <p><strong>Location:</strong> {selectedIncident.location}</p>
            <p><strong>Status:</strong> {selectedIncident.status}</p>
            <p><strong>Assigned Unit:</strong> {selectedIncident.assignedUnit || 'None'}</p>
            <p><strong>Created:</strong> {new Date(selectedIncident.createdAt).toLocaleString()}</p>
          </div>

          {(user?.role === 'EmergencyAuthority' || user?.role === 'Admin') && selectedIncident.status === 'OPEN' ? (
            <div className="dispatch-section">
              <div className="unit-input">
                <input
                  type="text"
                  value={dispatchInput}
                  onChange={(e) => setDispatchInput(e.target.value)}
                  placeholder="Enter unit ID (e.g., EMS-01)"
                />
              </div>
              <div className="dispatch-buttons">
                <button onClick={handleDispatch} className="btn-dispatch">
                  Dispatch Unit
                </button>
                <button 
                  onClick={() => handleEscalateSeverity(selectedIncident._id)}
                  className="btn-escalate"
                >
                  Escalate Severity
                </button>
              </div>
            </div>
          ) : (
            <div className="access-denied-notice">
              <p>Dispatch requires Emergency Authority role</p>
            </div>
          )}
        </div>
      )}

      <div className="incident-statistics">
        <h4>Incident Statistics</h4>
        <div className="stat-grid">
          <div className="stat-item">
            <span>Total Active:</span>
            <strong>{incidents.filter(i => i.status === 'OPEN').length}</strong>
          </div>
          <div className="stat-item">
            <span>Dispatched:</span>
            <strong>{incidents.filter(i => i.status === 'DISPATCHED').length}</strong>
          </div>
          <div className="stat-item">
            <span>Fire Incidents:</span>
            <strong>{incidents.filter(i => i.type === 'Fire').length}</strong>
          </div>
          <div className="stat-item">
            <span>Medical:</span>
            <strong>{incidents.filter(i => i.type === 'Medical').length}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyResponse;
