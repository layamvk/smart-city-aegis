export const applyInterdependencies = (globalState) => {
    const { grid, water, traffic, lights, security } = globalState;

    const nextWater = { ...water };
    const nextTraffic = { ...traffic };
    const nextLights = { ...lights };
    const nextSecurity = { ...security };

    // 1. Grid failure -> Water pressure drop, Traffic signal instability, Lighting dim
    const overloadedSubs = grid.substations.filter(s => s.load > 90);
    if (overloadedSubs.length > 2) {
        nextWater.reservoirs = nextWater.reservoirs.map(r => ({ ...r, pressure: Math.max(10, r.pressure - 5) }));
        nextTraffic.junctions = nextTraffic.junctions.map(j => ({ ...j, congestion: Math.min(100, j.congestion + 5) }));
        nextLights.clusters = nextLights.clusters.map(c => ({ ...c, brightness: Math.max(10, c.brightness - 10) }));
    }

    // 2. High traffic congestion -> Increased grid load (EV charging logic maybe)
    const avgCongestion = traffic.junctions.reduce((a, j) => a + j.congestion, 0) / traffic.junctions.length;
    let nextGrid = { ...grid };
    if (avgCongestion > 75) {
        nextGrid.substations = nextGrid.substations.map(s => ({ ...s, load: Math.min(100, s.load + 2) }));
    }

    // 3. Threat > 70 -> Lock manual overrides, restrict traffic
    if (security.threatScore > 70) {
        nextSecurity.lockdownActive = true;
        nextTraffic.junctions = nextTraffic.junctions.map(j => ({ ...j, phase: 'RED' }));
    } else {
        nextSecurity.lockdownActive = false;
    }

    return {
        ...globalState,
        grid: nextGrid,
        water: nextWater,
        traffic: nextTraffic,
        lights: nextLights,
        security: nextSecurity
    };
};
