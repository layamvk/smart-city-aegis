import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../../services/api';
import './LiveSecurityDrill.css';

const ATTACKS = [
    { id: 'CREDENTIAL_STUFFING', label: '1. Credential Stuffing' },
    { id: 'NOSQL_INJECTION', label: '2. NoSQL Injection' },
    { id: 'TOKEN_REPLAY', label: '3. Token Replay' },
    { id: 'CROSS_ZONE_MANIPULATION', label: '4. Cross-Zone Manipulation' },
    { id: 'PRIVILEGE_ESCALATION', label: '5. Privilege Escalation' },
    { id: 'EMERGENCY_OVERRIDE_ABUSE', label: '6. Override Abuse' },
    { id: 'FINGERPRINT_CHANGE', label: '7. Fingerprint Change' },
    { id: 'API_RATE_SPIKE', label: '8. API Rate Spike' },
    { id: 'UNAUTHORIZED_MONITORING', label: '9. Unauthorized Monitoring' },
    { id: 'INFRA_SABOTAGE', label: '10. Infra Sabotage' },
];

const LiveSecurityDrill = () => {
    const [open, setOpen] = useState(false);
    const [logs, setLogs] = useState([]);
    const [activeDrill, setActiveDrill] = useState(false);
    const [threatScore, setThreatScore] = useState(20);
    const logsEndRef = useRef(null);

    useEffect(() => {
        const socketURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const socket = io(socketURL);

        socket.on('security-log', (newLog) => {
            setLogs((prev) => [...prev, newLog]);
            if (newLog.threatAfter !== undefined) {
                setThreatScore(newLog.threatAfter);
            }

            const statusStr = newLog.systemStatus || newLog.message || '';
            if (
                statusStr.includes('Locked') ||
                statusStr.includes('Blocked') ||
                statusStr.includes('Revoked') ||
                statusStr.includes('Denied') ||
                statusStr.includes('Flagged') ||
                statusStr.includes('Enforced') ||
                statusStr.includes('applied') ||
                statusStr.includes('SAFEGUARDED')
            ) {
                setTimeout(() => setActiveDrill(false), 500);
            }
        });

        return () => socket.disconnect();
    }, []);

    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    const runSimulation = async (attackType) => {
        if (activeDrill) return;
        setActiveDrill(true);

        // Step 1: Resolve the real caller IP/geo from the browser
        let callerIp = null;
        let callerGeo = null;
        let callerIsp = null;
        try {
            const geoRes = await fetch('https://ipinfo.io/json?token=');
            const geoData = await geoRes.json();
            if (geoData.ip) {
                callerIp = geoData.ip;
                const parts = [geoData.city, geoData.region, geoData.country].filter(Boolean);
                callerGeo = parts.join(', ');
                callerIsp = geoData.org || 'Unknown ISP';
            }
        } catch (_) {
            // silently allow — backend will fallback
        }

        setLogs((prev) => [...prev, {
            timestamp: new Date().toISOString(),
            message: `INITIATING ATTACK DRILL: ${attackType}...`,
            severity: 'INFO',
            internal: true
        }]);

        try {
            await api.post('/security/simulate', { attackType, callerIp, callerGeo, callerIsp });
        } catch (err) {
            setLogs((prev) => [...prev, {
                timestamp: new Date().toISOString(),
                message: `API ERROR: ${err.response?.data?.message || err.message}. (Need SuperAdmin & Trust >= 70)`,
                severity: 'CRITICAL',
                internal: true
            }]);
            setActiveDrill(false);
        }
    };

    const resilience = Math.max(0, 100 - (threatScore * 0.5));

    if (!open) {
        return (
            <div className="drill-trigger-container">
                <button className="drill-btn-trigger" onClick={() => setOpen(true)}>
                    <span className="drill-dot"></span> LIVE SECURITY DRILL
                </button>
                <div className="drill-trigger-note">
                    <strong>Zero Trust Architecture Implemented:</strong>
                    • Atomic Account Locking & Brute Force Prevention<br />
                    • JWT Rotation & Session Invalidations<br />
                    • Dynamic RBAC & Strict API Rate Limiting<br />
                    • NoSQL Injection & Payload Validation
                </div>
            </div>
        );
    }

    return (
        <div className="drill-panel-backdrop" onClick={() => setOpen(false)}>
            <div className="drill-panel" onClick={e => e.stopPropagation()}>
                <div className="drill-header">
                    <div className="drill-title">
                        <span className={`drill-dot ${activeDrill ? 'active' : ''}`}></span>
                        ADVANCED LIVE SECURITY DRILL ENGINE
                    </div>
                    <div className="drill-close" onClick={() => setOpen(false)}>×</div>
                </div>

                <div className="drill-warning-banner">
                    <span className="warn-icon">⚠️</span>
                    <span>
                        <strong>Note for Evaluators:</strong> This drill engine simulates real attack patterns internally — no external traffic is generated.
                        Please <strong>avoid rapid repeated triggers</strong> as the backend runs on a free-tier server (Render + Redis free plan).
                        Run one attack at a time and wait for the sequence to complete before triggering the next.
                    </span>
                </div>

                <div className="drill-body">
                    <div className="drill-sidebar">
                        <div className="drill-sidebar-title">Attack Vectors</div>
                        {ATTACKS.map(attack => (
                            <button
                                key={attack.id}
                                className="drill-btn"
                                disabled={activeDrill}
                                onClick={() => runSimulation(attack.id)}
                            >
                                {attack.label}
                            </button>
                        ))}
                    </div>

                    <div className="drill-content">
                        <div className="drill-meter-row">
                            <div className="resilience-label">SYSTEM RESILIENCE</div>
                            <div className="resilience-bar-bg">
                                <div
                                    className="resilience-bar-fill"
                                    style={{ transform: `scaleX(${resilience / 100})`, background: resilience > 50 ? '#4F46E5' : '#EF4444' }}
                                />
                            </div>
                        </div>

                        <div className="drill-logs">
                            {logs.map((log, i) => {
                                if (log.internal) {
                                    return (
                                        <div key={i} className={`drill-log log-sev-${log.severity}`}>
                                            <span className="log-time">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                            {log.systemStatus || log.message}
                                        </div>
                                    );
                                }

                                return (
                                    <div key={i} className={`drill-log log-sev-${log.severity}`} style={{ marginBottom: '16px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', borderLeft: log.severity === 'CRITICAL' ? '3px solid #EF4444' : '3px solid #4F46E5' }}>
                                        <div style={{ color: '#fff', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                                            <span className="log-time" style={{ fontWeight: 'normal' }}>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                            [{log.severity}] {log.attackType} against {log.targetEndpoint}
                                        </div>
                                        <div className="log-details" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', lineHeight: '1.4' }}>
                                            <span><strong style={{ color: '#9CA3AF' }}>IP:</strong> {log.ipAddress} | <strong style={{ color: '#9CA3AF' }}>Location:</strong> {log.geoLocation || 'Local/Unknown'}</span>
                                            <span><strong style={{ color: '#9CA3AF' }}>Device Fingerprint:</strong> <span style={{ color: '#8B5CF6' }}>{log.deviceFingerprint}</span></span>
                                            <span><strong style={{ color: '#9CA3AF' }}>Trust Score:</strong> <span style={{ color: '#EF4444' }}>{log.trustBefore} → {log.trustAfter}</span> | <strong style={{ color: '#9CA3AF' }}>Threat Info:</strong> <span style={{ color: '#EF4444' }}>{log.threatBefore} → {log.threatAfter}</span></span>

                                            {log.effectOnSafety && (
                                                <div style={{ marginTop: '4px' }}>
                                                    <strong style={{ color: '#9CA3AF' }}>Effect on Website Safety:</strong><br />
                                                    <span style={{ color: '#D1D5DB' }}>{log.effectOnSafety}</span>
                                                </div>
                                            )}

                                            {log.securityRating && (
                                                <div>
                                                    <strong style={{ color: '#9CA3AF' }}>System Security Rating:</strong>{' '}
                                                    <span style={{ color: '#10B981', fontWeight: 'bold', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)' }}>
                                                        {log.securityRating}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="log-safeguarded" style={{ marginTop: '8px' }}>✓ SAFEGUARDED: {log.systemStatus}</div>
                                    </div>
                                );
                            })}
                            <div ref={logsEndRef} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveSecurityDrill;
