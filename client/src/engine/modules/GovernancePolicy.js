export const simulateGovernance = (state) => {
    return {
        ...state,
        activePolicies: state.activePolicies || [],
        auditLogs: state.auditLogs || []
    };
};
