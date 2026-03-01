import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/StreetLights.css';

const StreetLightControl = () => {
  const { user, globalThreatScore } = useAuth();
  const [zones, setZones] = useState({});
  const [selectedZone, setSelectedZone] = useState(null);
  const [brightnessAdjust, setBrightnessAdjust] = useState('');

  const initialZones = useMemo(() => ({
    North: { brightness: 85, autoMode: true, energyUsage: 2340 },
    South: { brightness: 75, autoMode: true, energyUsage: 2100 },
    East: { brightness: 90, autoMode: true, energyUsage: 2650 },
    West: { brightness: 70, autoMode: false, energyUsage: 1950 },
    Central: { brightness: 95, autoMode: true, energyUsage: 2800 },
  }), []);

  const simulateEnergyUsage = useCallback(() => {
    const updated = {};
    Object.entries(initialZones).forEach(([zone, data]) => {
      updated[zone] = {
        ...data,
        brightness: Math.max(20, Math.min(100, data.brightness + (Math.random() - 0.5) * 3)),
        energyUsage: Math.max(1500, data.brightness * 30 + Math.random() * 200)
      };
    });
    return updated;
  }, [initialZones]);

  useEffect(() => {
    setZones(simulateEnergyUsage());
    const interval = setInterval(() => {
      setZones(simulateEnergyUsage());
    }, 5000);
    return () => clearInterval(interval);
  }, [simulateEnergyUsage]);

  const handleBrightnessChange = (zone, brightness) => {
    const newBrightness = Math.max(20, Math.min(100, brightness));
    setZones(prev => ({
      ...prev,
      [zone]: {
        ...prev[zone],
        brightness: newBrightness,
        energyUsage: newBrightness * 30 + (Math.random() * 200)
      }
    }));
  };

  const handleEnergySave = (zone) => {
    setZones(prev => ({
      ...prev,
      [zone]: {
        ...prev[zone],
        autoMode: !prev[zone].autoMode
      }
    }));
  };

  const getGlowIntensity = (brightness) => {
    return Math.max(0.2, brightness / 100);
  };

  const getBrightnessColor = (brightness) => {
    if (brightness > 80) return '#ffff00';
    if (brightness > 50) return '#ffcc00';
    return '#ff9900';
  };

  const zoneList = Object.keys(initialZones);

  return (
    <div className="street-lights-module">
      <div className="module-header">
        <h3>Street Light Control System</h3>
        <span className="energy-mode">Smart Lighting Active</span>
      </div>

      <div className="zones-display">
        {zoneList.map(zone => (
          <div
            key={zone}
            className={`zone-light-card ${selectedZone === zone ? 'selected' : ''}`}
            onClick={() => setSelectedZone(zone)}
          >
            <div
              className="light-preview"
              style={{
                backgroundColor: getBrightnessColor(zones[zone]?.brightness || 0),
                opacity: getGlowIntensity(zones[zone]?.brightness || 0),
                boxShadow: `0 0 ${zones[zone]?.brightness || 0}px ${getBrightnessColor(zones[zone]?.brightness || 0)}cc`
              }}
            />
            <div className="zone-label">{zone}</div>
            <div className="brightness-info">
              {zones[zone]?.brightness.toFixed(0)}%
            </div>
          </div>
        ))}
      </div>

      {selectedZone && zones[selectedZone] && (
        <div className="light-detail-panel">
          <h4>{selectedZone} Zone Lighting</h4>
          <div className="detail-info">
            <p><strong>Brightness Level:</strong> {zones[selectedZone].brightness.toFixed(0)}%</p>
            <p><strong>Auto Mode:</strong> {zones[selectedZone].autoMode ? 'Enabled' : 'Manual Control'}</p>
            <p><strong>Energy Usage:</strong> {zones[selectedZone].energyUsage.toFixed(0)} W</p>
          </div>

          <div className="control-section">
            <div className="brightness-slider">
              <label>Brightness Control</label>
              <input
                type="range"
                min="20"
                max="100"
                value={zones[selectedZone].brightness}
                onChange={(e) => handleBrightnessChange(selectedZone, parseFloat(e.target.value))}
                className="slider"
              />
              <span className="slider-value">{zones[selectedZone].brightness.toFixed(0)}%</span>
            </div>

            <button
              onClick={() => handleEnergySave(selectedZone)}
              className={`btn-energy-save ${zones[selectedZone].autoMode ? 'enabled' : 'disabled'}`}
            >
              {zones[selectedZone].autoMode ? '⚡ Energy Save: ON' : '⚡ Energy Save: OFF'}
            </button>

            <div className="energy-stats">
              <h5>Energy Metrics</h5>
              <p>Current: {zones[selectedZone].energyUsage.toFixed(0)} W</p>
              <p>Annual: {(zones[selectedZone].energyUsage * 8.76).toFixed(0)} kWh</p>
            </div>
          </div>
        </div>
      )}

      <div className="system-overview">
        <h4>System Overview</h4>
        <div className="overview-grid">
          {zoneList.map(zone => (
            <div key={`overview-${zone}`} className="overview-item">
              <span>{zone}:</span>
              <strong>{zones[zone]?.brightness.toFixed(0)}%</strong>
              <small>{zones[zone]?.energyUsage.toFixed(0)}W</small>
            </div>
          ))}
        </div>
        <div className="total-energy">
          Total Energy: <strong>{Object.values(zones).reduce((a, z) => a + z.energyUsage, 0).toFixed(0)} W</strong>
        </div>
      </div>
    </div>
  );
};

export default StreetLightControl;
