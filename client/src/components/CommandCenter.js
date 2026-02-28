import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import SecurityBanner from './SecurityBanner';
import ZoneMapFixed from './ZoneMapFixed';
import InfrastructureSummary from './InfrastructureSummary';
import SimulationControls from './SimulationControls';
import TrafficControl from './TrafficControl';
import WaterControl from './WaterControl';
import GridControl from './GridControl';
import StreetLightControl from './StreetLightControl';
import EmergencyResponse from './EmergencyResponse';
import ThreatFeed from './ThreatFeed';
import TopBar from './TopBar';
import { getGlobalThreatScore } from '../services/infraAPI';
import '../styles/CommandCenter.css';

const CommandCenter = () => {
  const { globalThreatScore, updateGlobalThreatScore } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [simulationActive, setSimulationActive] = useState(false);

  const fetchThreatScore = useCallback(async () => {
    try {
      const res = await getGlobalThreatScore();
      if (res.data?.threatScore !== undefined) {
        updateGlobalThreatScore(res.data.threatScore);
      }
    } catch (error) {
      console.error('Threat score fetch error:', error);
    }
  }, [updateGlobalThreatScore]);

  useEffect(() => {
    fetchThreatScore();
    const interval = setInterval(fetchThreatScore, 5000);
    return () => clearInterval(interval);
  }, [fetchThreatScore]);

  const handleSimulationEvent = useCallback(async (event) => {
    setSimulationActive(true);
    setTimeout(() => setSimulationActive(false), 2000);
  }, []);

  return (
    <div className={`command-center-enhanced ${globalThreatScore > 80 ? 'threat-elevated' : ''}`}>
      <SecurityBanner />
      <TopBar threatScore={globalThreatScore} />
      
      <nav className="module-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'traffic' ? 'active' : ''}`}
          onClick={() => setActiveTab('traffic')}
        >
          Traffic Control
        </button>
        <button 
          className={`tab-btn ${activeTab === 'water' ? 'active' : ''}`}
          onClick={() => setActiveTab('water')}
        >
          Water Management
        </button>
        <button 
          className={`tab-btn ${activeTab === 'grid' ? 'active' : ''}`}
          onClick={() => setActiveTab('grid')}
        >
          Power Grid
        </button>
        <button 
          className={`tab-btn ${activeTab === 'lights' ? 'active' : ''}`}
          onClick={() => setActiveTab('lights')}
        >
          Street Lights
        </button>
        <button 
          className={`tab-btn ${activeTab === 'emergency' ? 'active' : ''}`}
          onClick={() => setActiveTab('emergency')}
        >
          Emergency
        </button>
        <button 
          className={`tab-btn ${activeTab === 'threats' ? 'active' : ''}`}
          onClick={() => setActiveTab('threats')}
        >
          Security Feeds
        </button>
      </nav>

      <main className="module-content">
        {activeTab === 'overview' && (
          <div className="overview-layout">
            <div className="overview-map">
              <ZoneMapFixed />
            </div>
            <div className="overview-sidebar">
              <InfrastructureSummary />
              <SimulationControls onSimulationEvent={handleSimulationEvent} />
            </div>
          </div>
        )}

        {activeTab === 'traffic' && <TrafficControl globalThreatScore={globalThreatScore} />}
        {activeTab === 'water' && <WaterControl />}
        {activeTab === 'grid' && <GridControl />}
        {activeTab === 'lights' && <StreetLightControl />}
        {activeTab === 'emergency' && <EmergencyResponse />}
        {activeTab === 'threats' && <ThreatFeed />}
      </main>
    </div>
  );
};

export default CommandCenter;
