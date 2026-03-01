import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CityEngineProvider } from './engine/CityEngine';
import { MapProvider } from './context/MapContext';

import Login from './components/Login';
import TopNav from './components/TopNav';
import SideNav from './components/SideNav';
import ZoneDrawer from './components/ZoneDrawer';
import NodeDrawer from './components/NodeDrawer';
import MetricsBar from './components/MetricsBar';
import CommandPalette from './components/CommandPalette';

// Pages
import OverviewPage from './pages/OverviewPage';
import TrafficPage from './pages/TrafficPage';
import WaterPage from './pages/WaterPage';
import GridPage from './pages/GridPage';
import LightingPage from './pages/LightingPage';
import EmergencyPage from './pages/EmergencyPage';
import GovernancePage from './pages/GovernancePage';
import SecurityPage from './pages/SecurityPage';

// Lazy-load the heavy Leaflet map component — reduces initial bundle size
const MapRoot = lazy(() => import('./components/MapRoot'));

const MapFallback = () => (
  <div style={{
    position: 'absolute', inset: 0,
    background: 'var(--bg, #0A0E16)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'rgba(255,255,255,0.3)', fontSize: 12, letterSpacing: '0.1em',
    textTransform: 'uppercase', fontFamily: 'Inter, sans-serif'
  }}>
    Initialising map…
  </div>
);

const AppContent = () => {
  const location = useLocation();
  const isOverview = location.pathname === '/' || location.pathname === '';
  const { user, logout } = useAuth();
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedZoneData, setSelectedZoneData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  if (!user) {
    return (
      <div className="login-screen">
        <Login />
      </div>
    );
  }

  const handleZoneClick = (zoneId, zoneData) => {
    setSelectedZone(zoneId);
    setSelectedZoneData(zoneData);
    setSelectedNode(null);
  };

  const handleNodeClick = (nodeData) => {
    setSelectedNode(nodeData);
  };

  return (
    <div className="app-root">
      {/* Persistent map background — never unmounts after first load */}
      <Suspense fallback={<MapFallback />}>
        <MapRoot
          enabled={isOverview}
          activeZone={selectedZone}
          onZoneClick={handleZoneClick}
          onNodeClick={handleNodeClick}
        />
      </Suspense>

      <div className={`map-cinematic-overlay ${!isOverview ? 'active' : ''}`} />

      <div className="dashboard-overlay">
        <TopNav className="dashboard-panel" user={user} onLogout={logout} />

        <div className="app-body">
          <SideNav className="dashboard-panel" />
          <main className="main-content">
            <div key={location.pathname} className="page-transition-wrapper">
              <Routes>
                <Route path="/" element={<OverviewPage />} />
                <Route path="/traffic" element={<TrafficPage />} />
                <Route path="/water" element={<WaterPage />} />
                <Route path="/grid" element={<GridPage />} />
                <Route path="/lights" element={<LightingPage />} />
                <Route path="/emergency" element={<EmergencyPage />} />
                <Route path="/governance" element={<GovernancePage />} />
                <Route path="/security" element={<SecurityPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>

      {/* Zone click drawer */}
      <ZoneDrawer
        zoneId={selectedZone}
        zone={selectedZoneData}
        onClose={() => setSelectedZone(null)}
      />

      {/* Node Drawer */}
      <NodeDrawer
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette />

      {/* Sticky metrics bar */}
      <div className="dashboard-panel" style={{ zIndex: 100, position: 'relative' }}>
        <MetricsBar />
      </div>
    </div>
  );
};


function App() {
  return (
    <Router>
      <AuthProvider>
        <CityEngineProvider>
          <MapProvider>
            <AppContent />
          </MapProvider>
        </CityEngineProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
