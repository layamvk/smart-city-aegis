import React from 'react';
import { useCityEngine } from '../engine/CityEngine';
import './TopNav.css';

const TopNav = ({ user, onLogout }) => {
    const { globalThreatScore, summary } = useCityEngine();

    return (
        <header className="top-nav">
            <div className="nav-brand">
                <div className="logo"></div>
                <div className="brand-text">
                    <h1>SMART CITY CONTROL</h1>
                    <span className="subtitle">CHENNAI URBAN DIGITAL TWIN</span>
                </div>
            </div>

            <div className="nav-metrics">
                <div className="metric-item">
                    <span className="label">THREAT LEVEL</span>
                    <span className={`value ${globalThreatScore > 75 ? 'critical' : ''}`}>{globalThreatScore.toFixed(0)}</span>
                </div>
                <div className="metric-divider"></div>
                <div className="metric-item">
                    <span className="label">TRAFFIC</span>
                    <span className="value">{summary.traffic}%</span>
                </div>
                <div className="metric-item">
                    <span className="label">GRID</span>
                    <span className="value">{summary.grid}%</span>
                </div>
            </div>

            <div className="nav-user">
                <div className="user-info">
                    <span className="username">{user?.username}</span>
                    <span className="role">{user?.role}</span>
                </div>
                <button onClick={onLogout} className="logout-btn">DISCONNECT</button>
            </div>
        </header>
    );
};

export default TopNav;
