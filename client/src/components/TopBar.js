import React, { useState, useEffect } from 'react';

const TopBar = ({ threatScore = 0, deviceTrust = 100, user, onLogout }) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const tc = threatScore < 30 ? 'var(--success)' : threatScore < 60 ? 'var(--warning)' : 'var(--critical)';
  const tl = threatScore < 30 ? 'LOW' : threatScore < 60 ? 'MEDIUM' : threatScore < 80 ? 'HIGH' : 'CRITICAL';
  const dtc = deviceTrust >= 70 ? 'var(--success)' : deviceTrust >= 40 ? 'var(--warning)' : 'var(--critical)';

  return (
    <header style={{
      height: 64,
      background: 'var(--panel)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'relative',
      zIndex: 1000,
    }}>
      {/* Left: Logo + Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 'var(--radius-sm)',
          background: 'var(--accent-muted)',
          border: '1px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: 'var(--accent)',
        }}>
          ⬡
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-bright)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            AEGIS COMMAND
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.7 }}>
            Chennai · Cyber Security Command Center
          </div>
        </div>
      </div>

      {/* Center: Threat + Trust */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {/* Threat Score */}
        <div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontWeight: 600 }}>
            Global Threat Score
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${threatScore}%`,
                background: tc,
                transition: 'width 1s var(--ease)',
              }} />
            </div>
            <span className="metric-value" style={{ fontSize: 15, fontWeight: 700, color: tc, minWidth: 24 }}>
              {Math.round(threatScore)}
            </span>
            <span style={{
              fontSize: 9, color: tc,
              background: `${tc}15`, padding: '2px 8px',
              borderRadius: 'var(--radius-sm)', border: `1px solid ${tc}`,
              letterSpacing: '0.05em', fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              {tl}
            </span>
          </div>
        </div>

        {/* Device Trust */}
        <div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontWeight: 600 }}>
            Infrastructure Trust
          </div>
          <span className="metric-value" style={{ fontSize: 15, fontWeight: 700, color: dtc }}>
            {deviceTrust}%
          </span>
        </div>

        {/* Environment */}
        <div style={{
          padding: '4px 12px',
          background: 'var(--accent-muted)',
          border: '1px solid var(--accent)',
          borderRadius: 'var(--radius-sm)', fontSize: 10, color: 'var(--accent)',
          letterSpacing: '0.05em', textTransform: 'uppercase',
          fontWeight: 600
        }}>
          ● LIVE
        </div>
      </div>

      {/* Right: User + Clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {user && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-bright)' }}>
              {user.username}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              {user.role}
            </div>
          </div>
        )}
        <div style={{
          fontSize: 13, color: 'var(--text-muted)',
          fontFamily: 'var(--font-family)', fontVariantNumeric: 'tabular-nums',
          fontWeight: 500
        }}>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              padding: '6px 14px', background: 'var(--panel-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)',
              fontSize: 11, cursor: 'pointer',
              transition: 'all var(--duration) var(--ease)',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}
            onMouseEnter={e => { e.target.style.color = 'var(--critical)'; e.target.style.borderColor = 'var(--critical)'; }}
            onMouseLeave={e => { e.target.style.color = 'var(--text-muted)'; e.target.style.borderColor = 'var(--border)'; }}
          >
            Logout
          </button>
        )}
      </div>
    </header>

  );
};

export default TopBar;
