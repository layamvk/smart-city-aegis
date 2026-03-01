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
                <div className="dashboard-panel" style={{ marginTop: 24, padding: 20 }}>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 16, display: 'flex', justifyContent: 'space-between', fontWeight: 600, textTransform: 'uppercase' }}>
                        <span>SUBSYSTEM MANAGEMENT</span>
                        <span style={{ color: 'var(--accent)' }}>{activeControl.toUpperCase()} ACTIVE</span>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 8 }}>
                        {controlTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveControl(tab.id)}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid',
                                    borderColor: activeControl === tab.id ? 'var(--accent)' : 'var(--border)',
                                    background: activeControl === tab.id ? 'var(--accent-muted)' : 'transparent',
                                    color: activeControl === tab.id ? 'var(--accent)' : 'var(--text-muted)',
                                    fontSize: 10,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all var(--duration) var(--ease)',
                                    textTransform: 'uppercase'
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
