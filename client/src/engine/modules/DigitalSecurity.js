export const simulateSecurity = (state) => {
    const nextScore = Math.max(0, Math.min(100, (state.threatScore || 25) + (Math.random() * 4 - 2)));

    // mock digital security stats
    const apiRequests = Math.floor(1000 + Math.random() * 500);
    const apiErrors = Math.floor(Math.random() * 20);
    const blockedIps = Math.floor(Math.random() * 5);
    const deviceTrust = Math.max(50, Math.min(100, (state.deviceTrust || 95) + (Math.random() * 2 - 1)));

    return {
        ...state,
        threatScore: nextScore,
        apiRequests,
        apiErrors,
        blockedIps,
        deviceTrust
    };
};
