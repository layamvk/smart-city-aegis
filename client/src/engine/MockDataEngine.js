import { simulateTraffic } from './modules/UrbanMobility';
import { simulateWater } from './modules/WaterWaste';
import { simulateGrid } from './modules/EnergyGrid';
import { simulateLighting } from './modules/SmartLighting';
import { simulateEmergency } from './modules/EmergencyResponse';
import { simulateSecurity } from './modules/DigitalSecurity';
import { simulateGovernance } from './modules/GovernancePolicy';
import { applyInterdependencies } from './InfrastructureMatrix';

export const triggerSimulationTick = (globalState) => {
    let nextState = {
        traffic: simulateTraffic(globalState.traffic),
        water: simulateWater(globalState.water),
        grid: simulateGrid(globalState.grid),
        lights: simulateLighting(globalState.lights),
        emergency: simulateEmergency(globalState.emergency),
        security: simulateSecurity(globalState.security),
        governance: simulateGovernance(globalState.governance),
        zones: { ...globalState.zones }
    };

    nextState = applyInterdependencies(nextState);

    // Sync zones with general state trends
    Object.keys(nextState.zones).forEach(id => {
        const z = { ...nextState.zones[id] };
        z.riskScore = Math.max(5, Math.min(100, z.riskScore + (Math.random() * 4 - 2)));
        z.trafficDensity = Math.max(5, Math.min(100, (z.trafficDensity || 50) + (Math.random() * 6 - 3)));
        z.gridLoad = Math.max(10, Math.min(100, (z.gridLoad || 50) + (Math.random() * 4 - 2)));
        z.reservoirLevel = Math.max(20, Math.min(100, (z.reservoirLevel || 50) + (Math.random() * 4 - 2)));

        // cascade from security threat
        if (nextState.security.threatScore > 80) z.riskScore += 2;

        z.status = z.riskScore > 70 ? 'CRITICAL' : z.riskScore > 40 ? 'ELEVATED' : 'NORMAL';
        z.riskHistory = [...(z.riskHistory || []), z.riskScore].slice(-30);
        nextState.zones[id] = z;
    });

    return nextState;
};
