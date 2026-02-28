import React, { useState } from 'react';
import { useCityEngine } from '../engine/CityEngine';
import './ManagementPages.css';
import './SecurityPage.css';

const SECURITY_MOCK_DATA = [
    { id: 'CAM-01', location: 'T Nagar Commercial Street', zone: 'Central', status: 'Motion Detected', threat: 'Low', aiTag: 'Crowd Surge', faces: 18, vehicles: 42, signal: 94, latency: 12, timestamp: '18:44:21', video: 'https://images.unsplash.com/photo-1590490359854-dfba1d261e4b?w=800&q=80' },
    { id: 'CAM-02', location: 'Tondiarpet Port Road', zone: 'North', status: 'AI Flagged', threat: 'High', aiTag: 'Suspicious Vehicle Pattern', vehicleConfidence: '87%', speed: '94 km/h', signal: 82, latency: 45, timestamp: '18:45:02', video: 'https://images.unsplash.com/photo-1519003722824-192d992a6059?w=800&q=80' },
    { id: 'CAM-03', location: 'Marina Beach Checkpoint', zone: 'Coastal', status: 'Active', threat: 'Low', aiTag: 'Normal Flow', density: '46%', signal: 88, latency: 24, timestamp: '18:45:14', video: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&q=80' },
    { id: 'CAM-04', location: 'Guindy Industrial Junction', zone: 'South', status: 'Active', threat: 'Medium', aiTag: 'Heavy Truck Congestion', vehicles: 78, signal: 91, latency: 18, timestamp: '18:45:28', video: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80' },
    { id: 'CAM-05', location: 'Anna Nagar Metro Entry', zone: 'West', status: 'AI Flagged', threat: 'Medium', aiTag: 'Abandoned Object Detected', confidence: '81%', signal: 85, latency: 32, timestamp: '18:46:01', video: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80' },
    { id: 'CAM-06', location: 'Velachery Bypass', zone: 'South-East', status: 'Active', threat: 'Low', aiTag: 'Stable Traffic', signal: 92, latency: 15, timestamp: '18:46:33', video: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80' },
    { id: 'CAM-07', location: 'GST Road Flyover', zone: 'South', status: 'AI Flagged', threat: 'Critical', aiTag: 'Multi-Vehicle Collision Detected', confidence: '93%', dispatched: true, signal: 78, latency: 88, timestamp: '18:47:12', video: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80' },
    { id: 'CAM-08', location: 'Egmore Railway Entrance', zone: 'Central', status: 'Motion Detected', threat: 'Medium', aiTag: 'Crowd Density Spike', density: '78%', signal: 86, latency: 28, timestamp: '18:47:46', video: 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=800&q=80' },
    { id: 'CAM-09', location: 'Madhavaram Industrial Yard', zone: 'North', status: 'Active', threat: 'Low', aiTag: 'Normal Surveillance', signal: 95, latency: 10, timestamp: '18:48:02', video: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80' },
    { id: 'CAM-10', location: 'OMR Tech Corridor – Phase 2', zone: 'IT Corridor', status: 'AI Flagged', threat: 'High', aiTag: 'Unauthorized Drone Detection', altitude: '42m', signal: 84, latency: 42, timestamp: '18:48:44', video: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80' },
    { id: 'CAM-11', location: 'Sholinganallur Junction', zone: 'South-East', status: 'Active', threat: 'Low', aiTag: 'Traffic Smooth', signal: 90, latency: 22, timestamp: '18:49:12', video: 'https://images.unsplash.com/photo-1590490359854-dfba1d261e4b?w=800&q=80' },
    { id: 'CAM-12', location: 'Perambur Freight Terminal', zone: 'North-East', status: 'AI Flagged', threat: 'Medium', aiTag: 'Restricted Area Breach', pattern: 'Unidentified', signal: 87, latency: 38, timestamp: '18:49:39', video: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80' },
];

const CYBER_EVENTS = [
    { id: 'SEC-01', type: 'API Brute Force Attempt', source: '185.21.44.91', status: 'Blocked', attempts: 142, severity: 'High' },
    { id: 'SEC-02', type: 'Unauthorized Device Authentication', source: 'Kiosk-Unit-44', status: 'Rejected', severity: 'Medium' },
    { id: 'SEC-03', type: 'Suspicious Data Exfiltration Attempt', source: '/water/control', status: 'Investigating', severity: 'High' },
    { id: 'SEC-04', type: 'Firewall Intrusion', source: 'Intrusion Detection', status: 'Blocked', packets: '18,442', severity: 'Medium' },
];

const THREAT_COLORS = {
    Low: '#00FF64',
    Medium: '#FFBF00',
    High: '#FF8C00',
    Critical: '#FF3D3D'
};

const SecurityPage = () => {
    const { security, emit } = useCityEngine();
    const [selectedCam, setSelectedCam] = useState(null);

    const categories = {
        'High Priority Feeds': SECURITY_MOCK_DATA.filter(c => c.threat === 'Critical' || c.threat === 'High'),
        'AI Flagged Feeds': SECURITY_MOCK_DATA.filter(c => c.status === 'AI Flagged' && c.threat !== 'Critical' && c.threat !== 'High'),
        'Standard Monitoring': SECURITY_MOCK_DATA.filter(c => c.status !== 'AI Flagged' && c.threat !== 'Critical' && c.threat !== 'High')
    };

    const handleCamClick = (cam, e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        setSelectedCam(cam);
        emit('UI_INTERACTION', { type: 'MODAL_OPEN', target: cam.id });
    };

    const closeModal = (e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        setSelectedCam(null);
        emit('UI_INTERACTION', { type: 'MODAL_CLOSE' });
    };

    return (
        <div className="management-page security-page">
            <header className="mgmt-header">
                <h2>SECURITY OPERATIONS CENTER (SOC)</h2>
            </header>

            <div className="sec-glass-panel">
                <h3>VULNERABILITY & THREAT OVERVIEW</h3>
                <div className="global-metrics-grid">
                    <div className="sec-metric-card">
                        <span className="sec-metric-label">Global Threat Score</span>
                        <div className="sec-metric-value">34 <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>/ 100</span></div>
                        <div className="threat-bar-container">
                            <div className="threat-bar-fill" style={{ width: '34%', background: 'linear-gradient(90deg, #00FF64, #FFBF00)' }} />
                        </div>
                    </div>
                    <div className="sec-metric-card">
                        <span className="sec-metric-label">Intrusion Attempts (1h)</span>
                        <div className="sec-metric-value">12</div>
                        <span style={{ fontSize: 9, color: 'var(--critical)' }}>+18% SPIKE DETECTED</span>
                    </div>
                    <div className="sec-metric-card">
                        <span className="sec-metric-label">Zero Trust Compliance</span>
                        <div className="sec-metric-value">95%</div>
                        <span style={{ fontSize: 9, color: 'var(--success)' }}>OPTIMAL STATE</span>
                    </div>
                    <div className="sec-metric-card">
                        <span className="sec-metric-label">API Gateway Traffic</span>
                        <div className="sec-metric-value">1,420 <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>req/min</span></div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    <div className="stat-row"><span>FW BLOCKS (24h)</span><span className="txt-warn">142</span></div>
                    <div className="stat-row"><span>UNAUTH DEVICES</span><span className="txt-danger">3</span></div>
                    <div className="stat-row"><span>API ERRORS/MIN</span><span className="txt-safe">5</span></div>
                    <div className="stat-row"><span>SYSTEMS ONLINE</span><span className="txt-safe">98%</span></div>
                </div>
            </div>

            <div className="soc-content">
                {Object.entries(categories).map(([title, feeds], catIdx) => (
                    feeds.length > 0 && (
                        <div key={title} className="cctv-category-section">
                            <h3 className="cctv-section-header">{title.toUpperCase()} — {feeds.length} UNITS</h3>
                            <div className="cctv-grid">
                                {feeds.map((cam, idx) => (
                                    <div
                                        key={cam.id}
                                        className={`cctv-panel-new ${cam.threat}`}
                                        style={{
                                            animationDelay: `${(catIdx * 100) + (idx * 40)}ms`,
                                            '--threat-color': THREAT_COLORS[cam.threat] || '#E6F1FF'
                                        }}
                                        onClick={(e) => handleCamClick(cam, e)}
                                    >
                                        <div className="cctv-feed" style={{ backgroundImage: `url(${cam.video})` }}>
                                            <div className="cctv-scanline" />
                                            <div className="cctv-noise" />
                                            <div className="cctv-flicker" />
                                            <div className="cctv-vignette" />

                                            {/* AI Detection Overlays */}
                                            {cam.id === 'CAM-10' && (
                                                <div className="drone-overlay" style={{
                                                    position: 'absolute', top: '30%', left: '40%', width: 40, height: 40,
                                                    border: '2px dashed #FFBF00', borderRadius: '50%', zIndex: 3,
                                                    animation: 'pulse 2s infinite'
                                                }}>
                                                    <span style={{ position: 'absolute', top: -12, left: -10, fontSize: 8, color: '#FFBF00', fontWeight: 800, whiteSpace: 'nowrap' }}>DRONE_DETECT</span>
                                                </div>
                                            )}
                                            {cam.threat === 'Critical' && (
                                                <div className="bounding-box" style={{
                                                    position: 'absolute', top: '40%', left: '20%', width: '50%', height: '30%',
                                                    border: '1px solid #FF3D3D', backgroundColor: 'rgba(255, 61, 61, 0.1)', zIndex: 3
                                                }}>
                                                    <div style={{ position: 'absolute', top: 0, left: 0, padding: '1px 3px', fontSize: 6, background: '#FF3D3D', color: '#fff' }}>COLLISION_DETECT</div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="cctv-overlay-new">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <div className="rec-indicator blinking" />
                                                        <span style={{ fontSize: 9, fontWeight: 800, color: '#FF3D3D' }}>REC</span>
                                                    </div>
                                                    <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>
                                                        {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                                                    </span>
                                                </div>
                                                <div className="cyber-badge" style={{ backgroundColor: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)' }}>
                                                    ID: {cam.id}
                                                </div>
                                            </div>
                                            <div className="cctv-footer">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                    <div>
                                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#E6F1FF' }}>{cam.location}</div>
                                                        <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                                                            <span style={{ fontSize: 8, color: 'var(--text-dim)' }}>ZONE: {cam.zone.toUpperCase()}</span>
                                                            <span style={{ fontSize: 8, color: THREAT_COLORS[cam.threat], fontWeight: 700 }}>AI: {cam.aiTag.toUpperCase()}</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                        <span style={{ fontSize: 8, color: 'var(--text-dim)' }}>SIG: {cam.signal}%</span>
                                                        <span style={{ fontSize: 8, color: 'var(--text-dim)' }}>LAT: {cam.latency}ms</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {cam.threat === 'Critical' && <div className="cctv-alert-overlay" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                ))}
            </div>

            <section className="mgmt-section" style={{ marginTop: 40, paddingBottom: 60 }}>
                <h3>RECENT CYBER OVERWATCH EVENTS</h3>
                <div className="cyber-events-list">
                    {CYBER_EVENTS.map(event => (
                        <div key={event.id} className="cyber-event-card" style={{ borderLeftColor: THREAT_COLORS[event.severity] }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <span style={{ fontWeight: 800, color: '#E6F1FF', fontSize: 11 }}>{event.type}</span>
                                <span style={{ color: 'var(--text-dim)', fontSize: 9 }}>Source: {event.source}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ display: 'block', fontSize: 12, fontWeight: 800, color: THREAT_COLORS[event.severity] }}>{event.status.toUpperCase()}</span>
                                <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>
                                    {event.attempts ? `${event.attempts} Attempts` : event.packets ? `${event.packets} Packets` : 'Monitoring'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {selectedCam && (
                <div className="cctv-modal-overlay" onClick={closeModal}>
                    <div className="cctv-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h4 style={{ margin: 0, fontSize: 14 }}>{selectedCam.id} — SYSTEM DATA FEED</h4>
                                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{selectedCam.location} (Zone: {selectedCam.zone})</span>
                            </div>
                            <button className="btn-xs" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '6px 12px', color: '#fff' }} onClick={closeModal}>CLOSE [ESC]</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', height: 400 }}>
                            <div style={{ background: '#000', position: 'relative', overflow: 'hidden' }}>
                                <div className="cctv-feed" style={{ backgroundImage: `url(${selectedCam.video})`, filter: 'none' }} />
                                <div className="cctv-scanline" />
                                <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <div className="cyber-badge" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>ANALYSIS: {selectedCam.aiTag}</div>
                                    <div className="cyber-badge" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>TIMESTAMP: {selectedCam.timestamp}</div>
                                </div>
                            </div>
                            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, background: 'rgba(255,255,255,0.01)', overflowY: 'auto' }}>
                                <div>
                                    <label className="sec-metric-label">INTELLIGENCE METRICS</label>
                                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {selectedCam.faces && <div className="stat-row"><span>Face Detections</span><span className="txt-safe">{selectedCam.faces}</span></div>}
                                        {selectedCam.vehicles && <div className="stat-row"><span>Vehicle Count</span><span className="txt-safe">{selectedCam.vehicles}</span></div>}
                                        {selectedCam.density && <div className="stat-row"><span>Crowd Density</span><span className="txt-warn">{selectedCam.density}</span></div>}
                                        {selectedCam.speed && <div className="stat-row"><span>Avg Speed</span><span className="txt-danger">{selectedCam.speed}</span></div>}
                                        {selectedCam.confidence && <div className="stat-row"><span>Detection Confidence</span><span className="txt-safe">{selectedCam.confidence}</span></div>}
                                    </div>
                                </div>

                                <div>
                                    <label className="sec-metric-label">INCIDENT TIMELINE</label>
                                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8, padding: 12, border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, background: 'rgba(0,0,0,0.2)' }}>
                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <span style={{ fontSize: 9, color: 'var(--text-dim)', minWidth: 45 }}>18:42:10</span>
                                            <span style={{ fontSize: 9, color: '#E6F1FF' }}>System initialized & stream sync.</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <span style={{ fontSize: 9, color: 'var(--text-dim)', minWidth: 45 }}>18:44:05</span>
                                            <span style={{ fontSize: 9, color: '#E6F1FF' }}>AI Vision flagged: {selectedCam.aiTag}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <span style={{ fontSize: 9, color: 'var(--text-dim)', minWidth: 45 }}>18:45:00</span>
                                            <span style={{ fontSize: 9, color: 'var(--critical)', fontWeight: 700 }}>Critical threshold breach.</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <label className="sec-metric-label">SYSTEM ACTIONS</label>
                                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                                        <button className="btn-secondary" style={{ flex: 1, fontSize: 10 }}>MANUAL OVERRIDE</button>
                                        <button
                                            className="btn-danger"
                                            style={{ flex: 1, fontSize: 10 }}
                                            onClick={() => {
                                                emit('UI_INTERACTION', { type: 'DISPATCH_EVENT', target: selectedCam.id });
                                                alert(`Units dispatched to ${selectedCam.location}`);
                                            }}
                                        >
                                            DISPATCH UNIT
                                        </button>
                                    </div>
                                    <div style={{ marginTop: 16, padding: 12, background: 'rgba(255,61,61,0.05)', borderRadius: 6, border: '1px solid rgba(255,61,61,0.1)' }}>
                                        <span style={{ fontSize: 9, color: 'var(--critical)', fontWeight: 800 }}>THREAT ADVISORY: {selectedCam.threat.toUpperCase()}</span>
                                        <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: '4px 0 0 0' }}>AI confirms anomalous patterns matching '{selectedCam.aiTag.toLowerCase()}'. Immediate supervisor review recommended.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecurityPage;
