const uiPermissions = {
    SuperAdmin: {
        modules: ["overview", "traffic", "grid", "water", "lighting", "emergency", "security"],
        actions: ["read", "write", "override"]
    },
    TrafficAdmin: {
        modules: ["overview", "traffic", "emergency"],
        actions: ["read", "write"]
    },
    ElectricityAdmin: {
        modules: ["overview", "grid", "emergency"],
        actions: ["read", "write"]
    },
    WaterAdmin: {
        modules: ["overview", "water", "emergency"],
        actions: ["read", "write"]
    },
    LightingAdmin: {
        modules: ["overview", "lighting", "emergency"],
        actions: ["read", "write"]
    },
    CCTVOperator: {
        modules: ["overview", "traffic", "security"],
        actions: ["read"]
    },
    SecurityAnalyst: {
        modules: ["overview", "security", "emergency"],
        actions: ["read"]
    },
    Viewer: {
        modules: ["overview", "traffic", "grid", "water", "lighting", "emergency", "security"],
        actions: ["read"]
    },
    // Mapping current DB roles to UI for compatibility until DB is cleared
    Admin: {
        modules: ["overview", "traffic", "grid", "water", "lighting", "emergency", "security"],
        actions: ["read", "write", "override"]
    },
    TrafficOperator: {
        modules: ["overview", "traffic", "emergency"],
        actions: ["read", "write"]
    },
    EmergencyAuthority: {
        modules: ["overview", "traffic", "grid", "water", "lighting", "emergency"],
        actions: ["read", "write", "override"]
    }
};

export const canAccessModule = (role, moduleName) => {
    const perm = uiPermissions[role];
    return perm ? perm.modules.includes(moduleName) : false;
};

export const canWriteModule = (role, moduleName) => {
    const perm = uiPermissions[role];
    return perm ? perm.actions.includes("write") || perm.actions.includes("override") : false;
};

export default uiPermissions;
