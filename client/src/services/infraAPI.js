import api from './api';

export const getGlobalThreatScore = () => api.get('/threat/status');

export const getTrafficSignals = () => api.get('/traffic/signals');

export const changeTrafficSignal = (signalId, status) =>
  api.post(`/traffic/signal/${signalId}/change`, { status });

export const emergencyTrafficOverride = (signalId) =>
  api.post('/traffic/emergency-override', { signalId });

export const getWaterLevels = () => api.get('/water/levels');

export const adjustWaterFlow = (zoneId, flowRate) =>
  api.post('/water/flow-adjust', { zoneId, flowRate });

export const shutdownWaterZone = (zoneId) =>
  api.post('/water/shutdown-zone', { zoneId });

export const overrideGrid = (gridId, status) =>
  api.post('/power/grid/override', { gridId, status });

export const getEmergencyIncidents = () => api.get('/emergency/incidents');

export const dispatchUnit = (incidentId, unitId) =>
  api.post('/emergency/dispatch-unit', { incidentId, unitId });

export const getMonitoringStatus = () => api.get('/monitoring/status');

export const getThreatEvents = () => api.get('/monitoring/threats');

export const getAuditLogs = () => api.get('/monitoring/audit');
