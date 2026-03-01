import React, { useState, useEffect } from 'react';

const TopBar = ({ threatScore = 0, deviceTrust = 100, user, onLogout }) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const tc = threatScore < 30 ? '#00FF64' : threatScore < 60 ? '#FFA500' : threatScore < 80 ? '#FF6600' : '#FF3232';
  const tl = threatScore < 30 ? 'LOW' : threatScore < 60 ? 'MEDIUM' : threatScore < 80 ? 'HIGH' : 'CRITICAL';
  const dtc = deviceTrust >= 70 ? '#00FF64' : deviceTrust >= 40 ? '#FFA500' : '#FF3232';

  return (
    <header style={{
      height: 56,
      background: 'rgba(11,15,20,0.98)',
      borderBottom: '1px solid rgba(0,242,255,0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      boxShadow: '0 1px 0 rgba(0,242,255,0.06)',
    }}>
      {/* Left: Logo + Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 6,
          background: 'rgba(0,242,255,0.08)',
          border: '1px solid rgba(0,242,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, color: '#00F2FF',
          boxShadow: '0 0 10px rgba(0,242,255,0.15)',
        }}>
          ⬡
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#E6F1FF', letterSpacing: '0.08em' }}>
            AEGIS COMMAND
          </div>
          <div style={{ fontSize: 9, color: '#4B6080', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            Chennai Smart City · Cyber Command Platform
          </div>
        </div>
      </div>

      {/* Center: Threat + Trust */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        {/* Threat Score */}
        <div>
          <div style={{ fontSize: 9, color: '#4B6080', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 4 }}>
            Global Threat
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 70, height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${threatScore}%`,
                background: tc, borderRadius: 2,
                transition: 'width 1s ease, background 0.5s ease',
                boxShadow: `0 0 4px ${tc}88`,
              }} />
            </div>
            <span className="metric-value" style={{ fontSize: 14, fontWeight: 800, color: tc, minWidth: 28 }}>
              {Math.round(threatScore)}
            </span>
            <span style={{
              fontSize: 9, color: tc,
              background: `${tc}15`, padding: '2px 6px',
              borderRadius: 3, border: `1px solid ${tc}33`,
              letterSpacing: '0.1em', fontWeight: 700,
            }}>
              {tl}
            </span>
          </div>
        </div>

        {/* Device Trust */}
        <div>
          <div style={{ fontSize: 9, color: '#4B6080', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 4 }}>
            Device Trust
          </div>
          <span className="metric-value" style={{ fontSize: 14, fontWeight: 800, color: dtc }}>
            {deviceTrust}%
          </span>
        </div>

        {/* Environment */}
        <div style={{
          padding: '3px 10px',
          background: 'rgba(0,242,255,0.06)',
          border: '1px solid rgba(0,242,255,0.15)',
          borderRadius: 4, fontSize: 9, color: '#00F2FF',
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          ● LIVE
        </div>
      </div>

      {/* Right: User + Clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {user && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#E6F1FF', letterSpacing: '0.04em' }}>
              {user.username}
            </div>
            <div style={{ fontSize: 9, color: '#8899BB', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {user.role}
            </div>
          </div>
        )}
        <div style={{
          fontSize: 12, color: '#8899BB',
          fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums',
          letterSpacing: '0.06em',
        }}>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              padding: '4px 11px', background: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 4, color: '#4B6080',
              fontSize: 11, cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.target.style.color = '#FF3232'; e.target.style.borderColor = '#FF323255'; }}
            onMouseLeave={e => { e.target.style.color = '#4B6080'; e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default TopBar;
