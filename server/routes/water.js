const express = require('express');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const auditLogger = require('../services/auditLogger');
const threatEngine = require('../services/threatEngine');
const Reservoir = require('../models/Reservoir');
const User = require('../models/User');
const infrastructureGatekeeper = require('../middleware/infrastructureGatekeeper');

const { validateBody } = require('../middleware/validateInput');

const router = express.Router();

// GET all reservoirs
router.get('/reservoirs', verifyToken, async (req, res) => {
  try {
    const reservoirs = await Reservoir.find().lean();
    res.json(reservoirs);
  } catch (err) {
    res.status(500).json({ message: 'Internal error' });
  }
});

// POST valve control
router.post('/valve', infrastructureGatekeeper('water', 'write', Reservoir), validateBody('waterValve'), async (req, res) => {
  try {
    const { zone, flowRate } = req.body;

    const reservoir = await Reservoir.findOne({ zone });
    if (!reservoir) return res.status(404).json({ message: 'Reservoir not found' });

    // Check for contamination lockdown
    if (reservoir.contaminationFlag) {
      return res.status(403).json({
        message: 'Contamination Lockdown: Valve control disabled to prevent spread.'
      });
    }

    reservoir.flowRate = flowRate;
    reservoir.lastModified = new Date();
    reservoir.modifiedBy = req.user.username;
    await reservoir.save();

    res.json({ message: 'Valve adjusted', reservoir });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST reroute water
router.post('/reroute', infrastructureGatekeeper('water', 'write', Reservoir), async (req, res) => {
  try {
    const { fromZone, toZone, amount } = req.body;
    // Logical rerouting simulation
    res.json({ message: `Rerouting ${amount}L/s from ${fromZone} to ${toZone}` });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST isolate zone
router.post('/isolate', infrastructureGatekeeper('water', 'override', Reservoir), validateBody('zoneAction'), async (req, res) => {
  try {
    const { zone } = req.body;
    const reservoir = await Reservoir.findOne({ zone });
    if (!reservoir) return res.status(404).json({ message: 'Reservoir not found' });

    reservoir.flowRate = 0;
    reservoir.pressure = 0;
    reservoir.lastModified = new Date();
    reservoir.modifiedBy = req.user.username;
    await reservoir.save();

    res.json({ message: `Zone ${zone} hydraulically isolated`, reservoir });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Simulation: Contamination Trigger
router.post('/simulate/contamination', verifyToken, authorizeRoles('Admin'), validateBody('zoneAction'), async (req, res) => {
  try {
    const { zone } = req.body;
    const reservoir = await Reservoir.findOne({ zone });
    if (!reservoir) return res.status(404).json({ message: 'Reservoir not found' });

    reservoir.contaminationFlag = true;
    await reservoir.save();

    // Digital Twin logic: Auto isolate zone and increase threat score
    await threatEngine.triggerThreat({
      type: 'Bioterrorism',
      severity: 'Critical',
      user: 'SYSTEM_SENSOR',
      endpoint: '/water/sensor/contamination'
    });

    res.json({ message: 'Contamination simulated. Emergency protocols active.', reservoir });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
