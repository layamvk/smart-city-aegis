import React, { useState } from 'react';
import { useCityEngine } from '../engine/CityEngine';
import './ManagementPages.css';
import './GridPage.css';

const GRID_REGIONS = {
    'North Grid': [
        { id: 'SUB-N1', name: 'Madhavaram', load: 74, output: 620, stability: 92, risk: 'Optimal', sync: '13:04:10' },
        { id: 'SUB-N2', name: 'Redhills', load: 89, output: 735, stability: 70, risk: 'Critical', sync: '13:04:05' },
        { id: 'SUB-N3', name: 'Ambattur', load: 67, output: 540, stability: 85, risk: 'Moderate', sync: '13:03:58' },
    ],
    'Central Grid': [
        { id: 'SUB-C1', name: 'Egmore Main', load: 82, output: 670, stability: 78, risk: 'Moderate', sync: '13:04:12' },
        { id: 'SUB-C2', name: 'T Nagar', load: 91, output: 755, stability: 62, risk: 'Critical', sync: '13:04:07' },
        { id: 'SUB-C3', name: 'Adyar Central', load: 58, output: 475, stability: 91, risk: 'Optimal', sync: '13:04:01' },
    ],
    'South Grid': [
        { id: 'SUB-S1', name: 'Guindy', load: 77, output: 630, stability: 80, risk: 'Moderate', sync: '13:04:15' },
        { id: 'SUB-S2', name: 'Velachery', load: 63, output: 510, stability: 88, risk: 'Optimal', sync: '13:04:09' },
        { id: 'SUB-S3', name: 'Tambaram', load: 71, output: 580, stability: 83, risk: 'Moderate', sync: '13:03:55' },
        { id: 'SUB-S4', name: 'OMR South', load: 52, output: 420, stability: 94, risk: 'Optimal', sync: '13:03:48' },
    ],
};

const RISK_COLORS = { Optimal: '#2ECC71', Moderate: '#F5B041', Critical: '#FF5C5C' };

const SUMMARY_METRICS = [
    { label: 'Total Substations', value: 10 },
    { label: 'Total Load', value: '7.8 GW' },
    { label: 'Peak Capacity', value: '9.2 GW' },
    { label: 'Critical Nodes', value: 2, critical: true },
    { label: 'Avg Stability', value: '86%' },
];

const GridPage = () => {
    const { grid, updateGrid, triggerScenario } = useCityEngine();
    const [expandedRegion, setExpandedRegion] = useState('North Grid');

    return (
        <div className="management-page">
            <header className="mgmt-header">
                <div>
                    <h2>Electricity Grid Management</h2>
                    <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                        <span className="system-pill">SCADA Grid Monitoring Active</span>
                        <span className="system-pill danger">2 Critical Nodes</span>
                    </div>
                </div>
                <div className="mgmt-actions">
                    <button onClick={() => triggerScenario('BLACKOUT')} className="btn-danger">Blackout Sim</button>
                    <button onClick={() => triggerScenario('CYBER_ATTACK')} className="btn-secondary">Secure Grid</button>
                </div>
            </header>

            {/* Summary Metrics */}
            <div className="grid-summary-bar">
                {SUMMARY_METRICS.map(m => (
                    <div key={m.label} className="grid-summary-metric">
                        <label>{m.label.toUpperCase()}</label>
                        <span style={{ color: m.critical ? '#FF5C5C' : '#E6EDF3' }}>{m.value}</span>
                    </div>
                ))}
            </div>

            <div className="grid-layout">
                <div className="grid-main">
                    <h3 className="section-label">Regional Substation Overview</h3>
                    <div className="grid-regions">
                        {Object.entries(GRID_REGIONS).map(([region, substations]) => {
                            const isOpen = expandedRegion === region;
                            const avgLoad = Math.round(substations.reduce((a, s) => a + s.load, 0) / substations.length);
                            const hasCritical = substations.some(s => s.risk === 'Critical');
                            return (
                                <div key={region} className={`grid-region-accordion ${isOpen ? 'open' : ''}`}
                                    style={{ borderLeft: `3px solid ${hasCritical ? '#FF5C5C' : '#2ECC71'}` }}>
                                    <div className="grid-region-header" onClick={() => setExpandedRegion(isOpen ? null : region)}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div className="status-dot pulsing"
                                                    style={{ background: hasCritical ? '#FF5C5C' : '#2ECC71' }} />
                                                <span className="grid-region-name">{region}</span>
                                            </div>
                                            <div className="grid-region-meta">
                                                <span>UNITS: {substations.length}</span>
                                                <span>AVG LOAD: {avgLoad}%</span>
                                            </div>
                                        </div>
                                        <div className="status-badge" style={{
                                            color: hasCritical ? '#FF5C5C' : '#2ECC71',
                                            borderColor: hasCritical ? 'rgba(255,92,92,0.3)' : 'rgba(46,204,113,0.3)'
                                        }}>
                                            {hasCritical ? 'CRITICAL' : 'STABLE'}
                                        </div>
                                    </div>
                                    {isOpen && (
                                        <div className="grid-region-content">
                                            <div className="substations-grid">
                                                {substations.map(sub => (
                                                    <div key={sub.id} className="substation-card"
                                                        style={{ borderLeft: `3px solid ${RISK_COLORS[sub.risk]}` }}>
                                                        <div className="sub-header">
                                                            <div>
                                                                <div className="sub-name">{sub.name}</div>
                                                                <div className="sub-id">{sub.id} · Sync {sub.sync}</div>
                                                            </div>
                                                            <div className="sub-risk" style={{ color: RISK_COLORS[sub.risk] }}>
                                                                {sub.risk.toUpperCase()}
                                                            </div>
                                                        </div>
                                                        <div className="sub-load-row">
                                                            <span className="metric-label">LOAD</span>
                                                            <span className="metric-val">{sub.load}%</span>
                                                        </div>
                                                        <div className="res-bar-bg">
                                                            <div className="res-bar-fg" style={{
                                                                width: `${sub.load}%`,
                                                                background: sub.load > 85 ? '#FF5C5C' : sub.load > 70 ? '#F5B041' : '#4DA3FF'
                                                            }} />
                                                        </div>
                                                        <div className="sub-stats">
                                                            <div className="res-metric"><label>OUTPUT</label><span>{sub.output} <small>MW</small></span></div>
                                                            <div className="res-metric"><label>STABILITY</label><span>{sub.stability}%</span></div>
                                                        </div>
                                                        <div className="sub-actions">
                                                            <button className="btn-xs"
                                                                onClick={() => updateGrid(sub.id, { load: Math.max(0, sub.load - 10) })}>
                                                                SHED LOAD
                                                            </button>
                                                            <button className="btn-xs"
                                                                onClick={() => updateGrid(sub.id, { status: 'ISOLATED' })}>
                                                                ISOLATE
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <aside className="grid-sidebar">
                    <section className="mgmt-section">
                        <h3>Grid Performance</h3>
                        <div className="grid-perf-card">
                            <div className="hz-display">{grid.gridFrequency} <span>Hz</span></div>
                            <div className="hz-label">System Frequency</div>
                        </div>
                        <div className="feeder-stats-v2">
                            <div className="feeder-stat-row">
                                <span>Active Feeders</span>
                                <span>{grid.feeders.filter(f => f.status === 'CLOSED').length} / {grid.feeders.length}</span>
                            </div>
                            <div className="feeder-stat-row">
                                <span>Grid Status</span>
                                <span style={{ color: '#2ECC71' }}>NORMAL</span>
                            </div>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
};

export default GridPage;
