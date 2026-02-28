export const simulateLighting = (state) => {
    return {
        ...state,
        clusters: state.clusters.map(c => {
            let brightness = c.brightness ?? 85;
            if (c.autoMode !== false) {
                brightness = Math.max(20, Math.min(100, brightness + (Math.random() * 4 - 2)));
            }
            return {
                ...c,
                brightness
            };
        })
    };
};
