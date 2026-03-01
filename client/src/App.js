import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CityEngineProvider } from './engine/CityEngine';
import { MapProvider } from './context/MapContext';

import Login from './components/Login';
import MapRoot from './components/MapRoot';
import TopNav from './components/TopNav';
import SideNav from './components/SideNav';
import ZoneDrawer from './components/ZoneDrawer';
import NodeDrawer from './components/NodeDrawer';
import MetricsBar from './components/MetricsBar';
import LiveSecurityDrill from './components/LiveSecurityDrill/LiveSecurityDrill';
import CommandPalette from './components/CommandPalette';
import AmbientCursor from './components/AmbientCursor';

// Pages
import OverviewPage from './pages/OverviewPage';
import TrafficPage from './pages/TrafficPage';
import WaterPage from './pages/WaterPage';
import GridPage from './pages/GridPage';
import LightingPage from './pages/LightingPage';
import EmergencyPage from './pages/EmergencyPage';
import GovernancePage from './pages/GovernancePage';
import SecurityPage from './pages/SecurityPage';

const AppContent = () => {
  const location = useLocation();
  const isOverview = location.pathname === '/' || location.pathname === '';
  const { user, logout } = useAuth();
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedZoneData, setSelectedZoneData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  if (!user) {
    return (
      <div className="app-root">
        <AmbientCursor />
        <div className="blob-stage" aria-hidden="true">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
          <div className="blob blob-4" />
        </div>
        <div className="login-screen">
          <Login />
        </div>
      </div>
    );
  }

  const handleZoneClick = (zoneId, zoneData) => {
    setSelectedZone(zoneId);
    setSelectedZoneData(zoneData);
    setSelectedNode(null); // clear node selection when changing zone
  };

  const handleNodeClick = (nodeData) => {
    setSelectedNode(nodeData);
  };

  return (
    <div className="app-root">
      <AmbientCursor />

      {/* ── Fluid Blob Background ───────────────────────────── */}
      <div className="blob-stage" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="blob blob-4" />
      </div>

      {/* Persistent map background — never unmounts */}
      <MapRoot
        enabled={isOverview}
        activeZone={selectedZone}
        onZoneClick={handleZoneClick}
        onNodeClick={handleNodeClick}
      />

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
      {isOverview && <LiveSecurityDrill />}

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
