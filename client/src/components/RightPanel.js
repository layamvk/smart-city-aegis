import React from 'react';
import { useCityEngine } from '../engine/CityEngine';

const RightPanel = () => {
    const { globalThreatScore, deviceTrustScore } = useCityEngine();

    return (
        <div style={{ padding: '5px 0' }}>
            <div style={{ fontSize: 9, color: '#4B6080', letterSpacing: '0.15em', marginBottom: 15 }}>SYSTEM DIAGNOSTICS</div>

            <div style={{ marginBottom: 15 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 10, color: '#8899BB' }}>ENCRYPTION MESH</span>
                    <span style={{ fontSize: 10, color: '#00F0FF', fontWeight: 700 }}>ACTIVE</span>
                </div>
                <div style={{ height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                    <div style={{ height: '100%', width: '100%', background: '#00F0FF' }} />
                </div>
            </div>

            <div style={{ marginBottom: 15 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 10, color: '#8899BB' }}>ZERO-TRUST VERIFICATION</span>
                    <span style={{ fontSize: 10, color: '#00F0FF', fontWeight: 700 }}>{deviceTrustScore}%</span>
                </div>
                <div style={{ height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                    <div style={{ height: '100%', width: `${deviceTrustScore}%`, background: deviceTrustScore < 40 ? '#FF3D3D' : '#00F0FF' }} />
                </div>
                {deviceTrustScore < 40 && (
                    <div style={{ marginTop: 8, fontSize: 8, color: '#FF3D3D', fontWeight: 700, letterSpacing: '0.1em' }}>
                        RESTRICTED MODE ACTIVE: DEVICE TRUST LOW
                    </div>
                )}
            </div>

            <div style={{ padding: '8px', background: 'rgba(0,240,255,0.03)', border: '1px solid rgba(0,240,255,0.1)', borderRadius: 6 }}>
                <div style={{ fontSize: 9, color: '#00F0FF', marginBottom: 5 }}>THREAT ANALYSIS</div>
                <div style={{ fontSize: 11, color: '#E6F1FF', lineHeight: 1.4 }}>
                    {globalThreatScore > 60 ? 'Multiple security anomalies detected. Sector isolation recommended.' : 'All systems operating within normal parameters.'}
                </div>
            </div>
        </div>
    );
};

export default RightPanel;
