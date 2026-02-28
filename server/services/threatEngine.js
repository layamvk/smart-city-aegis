const ThreatEvent = require('../models/ThreatEvent');
const SystemState = require('../models/SystemState');
const { THREAT_SCORE_MAX, THREAT_SCORE_MIN, THREAT_SCORE_DECAY, THREAT_SCORE_DECAY_INTERVAL_MS } = require('../config/security');

const severityImpact = {
  Low: 5,
  Medium: 10,
  High: 20,
  Critical: 40
};

// ── Clamped atomic threat score update ─────────────────────────────────────
// Uses aggregation pipeline to clamp within [0, 100] in a single DB round-trip.
async function adjustThreatScore(amount) {
  return SystemState.findOneAndUpdate(
    { name: 'globalThreatScore' },
    [{
      $set: {
        value: {
          $min: [
            THREAT_SCORE_MAX,
            { $max: [THREAT_SCORE_MIN, { $add: ['$value', amount] }] }
          ]
        }
      }
    }],
    { new: true, upsert: true }
  );
}

// ── Background decay task ───────────────────────────────────────────────────
// Runs every 5 minutes. Reduces globalThreatScore by 5 (clamped at 0).
// Stored as module-level so it starts once when requireed.
const _decayInterval = setInterval(async () => {
  try {
    await adjustThreatScore(-THREAT_SCORE_DECAY);
  } catch (err) {
    console.error('[ThreatEngine] Decay tick failed:', err.message);
  }
}, THREAT_SCORE_DECAY_INTERVAL_MS);

// Allow the process to exit cleanly without waiting for the interval
if (_decayInterval.unref) _decayInterval.unref();

// ── Public interface ────────────────────────────────────────────────────────
async function triggerThreat({ type, severity, user, endpoint }) {
  try {
    const threat = new ThreatEvent({ type, severity, user, endpoint });
    const savedThreat = await threat.save();

    if (severityImpact[severity]) {
      await adjustThreatScore(severityImpact[severity]);
    }

    return savedThreat;
  } catch (err) {
    console.error('[ThreatEngine] triggerThreat failed:', err.message);
    throw err;
  }
}

async function recordFailedLogin(user) {
  if (user.failedLoginAttempts >= 5) {
    return triggerThreat({
      type: 'BruteForce',
      severity: 'High',
      user: user.username,
      endpoint: '/auth/login'
    });
  }
}

async function recordUnauthorizedAccess(user, endpoint) {
  return triggerThreat({
    type: 'PrivilegeEscalation',
    severity: 'Medium',
    user: user?.username || 'Unknown',
    endpoint
  });
}

async function recordRateLimitBreach(username, endpoint) {
  return triggerThreat({
    type: 'RateLimitBreach',
    severity: 'High',
    user: username || 'Guest',
    endpoint
  });
}

async function getThreatScore() {
  const state = await SystemState.findOne({ name: 'globalThreatScore' });
  return state ? state.value : 0;
}

async function resetThreatScore() {
  await SystemState.findOneAndUpdate(
    { name: 'globalThreatScore' },
    { value: 0 },
    { upsert: true }
  );
}

module.exports = {
  triggerThreat,
  recordFailedLogin,
  recordUnauthorizedAccess,
  recordRateLimitBreach,
  getThreatScore,
  resetThreatScore
};
