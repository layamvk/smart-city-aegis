import React from 'react';
import { useCityEngine } from '../engine/CityEngine';
import './ManagementPages.css';
import './LightingPage.css';

const BrightnessRing = ({ value }) => {
    const glow = value > 70 ? '#FFD700' : value > 20 ? '#FFA500' : '#4B6080';
    return (
        <div className="bulb-ring" style={{ '--brightness': value, '--glow-color': glow }}>
            <div className="bulb-icon" style={{ '--glow-color': glow }} />
        </div>
    );
};

const LightingPage = () => {
    const { lights, updateLights, updateLightsGlobal } = useCityEngine();

    // Safe accessors — handle both 'failures' and 'failureCount' field names
    const totalFailures = lights.clusters.reduce((a, b) => a + (b.failures ?? b.failureCount ?? 0), 0);
    const avgBrightness = Math.round(
        lights.clusters.reduce((a, c) => a + (c.brightness ?? 0), 0) / (lights.clusters.length || 1)
    );

    return (
        <div className="management-page">
            <header className="mgmt-header">
                <h2>STREET LIGHTING CONTROL</h2>
                <div className="mgmt-actions">
                    <button
                        className="btn-secondary"
                        onClick={(e) => {
                            e.stopPropagation(); e.preventDefault();
                            lights.clusters.forEach(c => updateLights(c.id, { brightness: 0, energySave: true }));
                            updateLightsGlobal({ globalBrightness: 0, energySaveMode: true });
                        }}
                    >
                        BLACKOUT MODE
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={(e) => {
                            e.stopPropagation(); e.preventDefault();
                            lights.clusters.forEach(c => updateLights(c.id, { brightness: 50, energySave: true }));
                            updateLightsGlobal({ globalBrightness: 50, energySaveMode: true });
                        }}
                    >
                        ENERGY SAVE
                    </button>
                    <button
                        className="btn-danger"
                        onClick={(e) => {
                            e.stopPropagation(); e.preventDefault();
                            lights.clusters.forEach(c => updateLights(c.id, { brightness: 100, energySave: false }));
                            updateLightsGlobal({ globalBrightness: 100, energySaveMode: false });
                        }}
                    >
                        EMERGENCY FLOOD
                    </button>
                </div>
            </header>

            <div className="mgmt-grid lights-layout">
                <section className="mgmt-section clusters-section">
                    <h3>SMART LIGHT NODES — {lights.clusters.length} CLUSTERS</h3>
                    <div className="clusters-grid">
                        {lights.clusters.map(c => {
                            const brightness = c.brightness ?? 85;
                            const glow = brightness > 70 ? '#FFD700' : brightness > 20 ? '#FFA500' : '#4B6080';
                            return (
                                <div key={c.id} className="light-card control-card" style={{ animationDelay: `${c.id.split('_').pop() * 40}ms` }}>
                                    <div className="light-card-content">
                                        <div>
                                            <div className="light-id" style={{ color: '#E6F1FF', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                                                ZONE {c.id.split('_').pop()}
                                            </div>
                                            <div style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: 2, textTransform: 'uppercase' }}>
                                                {['OMR Corridor', 'GST Road', 'Inner Ring Road', 'Anna Salai', 'East Coast Road'][c.id.split('_').pop() % 5]}
                                            </div>
                                            <div style={{ fontSize: 9, color: '#8899BB', marginBottom: 8 }}>
                                                {(c.id.split('_').pop() * 12 + 100)} NODES
                                            </div>
                                            <div className="light-pct">{brightness}%</div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                            <BrightnessRing value={brightness} />
                                            <div style={{ fontSize: 8, color: glow, fontWeight: 800, letterSpacing: '0.1em' }}>
                                                {brightness > 70 ? 'EMERGENCY' : brightness > 20 ? 'AUTO' : 'ECO'} MODE
                                            </div>
                                        </div>
                                    </div>
                                    <div className="light-controls">
                                        <div className="light-status" style={{ color: glow }}>
                                            {brightness > 70 ? 'BRIGHT' : brightness > 20 ? 'DIM' : 'OFF'}
                                        </div>
                                        <input
                                            className="light-slider"
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={brightness}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                updateLights(c.id, {
                                                    brightness: parseInt(e.target.value, 10),
                                                    energySave: false,
                                                });
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="mgmt-section efficiency-section">
                    <h3>SYSTEM REPORT</h3>

                    <div className="stat-row">
                        <span>AVERAGE BRIGHTNESS</span>
                        <span style={{ color: '#FFD700', fontWeight: 800 }}>{avgBrightness}%</span>
                    </div>
                    <div className="stat-row">
                        <span>ENERGY SAVE MODE</span>
                        <span className={lights.energySaveMode ? 'txt-safe' : 'txt-warn'}>
                            {lights.energySaveMode ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                    </div>
                    <div className="stat-row">
                        <span>NODE FAILURES</span>
                        <span className={totalFailures > 0 ? 'txt-danger' : 'txt-safe'}>
                            {totalFailures}
                        </span>
                    </div>
                    <div className="stat-row">
                        <span>GLOBAL BRIGHTNESS</span>
                        <span style={{ color: '#E6F1FF' }}>{lights.globalBrightness ?? avgBrightness}%</span>
                    </div>

                    <div style={{ marginTop: 20 }}>
                        <div className="stat-row" style={{ marginBottom: 8 }}>
                            <span>GLOBAL DIMMER</span>
                        </div>
                        <input
                            className="light-slider global"
                            type="range"
                            min="0"
                            max="100"
                            defaultValue={lights.globalBrightness ?? avgBrightness}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                                e.stopPropagation();
                                const val = parseInt(e.target.value, 10);
                                lights.clusters.forEach(c => updateLights(c.id, { brightness: val }));
                                updateLightsGlobal({ globalBrightness: val });
                            }}
                        />
                    </div>

                    <div style={{ marginTop: 30 }}>
                        <h3 style={{ marginBottom: 12 }}>ZONE BREAKDOWN</h3>
                        {['BRIGHT', 'DIM', 'OFF'].map(lvl => {
                            const count = lights.clusters.filter(c => {
                                const b = c.brightness ?? 85;
                                if (lvl === 'BRIGHT') return b > 70;
                                if (lvl === 'DIM') return b > 20 && b <= 70;
                                return b <= 20;
                            }).length;
                            const colors = { BRIGHT: '#FFD700', DIM: '#FFA500', OFF: '#4B6080' };
                            return (
                                <div key={lvl} className="stat-row">
                                    <span style={{ color: colors[lvl] }}>{lvl}</span>
                                    <span style={{ color: colors[lvl], fontWeight: 800 }}>{count} nodes</span>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default LightingPage;
