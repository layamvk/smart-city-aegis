import React, { memo } from 'react';
import { useCityEngine } from '../engine/CityEngine';

const LiveEventFeed = () => {
    const { events } = useCityEngine();

    const sevColor = {
        HIGH: '#FF3D3D',
        MEDIUM: '#FFA726',
        INFO: '#00F0FF',
        CRITICAL: '#FF3D3D',
        LOW: '#00FF64'
    };

    return (
        <div className="live-event-feed dashboard-panel" style={{ padding: 15, borderRadius: '0 0 10px 0' }}>
            <div style={{ fontSize: 10, color: '#00F0FF', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00F0FF', boxShadow: '0 0 10px #00F0FF' }} />
                LIVE SYSTEM EVENTS
            </div>
            <div style={{ maxHeight: '320px', overflowY: 'auto', paddingRight: 5 }}>
                {events.slice(0, 15).map((ev) => {
                    const sc = sevColor[ev.severity?.toUpperCase()] || '#8899BB';
                    return (
                        <div key={ev.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', gap: 10 }}>
                            <div style={{ width: 3, height: 20, background: sc, borderRadius: 2 }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 11, color: '#E6F1FF', fontWeight: 500 }}>{ev.type?.replace(/_/g, ' ')}</div>
                                <div style={{ fontSize: 9, color: '#4B6080', marginTop: 2 }}>
                                    {new Date(ev.timestamp).toLocaleTimeString()} · {ev.payload?.zone || 'System'}
                                </div>
                            </div>
                            <div style={{ fontSize: 9, color: sc, fontWeight: 700, fontFamily: 'monospace' }}>{ev.severity}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default memo(LiveEventFeed);
