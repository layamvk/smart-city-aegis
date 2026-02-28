import React from 'react';
import { useCityEngine } from '../engine/CityEngine';
import './ZoneDrawer.css';

const MiniBar = ({ value, color = '#00F0FF' }) => (
    <div className="mini-bar-bg">
        <div className="mini-bar-fg" style={{ width: `${Math.min(100, value)}%`, background: color }} />
    </div>
);

const SparkLine = ({ history = [] }) => {
    const w = 120, h = 30, pad = 2;
    if (history.length < 2) return <div style={{ height: h, opacity: 0.2, fontSize: 9, color: '#4B6080', textAlign: 'center' }}>NO DATA</div>;
    const vals = history.slice(-20);
    const min = Math.min(...vals);
    const max = Math.max(...vals) || 1;
    const pts = vals.map((v, i) => {
        const x = pad + (i / (vals.length - 1)) * (w - pad * 2);
        const y = h - pad - ((v - min) / (max - min)) * (h - pad * 2);
        return `${x},${y}`;
    }).join(' ');
    return (
        <svg width={w} height={h}>
            <polyline points={pts} fill="none" stroke="#00F0FF" strokeWidth="1.5" opacity="0.7" />
        </svg>
    );
};

const ZoneDrawer = ({ zoneId, zone, onClose }) => {
    const { zones, setZones, globalThreatScore } = useCityEngine();
    const z = zones?.[zoneId] || zone || {};
    const riskColor = (z.riskScore || 0) > 70 ? '#FF3D3D' : (z.riskScore || 0) > 40 ? '#FFA500' : '#00FF64';

    // Interdependency constraint: Threat > 70 -> Disable overrides
    const overridesDisabled = globalThreatScore > 70;

    const handleToggleEmergency = () => {
        setZones(prev => ({ ...prev, [zoneId]: { ...prev[zoneId], emergencyActive: !prev[zoneId]?.emergencyActive } }));
    };
    const handleRedistribute = () => {
        setZones(prev => ({ ...prev, [zoneId]: { ...prev[zoneId], gridLoad: Math.max(0, prev[zoneId].gridLoad - 20) } }));
    };
    const handleValveSimulation = () => {
        setZones(prev => ({ ...prev, [zoneId]: { ...prev[zoneId], waterLevel: Math.max(0, prev[zoneId].waterLevel - 15) } }));
    };
    const handleTrafficOverride = () => {
        setZones(prev => ({ ...prev, [zoneId]: { ...prev[zoneId], trafficLoad: Math.max(0, prev[zoneId].trafficLoad - 25) } }));
    };
    const handleLightingBoost = () => {
        setZones(prev => ({ ...prev, [zoneId]: { ...prev[zoneId], lightingLevel: Math.min(100, prev[zoneId].lightingLevel + 30) } }));
    };

    if (!zoneId) return null;

    return (
        <div className={`zone-drawer ${zoneId ? 'open' : ''} dashboard-panel`}>
            <div className="drawer-header">
                <div>
                    <div className="drawer-zone-name">{z.name || zoneId}</div>
                    <div className="drawer-zone-type">{z.type || '—'}</div>
                </div>
                <button className="drawer-close" onClick={onClose}>✕</button>
            </div>

            <div className="drawer-risk">
                <div className="risk-ring" style={{ '--risk': z.riskScore || 0, '--color': riskColor }}>
                    <span style={{ color: riskColor }}>{Math.round(z.riskScore || 0)}</span>
                    <small>RISK</small>
                </div>
                <div className="drawer-status-badge" style={{ background: `${riskColor}22`, color: riskColor, borderColor: riskColor }}>
                    {z.status || 'NORMAL'}
                </div>
            </div>

            <div className="drawer-metrics">
                <div className="d-metric">
                    <label>TRAFFIC DENSITY</label>
                    <span>{Math.round(z.trafficLoad || z.trafficDensity || 0)}%</span>
                    <MiniBar value={z.trafficLoad || z.trafficDensity || 0} color="#00F0FF" />
                </div>
                <div className="d-metric">
                    <label>GRID LOAD</label>
                    <span>{Math.round(z.gridLoad || 0)}%</span>
                    <MiniBar value={z.gridLoad || 0} color="#F59E0B" />
                </div>
                <div className="d-metric">
                    <label>WATER LEVEL</label>
                    <span>{Math.round(z.waterLevel || z.reservoirLevel || 0)}%</span>
                    <MiniBar value={z.waterLevel || z.reservoirLevel || 0} color="#3B82F6" />
                </div>
                <div className="d-metric">
                    <label>LIGHTING</label>
                    <span>{Math.round(z.lightingLevel || 0)}%</span>
                    <MiniBar value={z.lightingLevel || 0} color="#EAB308" />
                </div>
                <div className="d-metric">
                    <label>INCIDENTS</label>
                    <span style={{ color: z.emergencyActive ? '#FF3D3D' : '#00FF64' }}>{z.emergencyActive ? 1 : 0}</span>
                </div>
            </div>

            <div className="drawer-section">
                <div className="drawer-section-title">RISK HEAT METER</div>
                <div style={{ height: 4, background: `linear-gradient(to right, #00FF64 ${Math.min(100, z.riskScore || 0)}%, #FF3D3D)` }} />
            </div>

            <div className="drawer-section">
                <div className="drawer-section-title">RISK TREND</div>
                <div style={{ padding: '8px 0' }}>
                    <SparkLine history={z.riskHistory || []} />
                </div>
            </div>

            <div className="drawer-section">
                <div className="drawer-section-title">ZONE CONTROLS</div>
                {overridesDisabled && <div style={{ fontSize: 10, color: '#FF3D3D', marginBottom: 8 }}>⚠ MANUAL OVERRIDES DISABLED (HIGH THREAT)</div>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <button disabled={overridesDisabled} onClick={handleToggleEmergency} style={{ background: z.emergencyActive ? '#FF3D3D' : 'rgba(255,50,50,0.2)', color: '#FFF', border: '1px solid #FF3D3D', padding: '6px', borderRadius: 4, cursor: overridesDisabled ? 'not-allowed' : 'pointer' }}>
                        {z.emergencyActive ? 'DISABLE EMERGENCY MODE' : 'ENABLE EMERGENCY MODE'}
                    </button>
                    <button disabled={overridesDisabled} onClick={handleRedistribute} style={{ background: 'rgba(245,158,11,0.2)', color: '#F59E0B', border: '1px solid #F59E0B', padding: '6px', borderRadius: 4, cursor: overridesDisabled ? 'not-allowed' : 'pointer' }}>
                        REDISTRIBUTE LOAD
                    </button>
                    <button disabled={overridesDisabled} onClick={handleValveSimulation} style={{ background: 'rgba(59,130,246,0.2)', color: '#3B82F6', border: '1px solid #3B82F6', padding: '6px', borderRadius: 4, cursor: overridesDisabled ? 'not-allowed' : 'pointer' }}>
                        SIMULATE VALVES
                    </button>
                    <button disabled={overridesDisabled} onClick={handleTrafficOverride} style={{ background: 'rgba(0,240,255,0.2)', color: '#00F0FF', border: '1px solid #00F0FF', padding: '6px', borderRadius: 4, cursor: overridesDisabled ? 'not-allowed' : 'pointer' }}>
                        TRAFFIC OVERRIDE
                    </button>
                    <button disabled={overridesDisabled} onClick={handleLightingBoost} style={{ background: 'rgba(234,179,8,0.2)', color: '#EAB308', border: '1px solid #EAB308', padding: '6px', borderRadius: 4, cursor: overridesDisabled ? 'not-allowed' : 'pointer' }}>
                        BOOST LIGHTING
                    </button>
                </div>
            </div>

            <div className="drawer-section">
                <div className="drawer-section-title">PREDICTIVE CONGESTION PROJECTION (+1H)</div>
                <div style={{ color: '#E6F1FF', fontSize: 11, fontWeight: 'bold' }}>
                    {Math.min(100, Math.round((z.trafficDensity || 0) * 1.2))}%
                    <span style={{ color: '#FF3D3D', marginLeft: 8 }}>▲ WARNING</span>
                </div>
            </div>

            <div className="drawer-footer">
                <span className="drawer-coord">18 ZONES MONITORED</span>
                <span className="drawer-live">⬤ LIVE</span>
            </div>
        </div>
    );
};

export default ZoneDrawer;
