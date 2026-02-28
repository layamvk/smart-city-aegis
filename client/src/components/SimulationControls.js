import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/SimulationControls.css';

const SimulationControls = ({ onSimulationEvent }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  if (user?.role !== 'Admin') {
    return null;
  }

  const triggerSimulation = useCallback(async (type, intensity) => {
    setLoading(true);
    try {
      const event = {
        type,
        intensity,
        timestamp: new Date().toISOString()
      };

      if (onSimulationEvent) {
        await onSimulationEvent(event);
      }

      setFeedback(`${type} simulation triggered`);
      setTimeout(() => setFeedback(''), 3000);
    } catch (error) {
      console.error('Simulation error:', error);
      setFeedback('Simulation failed');
    } finally {
      setLoading(false);
    }
  }, [onSimulationEvent]);

  return (
    <div className="simulation-controls">
      <div className="simulation-header">
        <h4>⚙️ Simulation Controls</h4>
        <span className="admin-badge">ADMIN</span>
      </div>

      <div className="simulation-buttons">
        <button
          className="sim-btn attack-btn"
          onClick={() => triggerSimulation('cyberattack', 'high')}
          disabled={loading}
          title="Simulate a cyber attack - increases threat score"
        >
          🎯 Cyber Attack
        </button>

        <button
          className="sim-btn water-btn"
          onClick={() => triggerSimulation('water-leak', 'medium')}
          disabled={loading}
          title="Simulate a water leak - affects water zones"
        >
          💧 Water Leak
        </button>

        <button
          className="sim-btn power-btn"
          onClick={() => triggerSimulation('power-surge', 'high')}
          disabled={loading}
          title="Simulate power surge - impacts grid load"
        >
          ⚡ Power Surge
        </button>

        <button
          className="sim-btn fire-btn"
          onClick={() => triggerSimulation('fire', 'critical')}
          disabled={loading}
          title="Simulate fire emergency - creates incident"
        >
          🔥 Fire Emergency
        </button>
      </div>

      {feedback && (
        <div className="simulation-feedback">
          ✓ {feedback}
        </div>
      )}
    </div>
  );
};

export default SimulationControls;
