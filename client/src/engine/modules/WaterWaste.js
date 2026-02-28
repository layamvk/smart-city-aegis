export const simulateWater = (state) => {
    return {
        ...state,
        reservoirs: state.reservoirs.map(r => {
            const capacity = Math.max(40, Math.min(95, (r.capacityPercent || r.capacity || 70) + (Math.random() * 2 - 1)));
            const pressure = Math.max(20, Math.min(80, (r.pressure || 50) + (Math.random() * 4 - 2)));
            const leakProbability = Math.max(0, Math.min(0.05, (r.leakProbability || 0) + (Math.random() * 0.01 - 0.005)));
            return {
                ...r,
                capacityPercent: capacity,
                capacity,
                pressure,
                leakProbability,
                historical: [...(r.historical || []), capacity].slice(-24)
            };
        })
    };
};
