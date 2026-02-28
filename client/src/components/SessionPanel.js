import React from 'react';
import '../components/CommandCenter.css';

const getRiskClass = (riskScore) => {
  if (riskScore >= 75) return 'risk-pill risk-pill--high';
  if (riskScore >= 40) return 'risk-pill risk-pill--medium';
  return 'risk-pill risk-pill--low';
};

const SessionPanel = ({ sessions }) => {
  return (
    <aside
      style={{
        gridArea: 'left',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
      className="command-center-panel"
    >
      <div className="command-center-panel-header">
        <div className="command-center-panel-title">Active Sessions</div>
      </div>
      <div className="command-center-panel-body" style={{ overflowY: 'auto', maxHeight: '100%' }}>
        <table className="command-center-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Zone</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 && (
              <tr>
                <td colSpan={4} style={{ paddingTop: 12, color: '#6B7280', fontSize: 12 }}>
                  No active sessions.
                </td>
              </tr>
            )}
            {sessions.map((session, index) => (
              <tr key={index}>
                <td>{session.username}</td>
                <td>{session.role}</td>
                <td>{session.zone}</td>
                <td>
                  <span className={getRiskClass(session.riskScore)}>
                    {session.riskScore ?? 0}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </aside>
  );
};

export default SessionPanel;
