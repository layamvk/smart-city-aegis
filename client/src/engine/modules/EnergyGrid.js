export const simulateGrid = (state) => {
    return {
        ...state,
        substations: state.substations.map(s => {
            const load = Math.max(40, Math.min(95, (s.load || 50) + (Math.random() * 6 - 3)));
            const transformerTemp = Math.max(40, Math.min(110, (s.transformerTemp || 60) + (Math.random() * 4 - 2)));
            return {
                ...s,
                load,
                transformerTemp,
                historical: [...(s.historical || []), load].slice(-24)
            };
        }),
        frequency: Math.max(49.7, Math.min(50.3, (state.frequency || 50.0) + (Math.random() * 0.1 - 0.05)))
    };
};
