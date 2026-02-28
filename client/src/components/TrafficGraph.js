import React from 'react';
import '../components/CommandCenter.css';

const TrafficGraph = ({ traffic }) => {
  if (!traffic || traffic.length === 0) {
    traffic = [0];
  }
  const max = Math.max(...traffic, 1);

  const points = traffic
    .map((val, index) => {
      const x = (index / Math.max(traffic.length - 1, 1)) * 100;
      const y = 120 - (val / max) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <section
      style={{
        gridArea: 'bottom-left',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
      className="command-center-panel"
    >
      <div className="command-center-panel-header">
        <div className="command-center-panel-title">API Volume (Last Interval)</div>
      </div>
      <div className="command-center-panel-body">
        <svg viewBox="0 0 100 120" preserveAspectRatio="none" style={{ width: '100%', height: 140 }}>
          <polyline
            fill="none"
            stroke="#2563EB"
            strokeWidth="1.5"
            points={points}
          />
        </svg>
      </div>
    </section>
  );
};

export default TrafficGraph;
