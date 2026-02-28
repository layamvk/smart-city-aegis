module.exports = {
    // Geospatial anomaly detection
    ANOMALY_MAX_SPEED: 900,
    ANOMALY_CRITICAL_SPEED: 1500,
    TRUST_PENALTY_MEDIUM: -10,
    TRUST_PENALTY_HIGH: -25,
    TRUST_PENALTY_CRITICAL: -50,

    // ── Single unified threshold ─────────────────────────────────────────────
    DEVICE_TRUST_MIN: 40,

    // Threat score bounds
    THREAT_SCORE_MAX: 100,
    THREAT_SCORE_MIN: 0,
    THREAT_SCORE_DECAY: 5,           // points removed every decay interval
    THREAT_SCORE_DECAY_INTERVAL_MS: 5 * 60 * 1000,  // 5 minutes

    // Emergency override
    OVERRIDE_DURATION_MS: 10 * 60 * 1000,  // 10 minutes
    OVERRIDE_MAX_PER_HOUR: 3,

    // Redis safeguard
    REDIS_MAX_REVOKED_KEYS: 50000,

    // Audit log throttle — max 1 write per IP per key per window
    AUDIT_THROTTLE_WINDOW_MS: 10 * 1000,  // 10s sliding window per (IP+endpoint+status)
};
