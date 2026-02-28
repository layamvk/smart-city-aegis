import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/SecurityBanner.css';

const SecurityBanner = () => {
  const { globalThreatScore, deviceTrustScore, rateLimitAlert, user } = useAuth();
  const [threatMode, setThreatMode] = useState(false);
  const [lowTrustMode, setLowTrustMode] = useState(false);

  useEffect(() => {
    setThreatMode(globalThreatScore > 80);
  }, [globalThreatScore]);

  useEffect(() => {
    setLowTrustMode(deviceTrustScore < 40);
  }, [deviceTrustScore]);

  const getThreatLevel = (score) => {
    if (score < 30) return { level: 'LOW', color: '#00cc44' };
    if (score < 60) return { level: 'MEDIUM', color: '#ffaa00' };
    if (score < 80) return { level: 'HIGH', color: '#ff6600' };
    return { level: 'CRITICAL', color: '#ff3333' };
  };

  const threatInfo = getThreatLevel(globalThreatScore);

  return (
    <>
      {threatMode && (
        <div className="threat-banner threat-critical">
          <div className="banner-content">
            <span className="banner-icon">⚠️</span>
            <span className="banner-text">SYSTEM ELEVATED — High Risk Mode Active</span>
            <span className="banner-score">Threat Level: {threatInfo.level} ({globalThreatScore.toFixed(0)})</span>
          </div>
        </div>
      )}

      {lowTrustMode && (
        <div className="threat-banner trust-warning">
          <div className="banner-content">
            <span className="banner-icon">🔐</span>
            <span className="banner-text">Device Trust Below Threshold ({deviceTrustScore}%)</span>
            <span className="banner-detail">Sensitive actions restricted</span>
          </div>
        </div>
      )}

      {rateLimitAlert && (
        <div className="threat-banner rate-limit-alert">
          <div className="banner-content">
            <span className="banner-icon">🚫</span>
            <span className="banner-text">Rate Limit Triggered - Too many requests</span>
          </div>
        </div>
      )}

      <div className="security-status-bar">
        <div className="status-item threat-status">
          <span className="status-label">Threat Score</span>
          <div className="status-indicator">
            <span 
              className="score-value"
              style={{ color: threatInfo.color }}
            >
              {globalThreatScore.toFixed(0)}
            </span>
            <div className="score-bar">
              <div 
                className="score-fill"
                style={{ 
                  width: `${globalThreatScore}%`,
                  backgroundColor: threatInfo.color
                }}
              />
            </div>
          </div>
        </div>

        <div className="status-item trust-status">
          <span className="status-label">Device Trust</span>
          <div className="status-indicator">
            <span 
              className="score-value"
              style={{ 
                color: deviceTrustScore < 40 ? '#ff3333' : deviceTrustScore < 70 ? '#ffaa00' : '#00cc44'
              }}
            >
              {deviceTrustScore}%
            </span>
            <div className="score-bar">
              <div 
                className="score-fill"
                style={{ 
                  width: `${deviceTrustScore}%`,
                  backgroundColor: deviceTrustScore < 40 ? '#ff3333' : deviceTrustScore < 70 ? '#ffaa00' : '#00cc44'
                }}
              />
            </div>
          </div>
        </div>

        <div className="status-item user-info">
          <span className="status-label">User</span>
          <span className="user-detail">
            {user?.username} - {user?.role}
          </span>
        </div>
      </div>
    </>
  );
};

export default SecurityBanner;
