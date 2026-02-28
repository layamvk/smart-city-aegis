import React, { useState, useEffect, useCallback } from 'react';
import { getThreatEvents, getAuditLogs } from '../services/infraAPI';
import '../styles/ThreatFeed.css';

const ThreatFeed = () => {
  const [events, setEvents] = useState([]);
  const [filterType, setFilterType] = useState('all');

  const fetchEvents = useCallback(async () => {
    try {
      const [threatsRes, auditRes] = await Promise.all([
        getThreatEvents(),
        getAuditLogs()
      ]);

      const threats = (threatsRes.data || []).map(t => ({
        ...t,
        eventType: 'threat',
        timestamp: t.timestamp || t.createdAt,
        severity: t.severity || 'INFO'
      }));

      const denials = (auditRes.data || [])
        .filter(a => a.status === 'Denied')
        .map(a => ({
          ...a,
          eventType: 'denial',
          timestamp: a.createdAt || a.timestamp,
          severity: 'warning',
          _id: `denial-${a._id}`
        }));

      const combined = [...threats, ...denials].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      ).slice(0, 20);

      setEvents(combined);
    } catch (error) {
      console.error('Events fetch error:', error);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  const getSeverityColor = (severity) => {
    const colors = {
      'critical': '#ff3333',
      'high': '#ff6600',
      'medium': '#ffaa00',
      'low': '#00cc44',
      'info': '#66ccff',
      'warning': '#ffaa00'
    };
    return colors[severity?.toLowerCase()] || '#999';
  };

  const getSeverityIcon = (eventType, severity) => {
    if (eventType === 'denial') return '🚫';
    const icons = {
      'critical': '🔴',
      'high': '🟠',
      'medium': '🟡',
      'low': '🟢',
      'info': '🔵'
    };
    return icons[severity?.toLowerCase()] || '◯';
  };

  const getEventTitle = (event) => {
    if (event.eventType === 'denial') {
      return `Access Denied: ${event.reason}`;
    }
    return event.type || event.description || 'Security Event';
  };

  const getEventDetails = (event) => {
    if (event.eventType === 'denial') {
      return `${event.user} attempted ${event.endpoint}`;
    }
    return event.details || event.description || '';
  };

  const filteredEvents = filterType === 'all' 
    ? events 
    : events.filter(e => e.eventType === filterType);

  return (
    <div className="threat-feed-module">
      <div className="module-header">
        <h3>Security Event Feed</h3>
        <span className="event-count">{filteredEvents.length} Events</span>
      </div>

      <div className="filter-controls">
        <button 
          className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          All Events
        </button>
        <button 
          className={`filter-btn ${filterType === 'threat' ? 'active' : ''}`}
          onClick={() => setFilterType('threat')}
        >
          Threats
        </button>
        <button 
          className={`filter-btn ${filterType === 'denial' ? 'active' : ''}`}
          onClick={() => setFilterType('denial')}
        >
          Access Denials
        </button>
      </div>

      <div className="events-container">
        {filteredEvents.length === 0 ? (
          <div className="no-events">
            <p>No security events in this timeframe</p>
          </div>
        ) : (
          filteredEvents.map((event, index) => (
            <div 
              key={event._id || index}
              className={`event-row event-${event.eventType}`}
              style={{ borderLeftColor: getSeverityColor(event.severity) }}
            >
              <div className="event-severity-icon">
                {getSeverityIcon(event.eventType, event.severity)}
              </div>
              <div className="event-content">
                <div className="event-title">
                  {getEventTitle(event)}
                </div>
                <div className="event-details">
                  {getEventDetails(event)}
                </div>
                <div className="event-metadata">
                  {event.eventType === 'denial' && (
                    <>
                      <span className="meta-badge">Role: {event.role}</span>
                      <span className="meta-badge">IP: {event.ipAddress}</span>
                    </>
                  )}
                  <span className="event-timestamp">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <div className="event-severity-label">
                {event.eventType === 'denial' ? 'DENIED' : event.severity?.toUpperCase()}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="feed-summary">
        <h4>Summary</h4>
        <div className="summary-stats">
          <div className="summary-stat">
            <span>Total Events:</span>
            <strong>{events.length}</strong>
          </div>
          <div className="summary-stat">
            <span>Access Denials:</span>
            <strong>{events.filter(e => e.eventType === 'denial').length}</strong>
          </div>
          <div className="summary-stat">
            <span>Critical Threats:</span>
            <strong>{events.filter(e => e.severity === 'critical').length}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatFeed;
