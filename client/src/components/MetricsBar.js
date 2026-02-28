import React, { useMemo } from 'react';
import { useCityEngine } from '../engine/CityEngine';
import './MetricsBar.css';

const MetricCell = ({ label, value, unit = '%', color = '#00F0FF', trend = 0 }) => (
    <div className="metric-cell">
        <span className="mc-label">{label}</span>
        <span className="mc-value" style={{ color }}>
            {value}{unit}
            {trend !== 0 && (
                <span className="mc-trend" style={{ color: trend > 0 ? '#FF3D3D' : '#00FF64' }}>
                    {trend > 0 ? ' ▲' : ' ▼'}
                </span>
            )}
        </span>
        <div className="mc-bar-bg">
            <div className="mc-bar-fg" style={{ width: `${Math.min(100, value)}%`, background: color }} />
        </div>
    </div>
);

const MetricsBar = () => {
    const { summary, globalThreatScore, traffic, water } = useCityEngine();

    const criticalJunctions = useMemo(
        () => traffic.junctions.filter(j => j.congestion > 80).length,
        [traffic]
    );

    const avgWater = useMemo(
        () => Math.round(water.reservoirs.reduce((a, r) => a + (r.capacityPercent ?? r.capacity ?? 0), 0) / water.reservoirs.length),
        [water]
    );

    const threatColor = globalThreatScore > 75 ? '#FF3D3D' : globalThreatScore > 45 ? '#FFA500' : '#00FF64';

    return (
        <div className="metrics-bar">
            <MetricCell label="TRAFFIC" value={summary.traffic} color="#00F0FF" />
            <div className="mb-divider" />
            <MetricCell label="GRID" value={summary.grid} color="#F59E0B" />
            <div className="mb-divider" />
            <MetricCell label="WATER" value={avgWater} color="#3B82F6" />
            <div className="mb-divider" />
            <MetricCell label="THREAT" value={Math.round(globalThreatScore)} color={threatColor} />
            <div className="mb-divider" />
            <div className="metric-cell">
                <span className="mc-label">CRITICAL JUNCTIONS</span>
                <span className="mc-value" style={{ color: criticalJunctions > 5 ? '#FF3D3D' : '#E6F1FF' }}>
                    {criticalJunctions}
                </span>
            </div>
            <div className="mb-divider" />
            <div className="metric-cell status-cell">
                <span className="live-dot" />
                <span className="mc-label" style={{ color: '#00FF64' }}>SYSTEM LIVE</span>
            </div>
        </div>
    );
};

export default MetricsBar;
