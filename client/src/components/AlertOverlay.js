import React from 'react';

const AlertOverlay = ({ message }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 0, 60, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      animation: 'flicker 1s infinite'
    }}>
      <h1 style={{
        color: '#FFFFFF',
        fontSize: '48px',
        textShadow: '0 0 20px #FFFFFF',
        animation: 'pulse 1s infinite'
      }}>
        {message}
      </h1>
    </div>
  );
};

export default AlertOverlay;
