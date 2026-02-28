import React from 'react';
import { useCityEngine } from '../engine/CityEngine';

const ZoneDetails = () => {
    const { zones } = useCityEngine();

    const zoneList = Object.entries(zones).sort((a, b) => b[1].riskScore - a[1].riskScore);

    return (
        <div className="zone-details dashboard-panel" style={{ padding: 15 }}>
            <div style={{ fontSize: 10, color: '#4B6080', fontWeight: 600, letterSpacing: '0.15em', marginBottom: 15 }}>SECTOR RISK ANALYSIS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {zoneList.map(([id, z]) => {
                    const color = z.riskScore < 30 ? '#00FF64' : z.riskScore < 60 ? '#FFA726' : '#FF3D3D';
                    return (
                        <div key={id} style={{
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: 6,
                            padding: '8px 12px',
                            borderLeft: `3px solid ${color}`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#E6F1FF' }}>{id.toUpperCase()}</span>
                                <span style={{ fontSize: 11, fontWeight: 800, color: color }}>{Math.round(z.riskScore)}%</span>
                            </div>
                            <div style={{ height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 1, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${z.riskScore}%`, background: color }} />
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                                <div style={{ fontSize: 8, color: '#4B6080' }}>⚡ {Math.round(z.gridLoad)}%</div>
                                <div style={{ fontSize: 8, color: '#4B6080' }}>🚗 {Math.round(z.trafficDensity)}%</div>
                                <div style={{ fontSize: 8, color: '#4B6080' }}>💧 {Math.round(z.reservoirLevel)}%</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ZoneDetails;
