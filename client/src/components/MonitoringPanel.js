import React, { useState, useEffect } from 'react';
import api from '../services/api';

const MonitoringPanel = () => {
  const [data, setData] = useState({
    totalApiCalls: 0,
    blockedAttempts: 0,
    failedLogins: 0,
    threatScore: 0,
    totalThreats: 0,
    severityBreakdown: {}
  });
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const [auditRes, threatRes] = await Promise.all([
        api.get('/monitoring/audit'),
        api.get('/threat/status')
      ]);

      const audits = auditRes.data;
      const threats = threatRes.data;

      const totalApiCalls = audits.length;
      const blockedAttempts = audits.filter(a => a.status === 'Denied').length;
      const failedLogins = audits.filter(a => a.reason && a.reason.includes('Invalid credentials')).length;

      setData({
        totalApiCalls,
        blockedAttempts,
        failedLogins,
        threatScore: threats.threatScore,
        totalThreats: threats.totalThreats,
        severityBreakdown: threats.severityBreakdown
      });
      setError(null);
    } catch (err) {
      setError('Failed to load monitoring data');
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getMetricStyle = (value, threshold, color) => ({
    color: value > threshold ? color : '#00bcd4'
  });

  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#1e1e1e', color: '#fff', borderRadius: '8px' }}>
        <h3>Monitoring Panel</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#1e1e1e', color: '#fff', borderRadius: '8px', height: '100%', overflowY: 'auto' }}>
      <h3>Monitoring Dashboard</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
        <div style={{ backgroundColor: '#333', padding: '15px', borderRadius: '8px' }}>
          <h4>Total API Calls</h4>
          <p style={getMetricStyle(data.totalApiCalls, 1000, '#00bcd4')}>{data.totalApiCalls}</p>
        </div>
        <div style={{ backgroundColor: '#333', padding: '15px', borderRadius: '8px' }}>
          <h4>Blocked Attempts</h4>
          <p style={getMetricStyle(data.blockedAttempts, 10, '#ff9800')}>{data.blockedAttempts}</p>
        </div>
        <div style={{ backgroundColor: '#333', padding: '15px', borderRadius: '8px' }}>
          <h4>Failed Logins</h4>
          <p style={getMetricStyle(data.failedLogins, 5, '#ff9800')}>{data.failedLogins}</p>
        </div>
        <div style={{ backgroundColor: '#333', padding: '15px', borderRadius: '8px' }}>
          <h4>Threat Score</h4>
          <p style={getMetricStyle(data.threatScore, 50, '#f44336')}>{data.threatScore}</p>
        </div>
        <div style={{ backgroundColor: '#333', padding: '15px', borderRadius: '8px' }}>
          <h4>Total Threats</h4>
          <p style={getMetricStyle(data.totalThreats, 10, '#00bcd4')}>{data.totalThreats}</p>
        </div>
        <div style={{ backgroundColor: '#333', padding: '15px', borderRadius: '8px' }}>
          <h4>Severity Breakdown</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {Object.entries(data.severityBreakdown).map(([severity, count]) => (
              <li key={severity} style={{ marginBottom: '5px' }}>
                {severity}: <span style={getMetricStyle(count, 5, '#f44336')}>{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MonitoringPanel;
