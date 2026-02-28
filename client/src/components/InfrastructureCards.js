import React from 'react';
import { useCityEngine } from '../engine/CityEngine';

const InfrastructureCards = () => {
    const { summary } = useCityEngine();

    const cards = [
        { label: 'GRID', value: summary.grid, icon: '⚡' },
        { label: 'WATER', value: summary.water, icon: '💧' },
        { label: 'TRAFFIC', value: summary.traffic, icon: '🚗' },
    ];

    return (
        <div className="infrastructure-summary-grid">
            {cards.map((c, i) => (
                <div key={i} className="dashboard-panel infra-card" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="infra-icon">{c.icon}</div>
                    <div className="infra-label">{c.label}</div>
                    <div className="infra-value metric-number">{c.value}%</div>
                    <div className="infra-progress-bg">
                        <div className="infra-progress-fg" style={{ width: `${c.value}%`, background: '#00F0FF' }} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default InfrastructureCards;
