import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MapView from './MapView';
import MonitoringPanel from './MonitoringPanel';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#121212' }}>
      <header style={{ padding: '10px', backgroundColor: '#1e1e1e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>SmartCity Dashboard - Role: {user.role}</h1>
        <button onClick={logout} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px' }}>
          Logout
        </button>
      </header>
      <div style={{ flex: 1, display: 'flex' }}>
        <div style={{ flex: 2 }}>
          <MapView />
        </div>
        <div style={{ flex: 1, padding: '10px' }}>
          <MonitoringPanel />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
