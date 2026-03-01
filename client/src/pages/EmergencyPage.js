import React, { useState } from 'react';
import { useCityEngine } from '../engine/CityEngine';
import { CHENNAI_ZONES_GEOJSON } from '../engine/CityEngine';

import './ManagementPages.css';
import './EmergencyPage.css';

const INCIDENT_TYPES = ['FIRE', 'MEDICAL', 'CRIME', 'INFRASTRUCTURE', 'FLOOD'];
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const SEVERITY_COLORS = {
    LOW: '#2ECC71',
    MEDIUM: '#F5B041',
    HIGH: '#FF8C00',
    CRITICAL: '#FF5C5C',
};

const FALLBACK_INCIDENTS = [
    { id: 'EMG-001', type: 'INFRASTRUCTURE', severity: 'HIGH', status: 'DISPATCHED', location: 'Guindy Sector', units: 2, detected: '12:48', eta: '8 min', note: 'Power Outage – Grid Node 7' },
    { id: 'EMG-002', type: 'INFRASTRUCTURE', severity: 'MEDIUM', status: 'UNDER_REPAIR', location: 'Velachery', units: 3, detected: '13:01', eta: '45 min', pressureDrop: '18 PSI', note: 'Water Pipeline Burst' },
    { id: 'EMG-003', type: 'CRIME', severity: 'LOW', status: 'RESOLVED', location: 'Kathipara Junction', units: 2, detected: '11:30', note: 'Traffic Collision – Cleared in 8 min' },
    { id: 'EMG-004', type: 'FIRE', severity: 'CRITICAL', status: 'ACTIVE', location: 'Industrial Estate', units: 5, detected: '13:05', eta: '3 min', note: 'Fire Alert – High Priority' },
];

const ZONE_IDS = CHENNAI_ZONES_GEOJSON.features.map(f => ({
    id: f.id,
    name: f.properties.name,
}));

const EmergencyPage = () => {
    const {
        triggerScenario, emit, updateEmergency
    } = useCityEngine();

    const [incidents, setIncidents] = useState(FALLBACK_INCIDENTS);

    const [form, setForm] = useState({
        type: 'FIRE',
        zone: ZONE_IDS[0]?.id || '',
        severity: 'HIGH',
        description: '',
    });

    const handleDispatch = () => {
        updateEmergency({
            type: form.type,
            zone: form.zone,
            severity: form.severity,
            description: form.description || `${form.type} incident reported in ${form.zone} zone.`,
        });
        setForm(f => ({ ...f, description: '' }));
    };

    const resolveIncident = (id) => {
        setIncidents(prev =>
            prev.map(inc => inc.id === id ? { ...inc, status: 'RESOLVED' } : inc)
        );
        emit('INCIDENT_RESOLVED', { id, severity: 'INFO' });
    };

    const activeCount = incidents.filter(i => i.status !== 'RESOLVED').length;
    const resolvedCount = incidents.filter(i => i.status === 'RESOLVED').length;

    return (
        <div className="management-page">
            <header className="mgmt-header">
                <h2>EMERGENCY RESPONSE COMMAND</h2>
                <div className="mgmt-actions">
                    <button onClick={() => triggerScenario('LARGE_FIRE')} className="btn-danger">
                        🔥 FIRE ALERT
                    </button>
                    <button onClick={() => triggerScenario('MEDICAL_EMERGENCY')} className="btn-secondary">
                        🚑 MEDICAL CODE
                    </button>
                    <button onClick={() => triggerScenario('FLOOD')} className="btn-secondary">
                        🌊 FLOOD PROTOCOL
                    </button>
                </div>
            </header>

            <div className="emg-layout">
                {/* LEFT — active incidents */}
                <section className="mgmt-section incidents-section">
                    <h3>ACTIVE INCIDENTS ({activeCount} active / {resolvedCount} resolved)</h3>

                    {incidents.length === 0 ? (
                        <div className="no-data">NO ACTIVE INCIDENTS DETECTED</div>
                    ) : (
                        <div className="incidents-list">
                            {incidents.map(inc => (
                                <div
                                    key={inc.id}
                                    className={`incident-card ${inc.status === 'RESOLVED' ? 'resolved' : ''}`}
                                    style={{ '--sev-color': SEVERITY_COLORS[inc.severity] || '#4B6080' }}
                                >
                                    <div className="inc-header">
                                        <div className="pulse-indicator" />
                                        <span className="inc-id">{inc.id}</span>
                                        <span className="inc-type">{inc.type}</span>

                                        <span
                                            className="inc-badge"
                                            style={{
                                                background: `${SEVERITY_COLORS[inc.severity] || '#4B6080'}22`,
                                                color: SEVERITY_COLORS[inc.severity] || '#4B6080',
                                            }}
                                        >
                                            {inc.status}
                                        </span>
                                    </div>
                                    <div className="inc-meta-grid">
                                        <div className="inc-meta-item">
                                            <span className="inc-meta-label">Location</span>
                                            <span className="inc-meta-value">{inc.location}</span>
                                        </div>
                                        <div className="inc-meta-item">
                                            <span className="inc-meta-label">Dispatched Units</span>
                                            <span className="inc-meta-value">{inc.units}</span>
                                        </div>
                                        <div className="inc-meta-item">
                                            <span className="inc-meta-label">Detected</span>
                                            <span className="inc-meta-value">{inc.detected}</span>
                                        </div>

                                        {inc.eta && (
                                            <div className="inc-meta-item">
                                                <span className="inc-meta-label">ETA</span>
                                                <span className="inc-meta-value">{inc.eta}</span>
                                            </div>
                                        )}
                                        {inc.pressureDrop && (
                                            <div className="inc-meta-item">
                                                <span className="inc-meta-label">Pressure Drop</span>
                                                <span className="inc-meta-value txt-warn">{inc.pressureDrop}</span>
                                            </div>
                                        )}
                                        {inc.loadSpike && (
                                            <div className="inc-meta-item">
                                                <span className="inc-meta-label">Load Spike</span>
                                                <span className="inc-meta-value txt-danger">{inc.loadSpike}</span>
                                            </div>
                                        )}
                                        {inc.densityIncrease && (
                                            <div className="inc-meta-item">
                                                <span className="inc-meta-label">Density</span>
                                                <span className="inc-meta-value txt-warn">{inc.densityIncrease}</span>
                                            </div>
                                        )}
                                    </div>

                                    {inc.status !== 'RESOLVED' && (
                                        <div className="inc-actions" style={{ marginTop: 16 }}>
                                            <button
                                                className="btn-xs"
                                                onClick={() => resolveIncident(inc.id)}
                                            >
                                                ✔ MARK RESOLVED
                                            </button>
                                            <button
                                                className="btn-xs btn-danger-xs"
                                                onClick={() => emit('UNIT_DISPATCH', { id: inc.id, severity: 'HIGH' })}
                                            >
                                                ESCALATE
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* RIGHT — dispatch form + resources */}
                <div className="emg-right">
                    <section className="mgmt-section dispatch-section">
                        <h3>DISPATCH INCIDENT</h3>

                        <div className="form-group">
                            <label>INCIDENT TYPE</label>
                            <select
                                className="form-select"
                                value={form.type}
                                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                            >
                                {INCIDENT_TYPES.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>ZONE</label>
                            <select
                                className="form-select"
                                value={form.zone}
                                onChange={e => setForm(f => ({ ...f, zone: e.target.value }))}
                            >
                                {ZONE_IDS.map(z => (
                                    <option key={z.id} value={z.id}>{z.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>SEVERITY</label>
                            <div className="severity-row">
                                {SEVERITIES.map(s => (
                                    <button
                                        key={s}
                                        className={`sev-btn ${form.severity === s ? 'active' : ''}`}
                                        style={form.severity === s
                                            ? { borderColor: SEVERITY_COLORS[s], color: SEVERITY_COLORS[s] }
                                            : {}
                                        }
                                        onClick={() => setForm(f => ({ ...f, severity: s }))}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>NOTES (OPTIONAL)</label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="Incident details..."
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            />
                        </div>

                        <button className="btn-danger full-width" onClick={handleDispatch}>
                            ⚡ DISPATCH EMERGENCY
                        </button>
                    </section>

                    <section className="mgmt-section resources-section">
                        <h3>RESOURCE READINESS</h3>
                        {[
                            { label: 'POLICE UNITS', pct: 85, color: '#00F0FF' },
                            { label: 'FIRE ENGINES', pct: 60, color: '#FF8C00' },
                            { label: 'AMBULANCES', pct: 92, color: '#00FF64' },
                            { label: 'HAZMAT TEAMS', pct: 45, color: '#FFBF00' },
                        ].map(r => (
                            <div key={r.label} className="resource-stat">
                                <div className="resource-header">
                                    <span>{r.label}</span>
                                    <span style={{ color: r.color, fontWeight: 800 }}>{r.pct}%</span>
                                </div>
                                <div className="resource-progress">
                                    <div
                                        className="fill"
                                        style={{ width: `${r.pct}%`, background: r.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default EmergencyPage;
