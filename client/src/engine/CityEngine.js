import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { TRAFFIC_INFRA, WATER_INFRA, GRID_INFRA, LIGHT_INFRA } from './MockData';
// KML parser no longer used — loading pre-converted GeoJSON directly
import { tickDynamicEngine } from './DynamicEngine';

const CityEngineContext = createContext();

export const useCityEngine = () => {
    const ctx = useContext(CityEngineContext);
    if (!ctx) throw new Error('useCityEngine must be used within a CityEngineProvider');
    return ctx;
};

// --- GeoJSON Geometry Engine (Unchanged) ---
function createPolygon(coords) {
    if (!coords || coords.length < 3) return null;
    const ring = [...coords];
    if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
        ring.push([ring[0][0], ring[0][1]]);
    }
    return ring;
}

function createFeature(id, name, type, coords) {
    const safeRing = createPolygon(coords);
    if (!safeRing) return null;
    return {
        type: "Feature",
        id,
        properties: { name, type },
        geometry: { type: "Polygon", coordinates: [safeRing] }
    };
}

const RAW_ZONES = [
    { id: "Porur", name: "Porur Zone", type: "Residential", coords: [[80.14, 13.02], [80.17, 13.04], [80.18, 13.06], [80.16, 13.08], [80.13, 13.07], [80.12, 13.04]] },
    { id: "Tambaram", name: "Tambaram Zone", type: "Residential", coords: [[80.10, 12.90], [80.14, 12.92], [80.15, 12.95], [80.12, 12.97], [80.08, 12.95], [80.08, 12.92]] },
    { id: "OMR", name: "OMR IT Corridor", type: "IT Corridor", coords: [[80.23, 12.85], [80.26, 12.87], [80.27, 12.92], [80.25, 12.95], [80.23, 12.93], [80.22, 12.88]] },
    { id: "Guindy", name: "Guindy Industrial Zone", type: "Industrial", coords: [[80.19, 13.00], [80.23, 13.02], [80.24, 13.03], [80.22, 13.05], [80.20, 13.04], [80.19, 13.02]] },
    { id: "AnnaNagar", name: "Anna Nagar Residential", type: "Residential", coords: [[80.18, 13.07], [80.22, 13.08], [80.23, 13.11], [80.21, 13.12], [80.19, 13.10]] },
    { id: "TNagar", name: "T Nagar Commercial", type: "Commercial", coords: [[80.22, 13.03], [80.25, 13.04], [80.26, 13.06], [80.24, 13.07], [80.22, 13.05]] },
    { id: "Velachery", name: "Velachery Tech Belt", type: "IT Corridor", coords: [[80.20, 12.96], [80.24, 12.97], [80.25, 13.00], [80.23, 13.01], [80.21, 12.99]] },
    { id: "Ennore", name: "Ennore Port Zone", type: "Port", coords: [[80.30, 13.20], [80.34, 13.22], [80.36, 13.28], [80.32, 13.30], [80.29, 13.25]] },
    { id: "Perambur", name: "Perambur Rail Cluster", type: "Industrial", coords: [[80.22, 13.10], [80.25, 13.11], [80.26, 13.14], [80.24, 13.15], [80.21, 13.13]] },
    { id: "Adyar", name: "Adyar River Belt", type: "Residential", coords: [[80.24, 12.98], [80.27, 12.99], [80.28, 13.02], [80.26, 13.03], [80.24, 13.01]] },
    { id: "Sholinganallur", name: "Sholinganallur IT Extension", type: "IT Corridor", coords: [[80.21, 12.85], [80.24, 12.87], [80.25, 12.91], [80.22, 12.92], [80.20, 12.89]] },
    { id: "Madhavaram", name: "Madhavaram Industrial", type: "Industrial", coords: [[80.22, 13.15], [80.26, 13.16], [80.27, 13.20], [80.25, 13.22], [80.22, 13.20]] },
    { id: "Chromepet", name: "Chromepet Residential", type: "Residential", coords: [[80.12, 12.94], [80.15, 12.95], [80.16, 12.98], [80.14, 12.99], [80.11, 12.97]] },
    { id: "Thiruvanmiyur", name: "Thiruvanmiyur Coastal", type: "Residential", coords: [[80.25, 12.95], [80.28, 12.96], [80.30, 13.00], [80.28, 13.02], [80.26, 12.99]] },
    { id: "Ambattur", name: "Ambattur Industrial", type: "Industrial", coords: [[80.13, 13.10], [80.17, 13.12], [80.18, 13.15], [80.15, 13.16], [80.12, 13.14]] },
    { id: "Avadi", name: "Avadi Defense Sector", type: "Defense", coords: [[80.08, 13.10], [80.12, 13.12], [80.13, 13.16], [80.10, 13.18], [80.07, 13.15]] },
    { id: "Kolathur", name: "Kolathur Hub", type: "Residential", coords: [[80.20, 13.11], [80.22, 13.12], [80.23, 13.14], [80.21, 13.15], [80.19, 13.13]] },
    { id: "Saidapet", name: "Saidapet Bridge Sector", type: "Commercial", coords: [[80.21, 13.01], [80.23, 13.02], [80.24, 13.04], [80.22, 13.05], [80.20, 13.03]] }
];

export const CHENNAI_ZONES_GEOJSON = {
    type: "FeatureCollection",
    features: RAW_ZONES.map(z => createFeature(z.id, z.name, z.type, z.coords)).filter(Boolean)
};

export const CityEngineProvider = ({ children }) => {
    // --- APP STATE ---
    const [globalThreatScore, setGlobalThreatScore] = useState(25);
    const [digitalTwinMode, setDigitalTwinMode] = useState(false);
    const [events, setEvents] = useState([]);
    const [activeIncidents, setActiveIncidents] = useState([]);

    const [security, setSecurity] = useState({ threatScore: 25, apiRequests: 1200, apiErrors: 5, blockedIps: 2, deviceTrust: 95, lockdownActive: false });
    const [governance, setGovernance] = useState({ activePolicies: [], auditLogs: [] });

    // --- INFRASTRUCTURE STATE ---
    const [traffic, setTraffic] = useState(TRAFFIC_INFRA);
    const [water, setWater] = useState(WATER_INFRA);
    const [grid, setGrid] = useState(GRID_INFRA);
    const [lights, setLights] = useState(LIGHT_INFRA);

    const [zones, setZones] = useState({});

    // Production-safe KML loader (runs once on mount)
    const boundaryLoadedRef = useRef(false);

    useEffect(() => {
        // Pre-converted GeoJSON — 50KB, no XML parsing, works reliably on Vercel
        const GEOJSON_PATH = '/chennai-boundary.geojson';

        const loadBoundary = async (attempt = 1) => {
            if (boundaryLoadedRef.current) return;
            console.log(`[CORE] Fetching boundary (attempt ${attempt}): ${GEOJSON_PATH}`);

            try {
                const res = await fetch(GEOJSON_PATH, { cache: 'no-cache' });

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status} — ${res.statusText}`);
                }

                const contentType = res.headers.get('content-type') || '';
                const blob = await res.blob();
                console.log(`[CORE] GeoJSON received: ${blob.size} bytes (${contentType})`);

                if (blob.size < 100) {
                    throw new Error(`GeoJSON too small (${blob.size} bytes) — likely 404 HTML returned`);
                }

                const text = await blob.text();
                let geojson;
                try { geojson = JSON.parse(text); }
                catch (parseErr) { throw new Error(`JSON parse failed: ${parseErr.message}`); }

                if (!geojson || !geojson.features || geojson.features.length === 0) {
                    throw new Error('No features in GeoJSON — check /public/chennai-boundary.geojson');
                }

                console.log(`[CORE] ${geojson.features.length} polygon features parsed successfully`);
                boundaryLoadedRef.current = true;

                const initZones = {};
                geojson.features.forEach((f, i) => {
                    const id = f.properties?.name || `Zone-${i}`;
                    if (!initZones[id]) {
                        initZones[id] = {
                            name: id, id,
                            type: 'Ward',
                            riskScore: 10 + Math.random() * 70,
                            trafficLoad: 30 + Math.random() * 60,
                            gridLoad: 35 + Math.random() * 57,
                            waterLevel: 40 + Math.random() * 55,
                            lightingLevel: 20 + Math.random() * 80,
                            emergencyActive: false,
                            status: 'NORMAL',
                            lastUpdated: Date.now(),
                            features: [],
                            feature: f,
                            riskHistory: Array.from({ length: 12 }, () => 15 + Math.random() * 15),
                        };
                    }
                    initZones[id].features.push(f);
                });

                console.log(`[CORE] ${Object.keys(initZones).length} GCC zones ready`);
                setZones(initZones);

            } catch (err) {
                console.error(`[CORE] KML fetch error (attempt ${attempt}):`, err.message);
                if (attempt < 3) {
                    const delay = attempt * 2000;
                    console.log(`[CORE] Retrying in ${delay}ms...`);
                    setTimeout(() => loadBoundary(attempt + 1), delay);
                } else {
                    console.error('[CORE] All boundary load attempts exhausted. Map renders without ward boundaries.');
                }
            }
        };

        loadBoundary();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // --- ACTIONS ---
    const emit = useCallback((type, payload) => {
        const ev = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            timestamp: new Date().toISOString(),
            type, payload,
            severity: payload?.severity || 'INFO',
        };
        setEvents(prev => [ev, ...prev].slice(0, 50));
    }, []);

    const updateTraffic = useCallback((junctionId, updates) => {
        setTraffic(prev => ({
            ...prev,
            junctions: prev.junctions.map(j => j.id === junctionId ? { ...j, ...updates } : j)
        }));
        emit('TRAFFIC_UPDATE', { id: junctionId, ...updates });
    }, [emit]);

    const updateWater = useCallback((type, id, updates) => {
        setWater(prev => {
            const next = { ...prev };
            if (type === 'reservoir') next.reservoirs = prev.reservoirs.map(r => r.id === id ? { ...r, ...updates } : r);
            if (type === 'pump') next.pumpStations = prev.pumpStations.map(p => p.id === id ? { ...p, ...updates } : p);
            return next;
        });
        emit('WATER_UPDATE', { id, ...updates });
    }, [emit]);

    const updateGrid = useCallback((substationId, updates) => {
        setGrid(prev => ({
            ...prev,
            substations: prev.substations.map(s => s.id === substationId ? { ...s, ...updates } : s)
        }));
        emit('GRID_UPDATE', { id: substationId, ...updates });
    }, [emit]);

    const updateLights = useCallback((clusterId, updates) => {
        setLights(prev => ({
            ...prev,
            clusters: prev.clusters.map(c => c.id === clusterId ? { ...c, ...updates } : c)
        }));
        emit('LIGHT_UPDATE', { id: clusterId, severity: 'INFO', ...updates });
    }, [emit]);

    const updateLightsGlobal = useCallback((updates) => {
        setLights(prev => ({ ...prev, ...updates }));
        emit('LIGHT_GLOBAL_UPDATE', { severity: 'INFO', ...updates });
    }, [emit]);

    const updateEmergency = useCallback(({ type, zone, severity, description }) => {
        const incident = {
            id: `INC-${Date.now()}`,
            type,
            zone,
            severity,
            description: description || `${type} incident in ${zone}`,
            timestamp: new Date().toISOString(),
            status: 'ACTIVE',
        };
        setActiveIncidents(prev => [incident, ...prev].slice(0, 20));

        // Raise zone risk
        setZones(prev => {
            if (!prev[zone]) return prev;
            return {
                ...prev,
                [zone]: {
                    ...prev[zone],
                    riskScore: Math.min(100, (prev[zone].riskScore || 0) + 25),
                    status: 'CRITICAL',
                }
            };
        });

        // Increase grid load for affected zone
        setGrid(prev => ({
            ...prev,
            substations: prev.substations.map((s, i) =>
                i === 0 ? { ...s, load: Math.min(100, s.load + 10) } : s
            )
        }));

        // Emergency lighting flood
        setLights(prev => ({
            ...prev,
            clusters: prev.clusters.map(c => ({ ...c, brightness: 100 }))
        }));

        emit('EMERGENCY_INCIDENT', { type, zone, severity: severity || 'HIGH' });
        setGlobalThreatScore(prev => Math.min(100, prev + 20));
    }, [emit]);

    const triggerScenario = useCallback((scenario) => {
        emit('SCENARIO_ACTIVATED', { scenario, severity: 'HIGH' });
        if (scenario === 'CYBER_ATTACK') {
            setGlobalThreatScore(85);
            setGrid(prev => ({ ...prev, substations: prev.substations.map(s => ({ ...s, load: 95 })) }));
        }
        if (scenario === 'FLOOD') {
            setZones(prev => {
                const next = { ...prev };
                ['Adyar', 'Saidapet', 'Velachery'].forEach(id => {
                    if (next[id]) next[id] = { ...next[id], riskScore: 90, status: 'CRITICAL' };
                });
                return next;
            });
            setGlobalThreatScore(70);
        }
        if (scenario === 'LARGE_FIRE') {
            const zones_affected = ['Guindy', 'TNagar'];
            setZones(prev => {
                const next = { ...prev };
                zones_affected.forEach(id => {
                    if (next[id]) next[id] = { ...next[id], riskScore: 95, status: 'CRITICAL' };
                });
                return next;
            });
            const incident = {
                id: `INC-${Date.now()}`,
                type: 'FIRE',
                zone: 'Guindy',
                severity: 'CRITICAL',
                description: 'Large industrial fire reported at Guindy. Multiple units dispatched.',
                timestamp: new Date().toISOString(),
                status: 'ACTIVE',
            };
            setActiveIncidents(prev => [incident, ...prev].slice(0, 20));
            setLights(prev => ({ ...prev, clusters: prev.clusters.map(c => ({ ...c, brightness: 100 })) }));
            setGlobalThreatScore(prev => Math.min(100, prev + 30));
        }
        if (scenario === 'MEDICAL_EMERGENCY') {
            const incident = {
                id: `INC-${Date.now()}`,
                type: 'MEDICAL',
                zone: 'TNagar',
                severity: 'HIGH',
                description: 'Mass casualty event declared. Emergency medical services mobilised.',
                timestamp: new Date().toISOString(),
                status: 'ACTIVE',
            };
            setActiveIncidents(prev => [incident, ...prev].slice(0, 20));
            setGlobalThreatScore(prev => Math.min(100, prev + 15));
        }
    }, [emit]);

    const stateRef = React.useRef(null);
    useEffect(() => {
        stateRef.current = { traffic, water, grid, lights, emergency: { activeIncidents }, security, governance, zones };
    }, [traffic, water, grid, lights, activeIncidents, security, governance, zones]);

    const simulate = useCallback(() => {
        if (!stateRef.current) return;
        const nextState = tickDynamicEngine(stateRef.current);
        setTraffic(nextState.traffic);
        setWater(nextState.water);
        setGrid(nextState.grid);
        setLights(nextState.lights);
        setActiveIncidents(nextState.emergency.activeIncidents);
        setSecurity(nextState.security);
        setGovernance(nextState.governance);
        setZones(nextState.zones);
        setGlobalThreatScore(nextState.security.threatScore);
    }, []);

    useEffect(() => {
        const simId = setInterval(simulate, 4000);
        return () => clearInterval(simId);
    }, [simulate]);

    const summary = useMemo(() => ({
        traffic: Math.round(traffic.junctions.reduce((a, j) => a + (j.congestion || 0), 0) / (traffic.junctions.length || 1)),
        grid: Math.round(grid.substations.reduce((a, s) => a + (s.load || 0), 0) / (grid.substations.length || 1)),
        water: Math.round(water.reservoirs.reduce((a, r) => a + (r.capacity || r.capacityPercent || 0), 0) / (water.reservoirs.length || 1)),
    }), [traffic, grid, water]);

    return (
        <CityEngineContext.Provider value={{
            globalThreatScore, setGlobalThreatScore,
            digitalTwinMode, setDigitalTwinMode,
            zones, setZones,
            traffic, updateTraffic,
            water, updateWater,
            grid, updateGrid,
            lights, updateLights, updateLightsGlobal,
            events, emit, summary,
            triggerScenario,
            updateEmergency,
            activeIncidents, setActiveIncidents,
            security, setSecurity,
            governance, setGovernance
        }}>
            {children}
        </CityEngineContext.Provider>
    );
};
