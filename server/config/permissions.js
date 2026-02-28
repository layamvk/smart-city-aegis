const permissions = {
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
    }
};

module.exports = permissions;
