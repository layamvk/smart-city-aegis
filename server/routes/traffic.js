const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const authorizeModule = require('../middleware/authorizeModule');
const auditLogger = require('../services/auditLogger');
const threatEngine = require('../services/threatEngine');
const infrastructureGatekeeper = require('../middleware/infrastructureGatekeeper');
const TrafficSignal = require('../models/TrafficSignal');
const SystemState = require('../models/SystemState');

const { validateBody } = require('../middleware/validateInput');

const router = express.Router();

// Helper for congestion prediction (moving average)
const predictCongestion = (history) => {
  if (!history || history.length < 2) return 0;
  const recent = history.slice(-10);
  const sum = recent.reduce((a, b) => a + (b.congestion || 0), 0);
  return sum / recent.length;
};

// GET all signals with forecast
router.get('/signals', verifyToken, authorizeModule('traffic', 'read'), async (req, res) => {
  try {
    const signals = await TrafficSignal.find().lean();
    const signalsWithForecast = signals.map(sig => {
      const forecast = predictCongestion(sig.history);
      return { ...sig, forecast };
    });
    res.json(signalsWithForecast);
  } catch (err) {
    res.status(500).json({ message: 'Internal error' });
  }
});

// POST traffic override
router.post('/override', infrastructureGatekeeper('traffic', 'write', TrafficSignal), validateBody('trafficOverride'), async (req, res) => {
  try {
    const { signalId, status } = req.body;

    const signal = await TrafficSignal.findOne({ signalId });
    if (!signal) return res.status(404).json({ message: 'Signal not found' });

    signal.status = status;
    signal.manualOverride = true;
    signal.modifiedBy = req.user.username;
    signal.lastModified = new Date();
    await signal.save();

    await auditLogger.logAction({
      user: req.user.username,
      role: req.user.role,
      endpoint: req.originalUrl,
      method: req.method,
      status: 'Allowed',
      reason: `Manual override for signal ${signalId}`
    });

    res.json({ message: 'Signal override applied', signal });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST emergency corridor
router.post('/emergency-corridor', infrastructureGatekeeper('traffic', 'override', TrafficSignal), async (req, res) => {
  try {
    const { zone } = req.body;
    // Set all signals in zone to GREEN for emergency
    await TrafficSignal.updateMany(
      { zone },
      {
        status: 'GREEN',
        emergencyPriority: true,
        manualOverride: true,
        modifiedBy: req.user.username
      }
    );

    res.json({ message: `Emergency corridor activated for zone ${zone}` });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST optimize timing
router.post('/optimize', infrastructureGatekeeper('traffic', 'write', TrafficSignal), async (req, res) => {
  try {
    const globalScore = await threatEngine.getThreatScore();
    const signals = await TrafficSignal.find();

    for (let sig of signals) {
      // If threat high, force optimized safe timing
      if (globalScore > 80) {
        sig.cycleTimer = 45; // Default safe cycle
        sig.manualOverride = false;
      } else {
        // Simple optimization based on congestion
        sig.cycleTimer = sig.congestionLevel > 50 ? 90 : 60;
      }
      await sig.save();
    }

    res.json({ message: 'Traffic timing optimized for current city state' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
