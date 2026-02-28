import React, { useState, useMemo } from 'react';
import { useCityEngine } from '../engine/CityEngine';
import './ManagementPages.css';

const ZONAL_HIERARCHY = {
    'T SECTOR': {
        status: 'Moderate',
        incidents: 5,
        areas: [
            { name: 'T Nagar Core', load: 82, speed: 21, efficiency: 64, junctions: 12, incidents: 1, risk: 'Red' },
            { name: 'Pondy Bazaar', load: 91, speed: 14, efficiency: 58, junctions: 9, incidents: 2, risk: 'Red' },
            { name: 'CIT Colony', load: 54, speed: 32, efficiency: 78, junctions: 6, incidents: 0, risk: 'Green' },
            { name: 'Kodambakkam High', load: 76, speed: 26, efficiency: 69, junctions: 8, incidents: 1, risk: 'Yellow' },
            { name: 'West Mambalam', load: 63, speed: 30, efficiency: 74, junctions: 7, incidents: 0, risk: 'Green' },
            { name: 'Panagal Park', load: 88, speed: 18, efficiency: 61, junctions: 5, incidents: 2, risk: 'Red' },
            { name: 'Burkit Road', load: 59, speed: 33, efficiency: 81, junctions: 4, incidents: 0, risk: 'Green' }
        ]
    },
    'ADYAR SECTOR': {
        status: 'Optimal',
        incidents: 1,
        areas: [
            { name: 'LB Road', load: 71, speed: 28, efficiency: 72, junctions: 10, incidents: 0, risk: 'Yellow' },
            { name: 'Besant Avenue', load: 46, speed: 38, efficiency: 83, junctions: 5, incidents: 0, risk: 'Green' },
            { name: 'Thiruvanmiyur Jnc', load: 79, speed: 24, efficiency: 68, junctions: 9, incidents: 1, risk: 'Yellow' },
            { name: 'ECR Link Road', load: 67, speed: 34, efficiency: 76, junctions: 6, incidents: 0, risk: 'Green' },
            { name: 'Indira Nagar', load: 58, speed: 30, efficiency: 74, junctions: 7, incidents: 0, risk: 'Green' },
            { name: 'Gandhi Nagar', load: 62, speed: 29, efficiency: 71, junctions: 6, incidents: 0, risk: 'Green' }
        ]
    },
    'GUINDY SECTOR': {
        status: 'Critical',
        incidents: 7,
        areas: [
            { name: 'Kathipara Junction', load: 93, speed: 16, efficiency: 52, junctions: 14, incidents: 3, risk: 'Red' },
            { name: 'GST Main Road', load: 84, speed: 22, efficiency: 60, junctions: 11, incidents: 1, risk: 'Yellow' },
            { name: 'Industrial Estate', load: 74, speed: 27, efficiency: 68, junctions: 8, incidents: 0, risk: 'Yellow' },
            { name: 'Saidapet Bridge', load: 89, speed: 19, efficiency: 57, junctions: 9, incidents: 2, risk: 'Red' },
            { name: 'Alandur', load: 66, speed: 31, efficiency: 73, junctions: 7, incidents: 0, risk: 'Green' },
            { name: 'Meenambakkam', load: 71, speed: 25, efficiency: 69, junctions: 6, incidents: 1, risk: 'Yellow' },
            { name: 'Olympia Tech Park', load: 52, speed: 37, efficiency: 81, junctions: 5, incidents: 0, risk: 'Green' },
            { name: 'Race Course Road', load: 47, speed: 39, efficiency: 85, junctions: 4, incidents: 0, risk: 'Green' }
        ]
    },
    'ANNA SECTOR': {
        status: 'Optimal',
        incidents: 0,
        areas: [
            { name: 'Anna Nagar West', load: 42, speed: 42, efficiency: 88, junctions: 8, incidents: 0, risk: 'Green' },
            { name: 'Shanthi Colony', load: 58, speed: 31, efficiency: 74, junctions: 6, incidents: 0, risk: 'Green' }
        ]
    },
    'PORUR SECTOR': {
        status: 'Moderate',
        incidents: 2,
        areas: [
            { name: 'Mount Poonamallee', load: 74, speed: 28, efficiency: 68, junctions: 7, incidents: 1, risk: 'Yellow' },
            { name: 'Vanagaram Road', load: 68, speed: 29, efficiency: 71, junctions: 5, incidents: 1, risk: 'Yellow' }
        ]
    },
    'OMR SECTOR': {
        status: 'Moderate',
        incidents: 3,
        areas: [
            { name: 'Sholinganallur', load: 78, speed: 22, efficiency: 65, junctions: 11, incidents: 2, risk: 'Yellow' },
            { name: 'Thoraipakkam', load: 65, speed: 34, efficiency: 72, junctions: 9, incidents: 1, risk: 'Green' }
        ]
    },
    'EGMORE SECTOR': {
        status: 'Optimal',
        incidents: 1,
        areas: [
            { name: 'Railway Terminal', load: 38, speed: 45, efficiency: 91, junctions: 10, incidents: 0, risk: 'Green' },
            { name: 'Pantheon Road', load: 52, speed: 33, efficiency: 79, junctions: 6, incidents: 1, risk: 'Green' }
        ]
    }
};

const RISK_COLORS = {
    Red: '#FF3D3D',
    Yellow: '#FFBF00',
    Green: '#00FF64'
};

const AreaCard = ({ area }) => {
    return (
        <div className="area-control-card" style={{ borderLeft: `4px solid ${RISK_COLORS[area.risk]}` }}>
            <div className="area-card-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="status-dot" style={{ background: RISK_COLORS[area.risk], boxShadow: `0 0 10px ${RISK_COLORS[area.risk]}` }} />
                        <span className="area-name">{area.name}</span>
                    </div>
                    <span className="area-sub">ACTIVE JUNCTIONS: {area.junctions} | INCIDENTS: {area.incidents}</span>
                </div>
                <div className="area-risk-badge" style={{ color: RISK_COLORS[area.risk] }}>{area.risk.toUpperCase()}</div>
            </div>

            <div className="area-metrics-grid">
                <div className="area-metric">
                    <div className="metric-top">
                        <label>TRAFFIC LOAD</label>
                        <span>{area.load}%</span>
                    </div>
                    <div className="area-bar-bg">
                        <div className="area-bar-fg" style={{ width: `${area.load}%`, background: area.load > 80 ? '#FF3D3D' : area.load > 60 ? '#FFBF00' : '#00FF64' }} />
                    </div>
                </div>
                <div className="area-stats-row">
                    <div className="area-stat">
                        <label>AVG SPEED</label>
                        <span style={{ color: area.speed < 20 ? '#FF3D3D' : '#fff' }}>{area.speed} <small>KM/H</small></span>
                    </div>
                    <div className="area-stat">
                        <label>EFFICIENCY</label>
                        <span>{area.efficiency}%</span>
                    </div>
                    <div className="mini-trend">
                        <svg width="40" height="15" viewBox="0 0 40 15">
                            <path d="M0,10 L8,8 L16,12 L24,5 L32,7 L40,2" fill="none" stroke={RISK_COLORS[area.risk]} strokeWidth="1.5" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TrafficPage = () => {
    const { traffic, triggerScenario } = useCityEngine();
    const [expandedSector, setExpandedSector] = useState('T SECTOR');

    const totalIncidents = useMemo(() => {
        return Object.values(ZONAL_HIERARCHY).reduce((acc, s) => acc + s.incidents, 0);
    }, []);

    return (
        <div className="management-page traffic-upgrade">
            <header className="mgmt-header">
                <div>
                    <h2>TRAFFIC INFRASTRUCTURE MANAGEMENT</h2>
                    <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                        <span className="system-pill">LIVE ANALYTICS OVERLAY</span>
                        <span className="system-pill danger">SYSTEM INCIDENTS: {totalIncidents}</span>
                    </div>
                </div>
                <div className="mgmt-actions">
                    <button onClick={() => triggerScenario('STRESS_TEST')} className="btn-secondary">STRESS TEST</button>
                    <button onClick={() => triggerScenario('GRIDLOCK')} className="btn-danger">SIMULATE GRIDLOCK</button>
                </div>
            </header>

            <div className="mgmt-grid">
                <section className="mgmt-section junctions zonal-corridors">
                    <h3>ZONAL CORRIDORS</h3>
                    <div className="sector-accordion-container">
                        {Object.entries(ZONAL_HIERARCHY).map(([sectorName, data], i) => {
                            const isOpen = expandedSector === sectorName;
                            const avgLoad = Math.round(data.areas.reduce((acc, a) => acc + a.load, 0) / data.areas.length);
                            const riskColor = data.status === 'Critical' ? '#FF3D3D' : data.status === 'Moderate' ? '#FFBF00' : '#00FF64';

                            return (
                                <div key={sectorName} className={`sector-accordion ${isOpen ? 'open' : ''}`} style={{ borderLeft: `4px solid ${riskColor}` }}>
                                    <div className="sector-header" onClick={() => setExpandedSector(isOpen ? null : sectorName)}>
                                        <div className="sector-info">
                                            <div className="sector-title-row">
                                                <div className="status-dot pulsing" style={{ background: riskColor }} />
                                                <span className="sector-name">{sectorName}</span>
                                            </div>
                                            <div className="sector-stats-summary">
                                                <span>AREAS: {data.areas.length}</span>
                                                <span>LOAD: {avgLoad}%</span>
                                                <span style={{ color: data.incidents > 0 ? '#FF3D3D' : '#9CA3AF' }}>INCIDENTS: {data.incidents}</span>
                                            </div>
                                        </div>
                                        <div className="sector-status-badge" style={{ background: `${riskColor}22`, color: riskColor }}>
                                            {data.status.toUpperCase()}
                                        </div>
                                    </div>

                                    {isOpen && (
                                        <div className="sector-content">
                                            <div className="areas-grid">
                                                {data.areas.map((area, idx) => (
                                                    <AreaCard key={idx} area={area} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="mgmt-section corridors">
                    <h3>CORRIDOR FLOW STATUS</h3>
                    <div className="corridors-list">
                        {traffic.corridors.map(c => (
                            <div key={c.id} className="corridor-card-v2">
                                <div className="corridor-meta">
                                    <span className="c-id">{c.id}</span>
                                    <span className="c-speed">{c.speed} <small>KM/H</small></span>
                                </div>
                                <div className="corridor-bar-bg">
                                    <div className="corridor-bar-fg" style={{
                                        width: `${c.load}%`,
                                        background: `linear-gradient(90deg, #6366f1, ${c.load > 80 ? '#FF3D3D' : '#00FF64'})`
                                    }} />
                                </div>
                                <div className="corridor-labels">
                                    <span>CONGESTION: {c.load}%</span>
                                    <span>TREND: STABLE</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default TrafficPage;
