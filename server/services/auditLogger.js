const NodeCache = require('node-cache');
const AuditLog = require('../models/AuditLog');
const { AUDIT_THROTTLE_WINDOW_MS } = require('../config/security');

// In-process sliding window cache: key = `ip:endpoint:status`, TTL = 10s
const _throttleCache = new NodeCache({ stdTTL: AUDIT_THROTTLE_WINDOW_MS / 1000, useClones: false });

/**
 * Log an audit action with per-IP sliding-window throttle.
 * Identical (ip + endpoint + status) combinations within the window are
 * collapsed: only the first write goes to MongoDB; sub-sequent hits increment
 * a counter on the cached entry so burst volume is visible in memory but does
 * not flood the collection.
 */
async function logAction(data) {
  const { user, role, endpoint, method, status, reason, deviceId, ipAddress } = data;

  if (!user || !role || !endpoint || !method || !status) {
    throw new Error('Missing required fields for audit logging');
  }

  // Throttle key — collapses repeated identical denied events
  const throttleKey = `${ipAddress || 'unknown'}:${endpoint}:${status}`;
  const cached = _throttleCache.get(throttleKey);

  if (cached) {
    // Suppress duplicate write; just increment in-memory counter
    cached.count = (cached.count || 1) + 1;
    _throttleCache.set(throttleKey, cached);
    return null; // Suppressed
  }

  try {
    const auditLog = new AuditLog({ user, role, endpoint, method, status, reason, deviceId, ipAddress });
    const savedLog = await auditLog.save();

    // Seed cache so subsequent identical events within the window are collapsed
    _throttleCache.set(throttleKey, { count: 1 });

    return savedLog;
  } catch (err) {
    console.error('[AuditLogger] Write failed:', err.message);
    throw err;
  }
}

module.exports = { logAction };
