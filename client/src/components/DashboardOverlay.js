import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCityEngine } from '../engine/CityEngine';
import TopBar from './TopBar';
import RightPanel from './RightPanel';
import InfrastructureSummary from './InfrastructureSummary';
import InfrastructureSummaryBar from './InfrastructureSummaryBar';
import LiveEventFeed from './LiveEventFeed';
import ZoneDetails from './ZoneDetails';
import RiskSummary from './RiskSummary';

// Management Subsystems
import WaterManagement from './WaterControl';
import TrafficControl from './TrafficControl';
import GridManagement from './GridControl';
import StreetLightControl from './StreetLightControl';

// Digital Twin Specialized Panels
import TopologyPanel from './TopologyPanel';
import SimulationPanel from './SimulationPanel';
import DigitalTwinStats from './DigitalTwinStats';

const DashboardOverlay = () => {
    const { user, logout } = useAuth();
    const { globalThreatScore, deviceTrustScore } = useCityEngine();
    const [activeControl, setActiveControl] = useState('Traffic');

    // Mapping to requested nomenclature
    const LiveEventsPanel = LiveEventFeed;
    const SystemDiagnostics = RightPanel;
    const SectorRiskAnalysis = RiskSummary;
    const InfrastructureOverview = InfrastructureSummary;
    const ZoneDetailsPanel = ZoneDetails;

    const controlTabs = [
        { id: 'Traffic', label: '🚦 Traffic', component: TrafficControl },
        { id: 'Water', label: '💧 Water', component: WaterManagement },
        { id: 'Grid', label: '⚡ Grid', component: GridManagement },
        { id: 'Lights', label: '💡 Lights', component: StreetLightControl }
    ];

    const ActiveComponent = controlTabs.find(t => t.id === activeControl)?.component || TrafficControl;

    return (
        <div className="dashboard-overlay">
            <div className="top-bar">
                <TopBar
                    threatScore={globalThreatScore}
                    deviceTrust={deviceTrustScore}
                    user={user}
                    onLogout={logout}
                />
            </div>

            <SectorRiskAnalysis />
            <LiveEventsPanel />
            <InfrastructureOverview />

            <div className="right-panel">
                <SystemDiagnostics />

                {/* Unified Management Subsystem */}
                <div className="dashboard-panel" style={{ marginTop: 20, padding: 15 }}>
                    <div style={{ fontSize: 9, color: '#4B6080', letterSpacing: '0.15em', marginBottom: 15, display: 'flex', justifyContent: 'space-between' }}>
                        <span>SUBSYSTEM MANAGEMENT</span>
                        <span style={{ color: '#00F0FF' }}>{activeControl.toUpperCase()} ACTIVE</span>
                    </div>

                    <div style={{ display: 'flex', gap: 5, marginBottom: 20, overflowX: 'auto', paddingBottom: 5 }}>
                        {controlTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveControl(tab.id)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: 4,
                                    border: '1px solid',
                                    borderColor: activeControl === tab.id ? '#00F0FF' : 'rgba(255,255,255,0.1)',
                                    background: activeControl === tab.id ? 'rgba(0,240,255,0.1)' : 'transparent',
                                    color: activeControl === tab.id ? '#00F0FF' : '#8899BB',
                                    fontSize: 10,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="subsystem-view" style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: 5 }}>
                        <ActiveComponent />
                    </div>
                </div>

                <TopologyPanel />
                <SimulationPanel />
                <DigitalTwinStats />
            </div>

            <ZoneDetailsPanel />

            <div className="bottom-stats">
                <InfrastructureSummaryBar />
            </div>
        </div>
    );
};

export default DashboardOverlay;
