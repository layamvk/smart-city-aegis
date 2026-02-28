const ROLES = {
    SUPER_ADMIN: 'SuperAdmin',
    TRAFFIC_ADMIN: 'TrafficAdmin',
    ELECTRICITY_ADMIN: 'ElectricityAdmin',
    WATER_ADMIN: 'WaterAdmin',
    LIGHTING_ADMIN: 'LightingAdmin',
    CCTV_OPERATOR: 'CCTVOperator',
    SECURITY_ANALYST: 'SecurityAnalyst',
    VIEWER: 'Viewer'
};

const ROLE_VALUES = Object.values(ROLES);

module.exports = {
    ROLES,
    ROLE_VALUES
};
