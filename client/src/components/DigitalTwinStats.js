import React from 'react';
import { useCityEngine } from '../engine/CityEngine';

const DigitalTwinStats = () => {
    const { summary } = useCityEngine();

    return (
        <div className="dashboard-panel" style={{ padding: 15, marginTop: 15 }}>
            <div style={{ fontSize: 9, color: '#4B6080', letterSpacing: '0.15em', marginBottom: 15 }}>SYSTEM HEALTH RADAR</div>

            <div style={{ position: 'relative', width: '100%', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Simple Radar Mockup */}
                <div style={{ width: 100, height: 100, border: '1px solid rgba(0,240,255,0.1)', borderRadius: '50%', position: 'absolute' }} />
                <div style={{ width: 60, height: 60, border: '1px solid rgba(0,240,255,0.1)', borderRadius: '50%', position: 'absolute' }} />
                <div style={{ width: 20, height: 20, border: '1px solid rgba(0,240,255,0.1)', borderRadius: '50%', position: 'absolute' }} />

                {/* Radar Spokes */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                    <div key={deg} style={{
                        position: 'absolute',
                        height: 1,
                        width: 100,
                        background: 'rgba(0,240,255,0.05)',
                        transform: `rotate(${deg}deg)`
                    }} />
                ))}

                {/* Dynamic Shape (Simulated) */}
                <div style={{
                    width: 80,
                    height: 80,
                    background: 'rgba(0,240,255,0.15)',
                    clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                    borderRadius: 2
                }} />
            </div>

            <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 9, color: '#4B6080', marginBottom: 10 }}>HISTORICAL RISK TREND (24H)</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', height: 40, gap: 2 }}>
                    {Array.from({ length: 24 }).map((_, i) => (
                        <div key={i} style={{
                            flex: 1,
                            background: i > 15 && i < 20 ? '#FF3D3D' : '#00F0FF',
                            height: `${20 + Math.random() * 80}%`,
                            opacity: 0.3 + (i / 24) * 0.7
                        }} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DigitalTwinStats;
