import React from 'react';
import '../components/CommandCenter.css';

const TrustGauge = ({ score }) => {
  const normalized = Math.max(0, Math.min(score, 100));

  const riskClass =
    normalized >= 75 ? 'risk-indicator--high' : normalized >= 40 ? 'risk-indicator--medium' : 'risk-indicator--low';

  return (
    <section
      style={{
        gridArea: 'bottom-center',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
      className="command-center-panel"
    >
      <div className="command-center-panel-header">
        <div className="command-center-panel-title">System Trust Score</div>
      </div>
      <div className="command-center-panel-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Current Score
          </div>
          <div style={{ fontSize: 20, fontVariantNumeric: 'tabular-nums' }} className={riskClass}>
            {normalized}
          </div>
        </div>
        <div className="trust-bar-wrapper">
          <div
            className="trust-bar-fill"
            style={{ width: `${normalized}%` }}
          />
        </div>
      </div>
    </section>
  );
};

export default TrustGauge;
