export function adjustProperty(value, change, min, max) {
    const newValue = value + change;
    return Math.min(max, Math.max(min, newValue));
}

export function tickDynamicEngine(state) {
    const nextZones = { ...state.zones };
    let globalThreatScore = state.security.threatScore;
    const activeIncidents = [...state.emergency.activeIncidents];

    const keys = Object.keys(nextZones);
    if (keys.length === 0) return state;

    keys.forEach(key => {
        const zone = { ...nextZones[key] };

        // Slightly adjust traffic ±3
        zone.trafficDensity = adjustProperty(zone.trafficDensity, (Math.random() * 6) - 3, 0, 100);

        // Adjust grid ±2
        zone.gridLoad = adjustProperty(zone.gridLoad, (Math.random() * 4) - 2, 0, 100);

        // Adjust water ±2
        zone.reservoirLevel = adjustProperty(zone.reservoirLevel, (Math.random() * 4) - 2, 0, 100);

        nextZones[key] = zone;
    });

    // Occasionally trigger emergency in random ward
    if (Math.random() < 0.05) {
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        const zone = nextZones[randomKey];
        if (!zone.emergencyActive) {
            zone.emergencyActive = true;
            zone.riskScore = adjustProperty(zone.riskScore || 0, 20, 0, 100);

            activeIncidents.push({
                id: `INC-${Date.now()}`,
                type: 'RANDOM_EMERGENCY',
                zone: randomKey,
                severity: 'HIGH',
                description: `Random incident detected in ${zone.name || randomKey}`,
                timestamp: new Date().toISOString(),
                status: 'ACTIVE',
            });
        }
    }

    // Occasionally increase threat score
    if (Math.random() < 0.1) {
        globalThreatScore = adjustProperty(globalThreatScore, (Math.random() * 4) - 1, 0, 100);
    }

    // Interdependency logic (PART 9)
    keys.forEach(key => {
        const zone = nextZones[key];

        // Grid load > 85
        if (zone.gridLoad > 85) {
            zone.riskScore = adjustProperty(zone.riskScore || 0, 2, 0, 100);
            zone.reservoirLevel = adjustProperty(zone.reservoirLevel, -1, 0, 100); // reduce water pressure
        }

        // Traffic congestion > 80
        if (zone.trafficDensity > 80) {
            zone.emergencyDelay = (zone.emergencyDelay || 0) + 1;
        }
    });

    return {
        ...state,
        zones: nextZones,
        security: { ...state.security, threatScore: globalThreatScore },
        emergency: { ...state.emergency, activeIncidents }
    };
}
