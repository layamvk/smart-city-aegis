import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/InfrastructureReactions.css';

const InfrastructureReactions = ({ globalThreatScore, deviceTrustScore }) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState([]);

  const createReaction = useCallback((type, severity, message) => {
    const id = Date.now();
    setReactions(prev => [...prev, {
      id,
      type,
      severity,
      message,
      timestamp: new Date()
    }]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    if (globalThreatScore > 80) {
      createReaction('threat', 'critical', 'System elevated to critical threat level');
    }
  }, [globalThreatScore, createReaction]);

  useEffect(() => {
    if (deviceTrustScore < 40) {
      createReaction('trust', 'warning', 'Device trust score below safety threshold');
    }
  }, [deviceTrustScore, createReaction]);

  return (
    <div className="infrastructure-reactions">
      {globalThreatScore > 80 && (
        <div className="reaction-barrier threat-barrier">
          <span className="barrier-icon">🔴</span>
          <span className="barrier-text">SYSTEM IN ELEVATED MODE</span>
        </div>
      )}
      {deviceTrustScore < 40 && (
        <div className="reaction-barrier trust-barrier">
          <span className="barrier-icon">🔐</span>
          <span className="barrier-text">DEVICE TRUST RESTRICTED</span>
        </div>
      )}
      {reactions.map(reaction => (
        <div key={reaction.id} className={`reaction-toast reaction-${reaction.severity}`}>
          {reaction.message}
        </div>
      ))}
    </div>
  );
};

export default InfrastructureReactions;
