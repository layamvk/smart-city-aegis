export const simulateEmergency = (state) => {
    return {
        ...state,
        activeIncidents: state.activeIncidents.map(inc => ({
            ...inc,
            responseTime: Math.max(3, Math.min(15, (inc.responseTime || 8) + (Math.random() * 2 - 1)))
        }))
    };
};
