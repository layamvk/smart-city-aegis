// Utility functions for Security and Risk Calculations

export const ZONES = ['North', 'South', 'East', 'West', 'Central'];

export const getRiskColor = (riskScore) => {
  if (riskScore < 30) return '#00cc44';
  if (riskScore < 70) return '#ffaa00';
  return '#ff3333';
};

export const getRiskLevel = (score) => {
  if (score < 30) return 'LOW';
  if (score < 60) return 'MEDIUM';
  if (score < 80) return 'HIGH';
  return 'CRITICAL';
};

export const getThreatLevel = (score) => {
  if (score < 30) return { level: 'LOW', color: '#00cc44' };
  if (score < 60) return { level: 'MEDIUM', color: '#ffaa00' };
  if (score < 80) return { level: 'HIGH', color: '#ff6600' };
  return { level: 'CRITICAL', color: '#ff3333' };
};

export const getSignalColor = (status) => {
  const colors = {
    'RED': '#ff3333',
    'YELLOW': '#ffaa00',
    'GREEN': '#00cc44'
  };
  return colors[status] || '#666';
};

export const canModifyInfrastructure = (userRole, deviceTrustScore, globalThreatScore) => {
  if (!userRole) return false;
  if (deviceTrustScore < 40) return false;
  if (globalThreatScore > 80 && userRole !== 'Admin') return false;
  return true;
};

export const formatTimestamp = (date) => {
  return new Date(date).toLocaleTimeString();
};

export const calculateZoneRisk = (zoneData, globalThreatScore) => {
  let risk = 0;
  if (zoneData.trafficHealth < 50) risk += 20;
  if (zoneData.waterLevel < 30) risk += 25;
  if (zoneData.gridLoad > 80) risk += 30;
  if (zoneData.lightStatus < 50) risk += 15;
  risk += Math.max(0, (globalThreatScore - 30) * 0.3);
  return Math.min(100, risk);
};

export const simulateDataVariation = (baseValue, variance = 5) => {
  return Math.max(0, Math.min(100, baseValue + (Math.random() - 0.5) * variance));
};
