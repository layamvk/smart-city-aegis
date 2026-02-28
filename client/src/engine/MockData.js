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
        { id: "omr_01", lat: 12.9531, lng: 80.2274, congestion: 78, phase: "GREEN", cycle: 140, emergency: false, manual: false },
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
        { id: "besant_nagar_01", lat: 13.0003, lng: 80.2690, congestion: 20, phase: "GREEN", cycle: 50, emergency: false, manual: false },
        { id: "kknagar_01", lat: 13.0396, lng: 80.1996, congestion: 68, phase: "RED", cycle: 120, emergency: false, manual: false },
        { id: "ashok_nagar_01", lat: 13.0345, lng: 80.2117, congestion: 75, phase: "GREEN", cycle: 140, emergency: false, manual: false },
        { id: "royapettah_01", lat: 13.0519, lng: 80.2621, congestion: 80, phase: "RED", cycle: 160, emergency: false, manual: false },
        { id: "kilpauk_01", lat: 13.0827, lng: 80.2431, congestion: 52, phase: "YELLOW", cycle: 100, emergency: false, manual: false },
        { id: "perambur_01", lat: 13.1172, lng: 80.2407, congestion: 60, phase: "GREEN", cycle: 110, emergency: false, manual: false },
        { id: "kolathur_01", lat: 13.1153, lng: 80.2217, congestion: 44, phase: "YELLOW", cycle: 90, emergency: false, manual: false }
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
    pumpStations: [
        { id: "pump_st_1", lat: 13.0827, lng: 80.2707, status: "ON", flowRate: 180 },
        { id: "pump_st_2", lat: 13.0418, lng: 80.2341, status: "ON", flowRate: 165 },
        { id: "pump_st_3", lat: 12.9784, lng: 80.2185, status: "ON", flowRate: 200 },
        { id: "pump_st_4", lat: 13.0732, lng: 80.2604, status: "ON", flowRate: 155 },
        { id: "pump_st_5", lat: 12.9229, lng: 80.1275, status: "ON", flowRate: 170 },
        { id: "pump_st_6", lat: 13.0585, lng: 80.2454, status: "ON", flowRate: 160 },
        { id: "pump_st_7", lat: 13.0382, lng: 80.1548, status: "ON", flowRate: 175 },
        { id: "pump_st_8", lat: 12.9516, lng: 80.1410, status: "ON", flowRate: 145 },
        { id: "pump_st_9", lat: 13.0336, lng: 80.2677, status: "ON", flowRate: 185 },
        { id: "pump_st_10", lat: 12.9010, lng: 80.2279, status: "ON", flowRate: 190 }
    ],
    valves: [
        { id: "valve_1", lat: 13.0900, lng: 80.2889, state: "OPEN", pressure: 70 },
        { id: "valve_2", lat: 13.0067, lng: 80.2206, state: "OPEN", pressure: 65 },
        { id: "valve_3", lat: 13.0850, lng: 80.2101, state: "OPEN", pressure: 72 },
        { id: "valve_4", lat: 12.9675, lng: 80.1491, state: "CLOSED", pressure: 60 },
        { id: "valve_5", lat: 13.0003, lng: 80.2690, state: "OPEN", pressure: 68 }
    ]
};

// --- ELECTRICITY GRID ---
export const GRID_INFRA = {
    substations: [
        { id: "substation_1", lat: 13.0827, lng: 80.2707, load: 78, status: "ACTIVE", health: 95 },
        { id: "substation_2", lat: 13.0418, lng: 80.2341, load: 65, status: "ACTIVE", health: 91 },
        { id: "substation_3", lat: 12.9784, lng: 80.2185, load: 82, status: "ACTIVE", health: 88 },
        { id: "substation_4", lat: 13.1172, lng: 80.2407, load: 55, status: "ACTIVE", health: 97 },
        { id: "substation_5", lat: 12.9229, lng: 80.1275, load: 70, status: "ACTIVE", health: 92 },
        { id: "substation_6", lat: 13.0732, lng: 80.2604, load: 60, status: "ACTIVE", health: 94 },
        { id: "substation_7", lat: 13.0382, lng: 80.1548, load: 73, status: "ACTIVE", health: 89 },
        { id: "substation_8", lat: 12.9516, lng: 80.1410, load: 58, status: "ACTIVE", health: 93 },
        { id: "substation_9", lat: 13.0336, lng: 80.2677, load: 88, status: "WARNING", health: 82 },
        { id: "substation_10", lat: 12.9010, lng: 80.2279, load: 91, status: "WARNING", health: 79 }
    ],
    feeders: Array.from({ length: 25 }).map((_, i) => ({
        id: `feeder_${i + 1}`,
        status: "CLOSED",
        current: 400 + i * 10
    })),
    health: 94.5,
    frequency: 49.98
};

// --- STREET LIGHTS ---
export const LIGHT_INFRA = {
    clusters: [
        { id: "cluster_city_centre", lat: 13.0827, lng: 80.2707, brightness: 100, status: "ON", count: 850 },
        { id: "cluster_omr", lat: 12.9531, lng: 80.2274, brightness: 90, status: "ON", count: 620 },
        { id: "cluster_gsth", lat: 12.9229, lng: 80.1275, brightness: 85, status: "ON", count: 540 },
        { id: "cluster_anna", lat: 13.0850, lng: 80.2101, brightness: 95, status: "ON", count: 710 },
        { id: "cluster_adyar", lat: 13.0012, lng: 80.2565, brightness: 80, status: "ON", count: 480 },
        { id: "cluster_perambur", lat: 13.1172, lng: 80.2407, brightness: 88, status: "ON", count: 520 }
    ],
    globalBrightness: 85,
    mode: "AUTO"
};
