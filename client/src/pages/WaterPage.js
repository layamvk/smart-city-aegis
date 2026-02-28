import React, { useState } from 'react';
import { useCityEngine } from '../engine/CityEngine';
import './ManagementPages.css';
import './WaterPage.css';

const WATER_ZONES = {
    'North Zone': [
        { id: 'REDHILLS', name: 'Redhills Reservoir', capacity: 78, inflow: 420, outflow: 390, pressure: 68, quality: 92, status: 'Stable', lastUpdated: '13:04:11' },
        { id: 'MADHAVARAM', name: 'Madhavaram Tank', capacity: 61, inflow: 310, outflow: 295, pressure: 58, quality: 88, status: 'Stable', lastUpdated: '13:04:08' },
    ],
    'Central Zone': [
        { id: 'CHEMBARAMBAKKAM', name: 'Chembarambakkam', capacity: 91, inflow: 580, outflow: 560, pressure: 82, quality: 79, status: 'Critical', lastUpdated: '13:04:15' },
        { id: 'KILPAUK', name: 'Kilpauk Storage', capacity: 55, inflow: 280, outflow: 310, pressure: 74, quality: 85, status: 'Moderate', lastUpdated: '13:03:59' },
    ],
    'South Zone': [
        { id: 'POONDI', name: 'Poondi Reservoir', capacity: 84, inflow: 510, outflow: 480, pressure: 72, quality: 88, status: 'Stable', lastUpdated: '13:04:02' },
        { id: 'TAMBARAM', name: 'Tambaram Tank', capacity: 47, inflow: 230, outflow: 260, pressure: 88, quality: 76, status: 'Critical', lastUpdated: '13:04:19' },
    ],
};

const HYDRAULIC_ALERTS = [
    { id: 'A1', severity: 'critical', message: 'High Pressure Warning', location: 'Tambaram Tank', time: '13:02' },
    { id: 'A2', severity: 'warning', message: 'Valve Malfunction', location: 'Kilpauk Storage', time: '12:58' },
    { id: 'A3', severity: 'warning', message: 'Leakage Detected', location: 'Adyar Sector Pipeline', time: '12:44' },
    { id: 'A4', severity: 'info', message: 'Scheduled Maintenance', location: 'North Zone Feeder', time: '11:30' },
];

const STATUS_COLORS = { Stable: '#2ECC71', Moderate: '#F5B041', Critical: '#FF5C5C' };

const ReservoirCard = ({ res, onFlowChange, flowSpeed }) => {
    const statusColor = STATUS_COLORS[res.status] || '#9AA4B2';
    return (
        <div className="reservoir-card" style={{ borderLeft: `3px solid ${statusColor}` }}>
            <div className="res-header">
                <div>
                    <div className="res-name">{res.name}</div>
                    <span className="res-time">Updated {res.lastUpdated}</span>
                </div>
                <div className="res-status-pill" style={{ color: statusColor, borderColor: `${statusColor}44` }}>
                    {res.status.toUpperCase()}
                </div>
            </div>

            <div className="res-capacity-row">
                <span className="metric-label">CAPACITY</span>
                <span className="metric-val">{res.capacity}%</span>
            </div>
            <div className="res-bar-bg">
                <div className="res-bar-fg" style={{ width: `${res.capacity}%`, background: res.capacity > 85 ? '#FF5C5C' : res.capacity > 60 ? '#F5B041' : '#4DA3FF' }} />
            </div>

            <div className="res-metrics-grid">
                <div className="res-metric"><label>INFLOW</label><span>{res.inflow} <small>ML/day</small></span></div>
                <div className="res-metric"><label>OUTFLOW</label><span>{res.outflow} <small>ML/day</small></span></div>
                <div className="res-metric"><label>PRESSURE</label><span style={{ color: res.pressure > 80 ? '#FF5C5C' : 'inherit' }}>{res.pressure} <small>PSI</small></span></div>
                <div className="res-metric"><label>QUALITY IDX</label><span style={{ color: res.quality > 85 ? '#2ECC71' : '#F5B041' }}>{res.quality}%</span></div>
            </div>

            <div className="flow-control">
                <div className="flow-control-header">
                    <span>Flow Speed Control</span>
                    <span className="flow-val">{flowSpeed}% · Valve {Math.ceil(flowSpeed / 20)}/5</span>
                </div>
                <input
                    type="range" min="0" max="100" value={flowSpeed}
                    className="flow-slider"
                    onClick={e => e.stopPropagation()}
                    onChange={e => { e.stopPropagation(); onFlowChange(res.id, parseInt(e.target.value)); }}
                />
            </div>
        </div>
    );
};

const WaterPage = () => {
    const { triggerScenario } = useCityEngine();
    const [flowSpeeds, setFlowSpeeds] = useState(() => {
        const init = {};
        Object.values(WATER_ZONES).flat().forEach(r => { init[r.id] = 65; });
        return init;
    });

    const handleFlowChange = (id, val) => setFlowSpeeds(prev => ({ ...prev, [id]: val }));

    return (
        <div className="management-page">
            <header className="mgmt-header">
                <div>
                    <h2>Water Infrastructure Command</h2>
                    <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                        <span className="system-pill">Hydraulic SCADA Active</span>
                        <span className="system-pill danger">2 Critical Alerts</span>
                    </div>
                </div>
                <div className="mgmt-actions">
                    <button onClick={() => triggerScenario('FLOOD')} className="btn-danger">Flood Simulation</button>
                    <button onClick={() => triggerScenario('WATER_CUT')} className="btn-secondary">Isolate Mains</button>
                </div>
            </header>

            <div className="water-layout">
                <div className="water-main">
                    {Object.entries(WATER_ZONES).map(([zone, reservoirs]) => (
                        <div key={zone} className="water-zone-group">
                            <div className="zone-group-header">
                                <span className="zone-group-dot" />
                                <span className="zone-group-name">{zone}</span>
                                <span className="zone-group-count">{reservoirs.length} RESERVOIRS</span>
                            </div>
                            <div className="reservoirs-grid">
                                {reservoirs.map(res => (
                                    <ReservoirCard
                                        key={res.id}
                                        res={res}
                                        flowSpeed={flowSpeeds[res.id] ?? 65}
                                        onFlowChange={handleFlowChange}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <aside className="water-sidebar">
                    <section className="mgmt-section">
                        <h3>Hydraulic Alerts</h3>
                        <div className="alerts-list">
                            {HYDRAULIC_ALERTS.map(a => (
                                <div key={a.id} className={`alert-item alert-${a.severity}`}>
                                    <div className={`alert-dot alert-dot-${a.severity}`} />
                                    <div className="alert-body">
                                        <span className="alert-msg">{a.message}</span>
                                        <span className="alert-loc">{a.location}</span>
                                    </div>
                                    <span className="alert-time">{a.time}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mgmt-section" style={{ marginTop: 32 }}>
                        <h3>System Summary</h3>
                        <div className="water-summary-grid">
                            {[
                                { label: 'Total Zones', value: 3 },
                                { label: 'Reservoirs', value: 6 },
                                { label: 'Avg Capacity', value: '69%' },
                                { label: 'Active Alerts', value: 3, highlight: true },
                            ].map(m => (
                                <div key={m.label} className="water-summary-card">
                                    <label>{m.label.toUpperCase()}</label>
                                    <span style={{ color: m.highlight ? '#FF5C5C' : 'inherit' }}>{m.value}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
};

export default WaterPage;
