// --- TRAFFIC SYSTEM ---
export const TRAFFIC_INFRA = {
    junctions: [
        { id: "t_nagar_01", lat: 13.0418, lng: 80.2341, congestion: 72, phase: "GREEN", cycle: 120, emergency: false, manual: false },
        { id: "adyar_01", lat: 13.0012, lng: 80.2565, congestion: 45, phase: "RED", cycle: 90, emergency: false, manual: false },
        { id: "guindy_01", lat: 13.0067, lng: 80.2206, congestion: 88, phase: "GREEN", cycle: 150, emergency: false, manual: false },
        { id: "mylapore_01", lat: 13.0336, lng: 80.2677, congestion: 30, phase: "YELLOW", cycle: 60, emergency: false, manual: false },
        { id: "anna_nagar_01", lat: 13.0850, lng: 80.2101, congestion: 55, phase: "GREEN", cycle: 100, emergency: false, manual: false },
        { id: "velachery_01", lat: 12.9784, lng: 80.2185, congestion: 92, phase: "RED", cycle: 180, emergency: false, manual: false },
        { id: "porur_01", lat: 13.0382, lng: 80.1548, congestion: 40, phase: "GREEN", cycle: 90, emergency: false, manual: false },
        { id: "tambaram_01", lat: 12.9229, lng: 80.1275, congestion: 65, phase: "YELLOW", cycle: 120, emergency: false, manual: false },
        { id: "omr_01", lat: 12.8931, lng: 80.2274, congestion: 78, phase: "GREEN", cycle: 140, emergency: false, manual: false },
        { id: "parrys_01", lat: 13.0900, lng: 80.2889, congestion: 95, phase: "RED", cycle: 200, emergency: false, manual: false },
        { id: "egmore_01", lat: 13.0732, lng: 80.2604, congestion: 60, phase: "GREEN", cycle: 110, emergency: false, manual: false },
        { id: "nungambakkam_01", lat: 13.0585, lng: 80.2454, congestion: 82, phase: "RED", cycle: 160, emergency: false, manual: false },
        { id: "kodambakkam_01", lat: 13.0515, lng: 80.2234, congestion: 70, phase: "GREEN", cycle: 130, emergency: false, manual: false },
        { id: "chromepet_01", lat: 12.9516, lng: 80.1410, congestion: 50, phase: "YELLOW", cycle: 90, emergency: false, manual: false },
        { id: "pallavaram_01", lat: 12.9675, lng: 80.1491, congestion: 48, phase: "GREEN", cycle: 100, emergency: false, manual: false },
        { id: "perungudi_01", lat: 12.9654, lng: 80.2461, congestion: 85, phase: "RED", cycle: 170, emergency: false, manual: false },
        { id: "thiruvanmiyur_01", lat: 12.9860, lng: 80.2616, congestion: 42, phase: "GREEN", cycle: 80, emergency: false, manual: false },
        { id: "sholinganallur_01", lat: 12.9010, lng: 80.2279, congestion: 89, phase: "RED", cycle: 180, emergency: false, manual: false },
        { id: "navalur_01", lat: 12.8458, lng: 80.2264, congestion: 35, phase: "GREEN", cycle: 70, emergency: false, manual: false },
        { id: "siruseri_01", lat: 12.8271, lng: 80.2185, congestion: 25, phase: "GREEN", cycle: 60, emergency: false, manual: false },
        { id: "besant_nagar_01", lat: 13.0003, lng: 80.2690, congestion: 20, phase: "GREEN", cycle: 50, emergency: false, manual: false },
        { id: "kknagar_01", lat: 13.0396, lng: 80.1996, congestion: 68, phase: "RED", cycle: 120, emergency: false, manual: false },
        { id: "ashok_nagar_01", lat: 13.0345, lng: 80.2117, congestion: 75, phase: "GREEN", cycle: 140, emergency: false, manual: false },
        { id: "royapettah_01", lat: 13.0519, lng: 80.2621, congestion: 80, phase: "RED", cycle: 160, emergency: false, manual: false },
        { id: "kilpauk_01", lat: 13.0827, lng: 80.2431, congestion: 52, phase: "YELLOW", cycle: 100, emergency: false, manual: false }
    ],
    corridors: [
        { id: "omr_corridor", load: 81, priority: "HIGH", speed: 24 },
        { id: "gst_road", load: 75, priority: "CRITICAL", speed: 30 },
        { id: "mount_poonamallee", load: 60, priority: "MEDIUM", speed: 40 }
    ]
};

// --- WATER SYSTEM ---
export const WATER_INFRA = {
    reservoirs: [
        { id: "chembarambakkam", lat: 13.033, lng: 80.064, capacity: 84, inflow: 320, outflow: 295, risk: 3, pressure: 78 },
        { id: "redhills", lat: 13.189, lng: 80.182, capacity: 72, inflow: 210, outflow: 230, risk: 1, pressure: 65 },
        { id: "poondi", lat: 13.184, lng: 79.888, capacity: 60, inflow: 150, outflow: 140, risk: 2, pressure: 55 }
    ],
    pumpStations: Array.from({ length: 10 }).map((_, i) => ({
        id: `pump_st_${i + 1}`,
        lat: 13.0 + Math.random() * 0.1,
        lng: 80.1 + Math.random() * 0.1,
        status: "ON",
        flowRate: 150 + Math.random() * 50
    })),
    valves: Array.from({ length: 20 }).map((_, i) => ({
        id: `valve_${i + 1}`,
        lat: 13.0 + Math.random() * 0.1,
        lng: 80.1 + Math.random() * 0.1,
        state: "OPEN",
        pressure: 60 + Math.random() * 20
    }))
};

// --- ELECTRICITY GRID ---
export const GRID_INFRA = {
    substations: Array.from({ length: 10 }).map((_, i) => ({
        id: `substation_${i + 1}`,
        lat: 13.0 + Math.random() * 0.1,
        lng: 80.1 + Math.random() * 0.1,
        load: 60 + Math.random() * 30,
        status: "ACTIVE",
        health: 90 + Math.random() * 10
    })),
    feeders: Array.from({ length: 25 }).map((_, i) => ({
        id: `feeder_${i + 1}`,
        status: "CLOSED",
        current: 400 + Math.random() * 100
    })),
    health: 94.5,
    frequency: 49.98
};

// --- STREET LIGHTS ---
export const LIGHT_INFRA = {
    clusters: Array.from({ length: 30 }).map((_, i) => ({
        id: `light_cluster_${i + 1}`,
        lat: 13.0 + Math.random() * 0.1,
        lng: 80.1 + Math.random() * 0.1,
        brightness: 85,
        failures: Math.floor(Math.random() * 3),
        energySave: false
    })),
    globalBrightness: 85,
    energySaveMode: false
};

// --- MOCK INCIDENTS ---
export const MOCK_INCIDENTS = [
    { id: "INC-2401", type: "Multi-Vehicle Collision", location: "Perungudi – OMR Service Road", severity: "HIGH", detected: "3m ago", units: "2 Traffic Patrol, 1 Ambulance", eta: "4m", status: "ACTIVE" },
    { id: "INC-2402", type: "Signal Failure", location: "Anna Nagar Roundabout – NH 205", severity: "MEDIUM", detected: "8m ago", units: "1 Electrical Response Unit", eta: "6m", status: "ACTIVE" },
    { id: "INC-2403", type: "Water Main Pressure Drop", location: "Alandur – Zone 12", severity: "MEDIUM", detected: "11m ago", units: "1 Water Maintenance Team", pressureDrop: "-18 PSI", status: "CONTAINED" },
    { id: "INC-2404", type: "Transformer Overload", location: "Sholinganallur Substation", severity: "CRITICAL", detected: "2m ago", loadSpike: "+42%", units: "2 Grid Engineers", eta: "5m", status: "ESCALATED" },
    { id: "INC-2405", type: "Unauthorized Street Gathering", location: "T Nagar Commercial District", severity: "LOW", detected: "14m ago", units: "1 Police Patrol", status: "MONITORING" },
    { id: "INC-2406", type: "Highway Congestion Spike", location: "Guindy – GST Road", severity: "HIGH", detected: "5m ago", densityIncrease: "+27%", units: "2 Traffic Units", status: "ACTIVE" },
    { id: "INC-2407", type: "Reservoir Overflow Warning", location: "Chembarambakkam Reservoir", severity: "MEDIUM", detected: "18m ago", capacity: "92%", units: "1 Water Control Team", status: "MONITORING" },
    { id: "INC-2408", type: "CCTV AI Flag – Suspicious Vehicle", location: "Tondiarpet Port Road", severity: "MEDIUM", detected: "6m ago", cameraId: "CCTV-44", units: "1 Patrol Dispatched", status: "ACTIVE" },
    { id: "INC-2409", type: "Street Light Cluster Failure", location: "ECR Coastal Corridor", severity: "MEDIUM", detected: "22m ago", nodesOffline: 18, units: "1 Lighting Maintenance Crew", status: "ACTIVE" },
    { id: "INC-2410", type: "Gas Leak Sensor Alert", location: "Kodambakkam Residential Zone", severity: "CRITICAL", detected: "1m ago", units: "1 Fire Response Team", evacuationRadius: "500m", status: "ESCALATED" },
    { id: "INC-2411", type: "Illegal Dumping Activity", location: "Madhavaram Industrial Yard", severity: "LOW", detected: "32m ago", units: "Environmental Enforcement Team", status: "INVESTIGATING" },
    { id: "INC-2412", type: "Grid Voltage Instability", location: "Ambattur Industrial Estate", severity: "HIGH", detected: "7m ago", voltageFluctuation: "±14%", units: "2 Grid Engineers", status: "ACTIVE" },
    { id: "INC-2413", type: "Flash Flood Risk Warning", location: "Velachery – Inner Ring Road", severity: "HIGH", detected: "12m ago", rainfallSpike: "+38mm/hr", units: "1 Emergency Water Unit", status: "MONITORING" },
    { id: "INC-2414", type: "Metro Signal Communication Loss", location: "Guindy Metro Junction", severity: "CRITICAL", detected: "4m ago", units: "1 Metro Ops Control", status: "ESCALATED" },
    { id: "INC-2415", type: "Public WiFi Intrusion Attempt", location: "Marina Beach Public Network", severity: "MEDIUM", detected: "9m ago", threatLevel: "Moderate", units: "1 Cyber Response Unit", status: "CONTAINED" }
];
