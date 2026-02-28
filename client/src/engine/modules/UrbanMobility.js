export const simulateTraffic = (state) => {
    return {
        ...state,
        junctions: state.junctions.map(j => {
            const vehicleDensity = Math.max(100, Math.min(2000, Math.floor((j.vehicleDensity || 500) + (Math.random() * 200 - 100))));
            const congestion = Math.max(0, Math.min(100, (j.congestion || 50) + (Math.random() * 8 - 4)));
            const accidentProbability = Math.max(0, Math.min(0.2, (j.accidentProbability || 0) + (Math.random() * 0.02 - 0.01)));
            return {
                ...j,
                vehicleDensity,
                congestion,
                accidentProbability,
                historical: [...(j.historical || []), congestion].slice(-24)
            };
        })
    };
};
