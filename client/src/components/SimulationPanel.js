import React from 'react';
import { useCityEngine } from '../engine/CityEngine';

const SimulationPanel = () => {
    const { triggerScenario, digitalTwinMode, setDigitalTwinMode } = useCityEngine();

    const scenarios = [
        { id: 'FLOOD', label: 'Flood Event', icon: '🌊' },
        { id: 'CYBER_ATTACK', label: 'Cyber Attack', icon: '🛡️' },
        { id: 'POWER_OUTAGE', label: 'Grid Failure', icon: '⚡' },
        { id: 'MULTIZONE', label: 'Multi-Zone Incident', icon: '⚠️' }
    ];

    return (
        <div className="dashboard-panel" style={{ padding: 15, marginTop: 15 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                <div style={{ fontSize: 9, color: '#4B6080', letterSpacing: '0.15em' }}>SIMULATION CONTROLLER</div>
                <div
                    onClick={() => setDigitalTwinMode(!digitalTwinMode)}
                    style={{
                        fontSize: 8,
                        padding: '4px 8px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        background: digitalTwinMode ? 'rgba(0,240,255,0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${digitalTwinMode ? '#00F0FF' : 'rgba(255,255,255,0.1)'}`,
                        color: digitalTwinMode ? '#00F0FF' : '#4B6080'
                    }}
                >
                    TWIN MODE: {digitalTwinMode ? 'ON' : 'OFF'}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {scenarios.map(s => (
                    <button
                        key={s.id}
                        onClick={() => triggerScenario(s.id)}
                        className="btn-twin"
                        style={{
                            padding: '10px 5px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#8899BB',
                            fontSize: 10,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 5,
                            borderRadius: 4,
                            transition: 'all 0.2s'
                        }}
                    >
                        <span style={{ fontSize: 16 }}>{s.icon}</span>
                        {s.label}
                    </button>
                ))}
            </div>

            <button
                onClick={() => triggerScenario('STRESS_TEST')}
                style={{
                    width: '100%',
                    marginTop: 15,
                    padding: 8,
                    background: 'linear-gradient(90deg, #1C222D, #0B0F14)',
                    border: '1px solid #FF3D3D',
                    color: '#FF3D3D',
                    fontSize: 9,
                    fontWeight: 800,
                    cursor: 'pointer',
                    borderRadius: 4
                }}
            >
                START CITY STRESS TEST
            </button>
        </div>
    );
};

export default SimulationPanel;
