import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessModule } from '../config/uiPermissions';
import './SideNav.css';

const SideNav = () => {
    const { user } = useAuth();
    const role = user?.role || 'Viewer';

    // Added module keys for permission mapping
    const links = [
        { path: '/', label: 'OVERVIEW', icon: '📊', module: 'overview' },
        { path: '/traffic', label: 'TRAFFIC', icon: '🚦', module: 'traffic' },
        { path: '/water', label: 'WATER', icon: '💧', module: 'water' },
        { path: '/grid', label: 'GRID', icon: '⚡', module: 'grid' },
        { path: '/lights', label: 'LIGHTING', icon: '💡', module: 'lighting' },
        { path: '/emergency', label: 'EMERGENCY', icon: '🚑', module: 'emergency' },
        { path: '/governance', label: 'GOVERNANCE', icon: '🏛️', module: 'governance' },
        { path: '/security', label: 'SECURITY', icon: '🛡️', module: 'security' }
    ];

    return (
        <aside className="side-nav">
            <div className="nav-group">
                {links.filter(link => !link.module || canAccessModule(role, link.module)).map(link => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{link.icon}</span>
                        <span className="nav-label">{link.label}</span>
                    </NavLink>
                ))}
            </div>

            <div className="nav-footer">
                <div className="status-dot"></div>
                <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>SYSTEM STATUS: NOMINAL</span>
            </div>
        </aside>
    );
};

export default SideNav;
