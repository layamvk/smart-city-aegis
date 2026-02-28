import React from 'react';
import { useCityEngine } from '../engine/CityEngine';

const RiskSummary = () => {
    const { globalThreatScore } = useCityEngine();

    const color = globalThreatScore < 30 ? '#00FF64' : globalThreatScore < 60 ? '#FFA726' : '#FF3D3D';
    const label = globalThreatScore < 30 ? 'NORMAL' : globalThreatScore < 60 ? 'ELEVATED' : 'CRITICAL';

    return (
        <div className="risk-summary dashboard-panel" style={{
            padding: '8px 24px',
            borderRadius: '0 0 15px 15px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 180,
            borderTop: 'none'
        }}>
            <div style={{ fontSize: 9, color: '#4B6080', letterSpacing: '0.15em', marginBottom: 2 }}>SECURITY OVERWATCH</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: color, fontFamily: 'monospace' }}>
                    {Math.round(globalThreatScore)}
                </div>
                <div style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#fff',
                    background: color,
                    padding: '2px 8px',
                    borderRadius: 4,
                    boxShadow: `0 0 15px ${color}33`
                }}>
                    {label}
                </div>
            </div>
        </div>
    );
};

export default RiskSummary;
