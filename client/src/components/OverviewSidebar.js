import React, { memo } from 'react';
import { useCityEngine } from '../engine/CityEngine';
import { useAuth } from '../context/AuthContext';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const riskColor = (r) => r < 30 ? '#00FF64' : r < 70 ? '#FFA500' : '#FF3232';
const statusColor = { NORMAL: '#00FF64', ELEVATED: '#FFA500', CRITICAL: '#FF3232' };
const sevColor = { HIGH: '#FF3232', MEDIUM: '#FFA500', INFO: '#00F2FF', CRITICAL: '#dc2626', LOW: '#00FF64' };

// ─── Zone Card ────────────────────────────────────────────────────────────────
const ZoneCard = ({ zone }) => {
    const risk = zone.riskScore || 0;
    const rc = riskColor(risk);
    const sc = statusColor[zone.status] || '#8899BB';
    const isCritical = zone.status === 'CRITICAL';

    return (
        <div style={{
            background: 'rgba(20,25,35,0.85)',
            border: `1px solid ${isCritical ? '#FF3232' : 'rgba(0,242,255,0.1)'}`,
            borderLeft: `3px solid ${sc}`,
            borderRadius: 7,
            padding: '10px 12px',
            marginBottom: 8,
            transition: 'border-color 0.5s ease',
            boxShadow: isCritical ? '0 0 12px rgba(255,50,50,0.15)' : 'none',
            animation: isCritical ? 'zone-pulse 2s ease-in-out infinite' : 'none',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#E6F1FF', letterSpacing: '0.4px' }}>{zone.name}</div>
                    <div style={{ fontSize: 10, color: '#8899BB', marginTop: 2, letterSpacing: '0.3px' }}>{zone.type}</div>
                </div>
                <span style={{
                    fontSize: 9, fontWeight: 700, color: sc,
                    background: `${sc}18`, padding: '2px 7px',
                    borderRadius: 3, border: `1px solid ${sc}33`,
                    letterSpacing: '0.08em',
                }}>
                    {zone.status}
                </span>
            </div>

            {/* Risk bar */}
            <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#8899BB', marginBottom: 4 }}>
                    <span>Risk Score</span>
                    <span style={{ color: rc, fontFamily: 'monospace', fontWeight: 700, textShadow: `0 0 6px ${rc}55` }}>
                        {risk.toFixed(1)}%
                    </span>
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <div className="risk-bar-fill" style={{
                        height: '100%', width: `${risk}%`, background: rc, borderRadius: 2,
                        boxShadow: `0 0 4px ${rc}88`,
                    }} />
                </div>
            </div>

            {/* Mini stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                {[
                    { label: '⚡ Grid', val: `${(zone.gridLoad || 0).toFixed(0)}%`, color: zone.gridLoad > 85 ? '#FF3232' : '#8899BB' },
                    { label: '🚗 Traffic', val: `${(zone.trafficDensity || 0).toFixed(0)}%`, color: zone.trafficDensity > 75 ? '#FFA500' : '#8899BB' },
                    { label: '💧 Water', val: `${(zone.reservoirLevel || 0).toFixed(0)}%`, color: zone.reservoirLevel < 25 ? '#FF3232' : '#8899BB' },
                ].map(({ label, val, color }) => (
                    <div key={label} style={{ textAlign: 'center', padding: '4px 2px', background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
                        <div style={{ fontSize: 9, color: '#4B6080' }}>{label}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color, fontFamily: 'monospace' }}>{val}</div>
                    </div>
                ))}
            </div>

            {zone.contaminated && (
                <div style={{ marginTop: 6, fontSize: 10, color: '#a855f7', textAlign: 'center', letterSpacing: '0.05em' }}>
                    ☣ CONTAMINATION DETECTED — Override Blocked
                </div>
            )}
            {zone.activeIncidents > 0 && (
                <div style={{ marginTop: 4, fontSize: 10, color: '#FF3232', textAlign: 'center' }}>
                    🚨 {zone.activeIncidents} Active Incident{zone.activeIncidents !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
};

// ─── Event Feed ───────────────────────────────────────────────────────────────
const EventFeed = memo(({ events }) => (
    <div style={{ maxHeight: 240, overflowY: 'auto' }}>
        {events.length === 0 && (
            <div style={{ fontSize: 11, color: '#4B6080', padding: '16px 0', textAlign: 'center' }}>
                ◈ All systems nominal
            </div>
        )}
        {events.slice(0, 20).map((ev, i) => {
            const sc = sevColor[ev.severity?.toUpperCase()] || '#8899BB';
            return (
                <div
                    key={ev.id}
                    className={i === 0 ? 'slide-in' : ''}
                    style={{
                        display: 'flex', gap: 10, alignItems: 'flex-start',
                        padding: '6px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}
                >
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: sc, marginTop: 5, flexShrink: 0, boxShadow: `0 0 4px ${sc}` }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 500, color: '#C8D8F0', lineHeight: 1.3 }}>
                            {ev.type?.replace(/_/g, ' ')}
                        </div>
                        <div style={{ fontSize: 9, color: '#4B6080', marginTop: 2 }}>
                            {ev.payload?.zone && `${ev.payload.zone} · `}
                            {new Date(ev.timestamp).toLocaleTimeString()}
                        </div>
                    </div>
                    <span style={{ fontSize: 9, color: sc, flexShrink: 0, fontFamily: 'monospace' }}>{ev.severity}</span>
                </div>
            );
        })}
    </div>
));

// ─── Overview Sidebar ─────────────────────────────────────────────────────────
const OverviewSidebar = () => {
    const { zones, events, globalThreatScore, deviceTrustScore } = useCityEngine();
    const { user } = useAuth();

    const zoneList = Object.values(zones).sort((a, b) => b.riskScore - a.riskScore);
    const tc = riskColor(globalThreatScore);
    const highEvCount = events.filter(e => e.severity === 'HIGH' || e.severity === 'CRITICAL').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* ─ Global Status ─────────────────────────────────────────────── */}
            <div style={{
                background: 'rgba(20,25,35,0.92)',
                border: '1px solid rgba(0,242,255,0.12)',
                borderRadius: 8, padding: 14,
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}>
                <div style={{ fontSize: 9, color: '#4B6080', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12 }}>
                    ◈ Chennai Command — Global Status
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                        <div style={{ fontSize: 9, color: '#8899BB', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Threat Score</div>
                        <div className="metric-value" style={{ fontSize: 28, fontWeight: 800, color: tc, lineHeight: 1 }}>
                            {globalThreatScore.toFixed(0)}
                        </div>
                        <div style={{ fontSize: 10, color: tc, marginTop: 4, letterSpacing: '0.1em' }}>
                            {globalThreatScore < 30 ? 'LOW' : globalThreatScore < 60 ? 'MEDIUM' : globalThreatScore < 80 ? 'HIGH' : 'CRITICAL'}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: 9, color: '#8899BB', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Device Trust</div>
                        <div className="metric-value" style={{ fontSize: 28, fontWeight: 800, color: deviceTrustScore >= 70 ? '#00FF64' : deviceTrustScore >= 40 ? '#FFA500' : '#FF3232', lineHeight: 1 }}>
                            {deviceTrustScore}%
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 9, color: '#8899BB', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Operator</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#E6F1FF' }}>{user?.username}</div>
                        <div style={{ fontSize: 10, color: '#8899BB', marginTop: 3 }}>{user?.role}</div>
                    </div>
                </div>

                {/* Threat bar */}
                <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden', marginBottom: 2 }}>
                    <div className="risk-bar-fill" style={{
                        height: '100%', width: `${globalThreatScore}%`,
                        background: `linear-gradient(to right, #00FF64, ${tc})`,
                        borderRadius: 2, boxShadow: `0 0 6px ${tc}88`,
                    }} />
                </div>
                <div style={{ fontSize: 9, color: '#4B6080', textAlign: 'right' }}>/ 100</div>
            </div>

            {/* ─ Zone Cards ────────────────────────────────────────────────── */}
            <div>
                <div style={{ fontSize: 9, color: '#4B6080', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>
                    Chennai Zones  ·  sorted by risk
                </div>
                {zoneList.map(z => <ZoneCard key={z.id} zone={z} />)}
            </div>

            {/* ─ Live Feed ─────────────────────────────────────────────────── */}
            <div style={{
                background: 'rgba(20,25,35,0.92)',
                border: '1px solid rgba(0,242,255,0.1)',
                borderRadius: 8, padding: 14,
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontSize: 9, color: '#4B6080', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                        ● Live Event Feed
                    </div>
                    {highEvCount > 0 && (
                        <span style={{ fontSize: 9, color: '#FF3232', background: 'rgba(255,50,50,0.1)', padding: '2px 6px', borderRadius: 3 }}>
                            {highEvCount} HIGH
                        </span>
                    )}
                </div>
                <EventFeed events={events} />
            </div>
        </div>
    );
};

export default OverviewSidebar;
