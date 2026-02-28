const express = require('express');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const auditLogger = require('../services/auditLogger');
const EmergencyIncident = require('../models/EmergencyIncident');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');
const { OVERRIDE_DURATION_MS, OVERRIDE_MAX_PER_HOUR } = require('../config/security');

const { validateBody } = require('../middleware/validateInput');

const router = express.Router();

// GET all incidents
router.get('/incidents', verifyToken, async (req, res) => {
  try {
    const incidents = await EmergencyIncident.find().lean();
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ message: 'Internal error' });
  }
});

// POST create incident
router.post('/create', verifyToken, authorizeRoles('Admin', 'EmergencyAuthority'), validateBody('incident'), async (req, res) => {
  try {
    const { type, zone, severity, coordinates } = req.body;
    const incidentId = `INC-${Date.now()}`;

    // Auto-assignment simulation logic
    const assignedUnit = type === 'Fire' ? 'FIRE-RESPONDER-1' : 'MED-UNIT-4';
    const eta = 5 + Math.floor(Math.random() * 10);

    const incident = new EmergencyIncident({
      incidentId,
      type,
      zone,
      severity,
      coordinates,
      assignedUnit,
      eta,
      status: 'DISPATCHED'
    });

    await incident.save();

    res.json({ message: 'Incident reported and unit dispatched', incident });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST resolve incident
router.post('/:id/resolve', verifyToken, authorizeRoles('Admin', 'EmergencyAuthority'), async (req, res) => {
  try {
    const incident = await EmergencyIncident.findOneAndUpdate(
      { incidentId: req.params.id },
      { status: 'RESOLVED' },
      { new: true }
    );
    res.json({ message: 'Incident resolved', incident });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Per-user override rate limiter: max 3 invocations per hour
const overrideLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: OVERRIDE_MAX_PER_HOUR,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: 'Override rate limit exceeded. Maximum 3 overrides per hour.'
});

// POST request temporary emergency elevation
router.post('/override-elevation', verifyToken, authorizeRoles('SuperAdmin', 'EmergencyAuthority'), overrideLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Cooldown guard: reject if an override is already active
    if (user.emergencyOverrideUntil && new Date() < user.emergencyOverrideUntil) {
      await auditLogger.logAction({
        user: req.user.username,
        role: req.user.role,
        endpoint: req.originalUrl,
        method: req.method,
        status: 'Denied',
        reason: `Override already active until ${user.emergencyOverrideUntil.toISOString()}`,
        ipAddress: req.ip || 'Unknown'
      });
      return res.status(429).json({
        message: 'Override already active.',
        expiresAt: user.emergencyOverrideUntil
      });
    }

    // Atomic update — no instance.save()
    const expiration = new Date(Date.now() + OVERRIDE_DURATION_MS);
    await User.findOneAndUpdate(
      { _id: user._id },
      { $set: { emergencyOverrideUntil: expiration } }
    );

    await auditLogger.logAction({
      user: req.user.username,
      role: req.user.role,
      endpoint: req.originalUrl,
      method: req.method,
      status: 'Allowed',
      reason: 'Temporary 10-minute emergency lockdown bypass granted',
      ipAddress: req.ip || 'Unknown'
    });

    res.json({
      message: 'Emergency override granted. You have 10 minutes to act before normal Zero Trust restrictions resume.',
      expiresAt: expiration
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
