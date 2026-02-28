import React from 'react';
import { useCityEngine } from '../engine/CityEngine';

const TopologyPanel = () => {
    const { summary } = useCityEngine();

    const dependencies = [
        { from: 'POWER', to: 'WATER', health: 100 - (summary.grid / 5) },
        { from: 'POWER', to: 'TRAFFIC', health: 100 - (summary.grid / 4) },
        { from: 'TRAFFIC', to: 'EMERGENCY', health: 100 - (summary.traffic / 3) },
    ];

    return (
        <div className="dashboard-panel" style={{ padding: 15, marginTop: 15 }}>
            <div style={{ fontSize: 9, color: '#4B6080', letterSpacing: '0.15em', marginBottom: 15 }}>INFRASTRUCTURE TOPOLOGY</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {dependencies.map((dep, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                            <div style={{ fontSize: 10, color: '#E6F1FF' }}>{dep.from} ➔ {dep.to}</div>
                            <div style={{ fontSize: 9, color: dep.health > 80 ? '#00FF64' : '#FF3D3D' }}>
                                {dep.health > 80 ? 'STABLE' : 'STRESSED'}
                            </div>
                        </div>
                        <div style={{ height: 2, background: 'rgba(255,255,255,0.05)' }}>
                            <div style={{ height: '100%', width: `${dep.health}%`, background: dep.health > 80 ? '#00F0FF' : '#FF3D3D' }} />
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: 15, paddingTop: 15, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 9, color: '#4B6080', marginBottom: 10 }}>INTERDEPENDENCY MATRIX</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                    {['', 'POW', 'H2O', 'TRF'].map((h, i) => (
                        <div key={i} style={{ fontSize: 8, color: '#4B6080', textAlign: 'center' }}>{h}</div>
                    ))}
                    {['POW', 'H2O', 'TRF'].map((row, i) => (
                        <React.Fragment key={i}>
                            <div style={{ fontSize: 8, color: '#4B6080' }}>{row}</div>
                            {[1, 2, 3].map(col => (
                                <div key={col} style={{
                                    height: 12,
                                    background: Math.random() > 0.8 ? 'rgba(255,61,61,0.2)' : 'rgba(0,240,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }} />
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TopologyPanel;
