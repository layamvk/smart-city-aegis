const express = require('express');
const rateLimit = require('express-rate-limit');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const AuditLog = require('../models/AuditLog');
const ThreatEvent = require('../models/ThreatEvent');
const User = require('../models/User');
const { parsePagination } = require('../utils/pagination');

const router = express.Router();

// Stricter rate limit for heavy read endpoints
const monitoringLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many monitoring requests'
});

// GET audit logs — paginated, projected, sorted by indexed field
router.get('/audit', monitoringLimiter, verifyToken, authorizeRoles('Admin', 'SecurityAnalyst', 'SuperAdmin'), async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req);

    // Optional filter by status or user
    const filter = {};
    if (req.query.status === 'Allowed' || req.query.status === 'Denied') {
      filter.status = req.query.status;
    }
    if (req.query.user) {
      filter.user = String(req.query.user).toLowerCase();
    }

    const [data, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .select('user role endpoint method status reason ipAddress timestamp -_id')
        .lean(),
      AuditLog.countDocuments(filter)
    ]);

    res.json({ page, limit, total, data });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET threat events — paginated, projected, sorted by indexed field
router.get('/threats', monitoringLimiter, verifyToken, authorizeRoles('Admin', 'SecurityAnalyst', 'SuperAdmin'), async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req);

    const filter = {};
    if (req.query.severity) {
      const allowed = ['Low', 'Medium', 'High', 'Critical'];
      if (allowed.includes(String(req.query.severity))) {
        filter.severity = req.query.severity;
      }
    }
    if (req.query.type) {
      filter.type = String(req.query.type);
    }

    const [data, total] = await Promise.all([
      ThreatEvent.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .select('type severity user endpoint timestamp -_id')
        .lean(),
      ThreatEvent.countDocuments(filter)
    ]);

    res.json({ page, limit, total, data });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET system status — aggregates only, no full document scans
router.get('/status', verifyToken, authorizeRoles('Admin', 'SecurityAnalyst', 'TrafficOperator', 'SuperAdmin'), async (req, res) => {
  try {
    const [totalCalls, blocked, activeThreats] = await Promise.all([
      AuditLog.countDocuments(),
      AuditLog.countDocuments({ status: 'Denied' }),
      ThreatEvent.countDocuments()
    ]);
    res.json({ totalApiCalls: totalCalls, blockedRequests: blocked, activeThreatsCount: activeThreats });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET current user device trust only — no sensitive fields
router.get('/user-device-trust', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('deviceTrustScore -_id')
      .lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ deviceTrustScore: user.deviceTrustScore });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
