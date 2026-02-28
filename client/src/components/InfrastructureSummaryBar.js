import React, { memo } from 'react';
import { useCityEngine } from '../engine/CityEngine';

const SummaryItem = ({ label, value, unit = '', color = '#E6F1FF', sub }) => (
    <div style={{
        display: 'flex', flexDirection: 'column', padding: '0 24px',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        minWidth: 140
    }}>
        <div style={{ fontSize: 9, color: '#4B6080', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>
            {label}
        </div>
        <div className="metric-glow" style={{ fontSize: 18, color: color }}>
            {value}{unit}
        </div>
        {sub && <div style={{ fontSize: 9, color: '#4B6080', marginTop: 1 }}>{sub}</div>}
    </div>
);

const InfrastructureSummaryBar = memo(() => {
    const { summary } = useCityEngine();

    return (
        <div style={{
            display: 'flex', alignItems: 'center', height: 60,
            background: 'rgba(11, 15, 20, 0.95)',
            borderBottom: '1px solid rgba(0, 240, 255, 0.1)',
            overflowX: 'auto',
            pointerEvents: 'auto'
        }}>
            <SummaryItem
                label="Traffic Avg"
                value={summary.traffic}
                unit="%"
                color={summary.traffic > 70 ? '#FF3232' : '#00FF64'}
                sub="Flow Rate"
            />
            <SummaryItem
                label="Grid Load"
                value={summary.grid}
                unit="%"
                color={summary.grid > 85 ? '#FFA500' : '#00FF64'}
                sub="Energy Sys"
            />
            <SummaryItem
                label="Reservoir"
                value={summary.water}
                unit="%"
                color={summary.water < 30 ? '#FF3232' : '#00F0FF'}
                sub="Avg Level"
            />
            <SummaryItem
                label="Active Incidents"
                value={summary.incidents}
                color={summary.incidents > 5 ? '#FF3232' : '#00FF64'}
                sub="Field Ops"
            />

            <div style={{ marginLeft: 'auto', paddingRight: 24, textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: '#00F0FF', fontWeight: 600, letterSpacing: '0.05em' }}>
                    CHENNAI DIGITAL TWIN
                </div>
                <div style={{ fontSize: 9, color: '#4B6080' }}>
                    Real-time Infrastructure Simulation
                </div>
            </div>
        </div>
    );
});

export default InfrastructureSummaryBar;
