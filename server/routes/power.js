const express = require('express');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const auditLogger = require('../services/auditLogger');
const threatEngine = require('../services/threatEngine');
const infrastructureGatekeeper = require('../middleware/infrastructureGatekeeper');
const Substation = require('../models/Substation');

const { validateBody } = require('../middleware/validateInput');

const router = express.Router();

// GET all substations
router.get('/substations', verifyToken, async (req, res) => {
  try {
    const substations = await Substation.find().lean();
    res.json(substations);
  } catch (err) {
    res.status(500).json({ message: 'Internal error' });
  }
});

// POST power action
router.post('/action', infrastructureGatekeeper('grid', 'write', Substation), validateBody('powerOverride'), async (req, res) => {
  try {
    const { substationId, action, value } = req.body;

    const substation = await Substation.findOne({ substationId });
    if (!substation) return res.status(404).json({ message: 'Substation not found' });

    if (action === 'LOAD_SHED') {
      const amount = value || 10;
      substation.loadPercent = Math.max(0, substation.loadPercent - amount);
    } else if (action === 'ISOLATE') {
      substation.operationalMode = 'Island';
    } else if (action === 'BACKUP_ACTIVATE') {
      substation.operationalMode = 'Safe';
    }

    substation.lastModified = new Date();
    substation.modifiedBy = req.user.username;
    await substation.save();

    res.json({ message: `Power action ${action} executed`, substation });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST backup activate
router.post('/backup', infrastructureGatekeeper('grid', 'write', Substation), async (req, res) => {
  try {
    const { substationId } = req.body;
    const substation = await Substation.findOne({ substationId });
    if (!substation) return res.status(404).json({ message: 'Substation not found' });

    substation.operationalMode = 'Island';
    await substation.save();

    res.json({ message: 'Backup power / Island mode active', substation });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST island
router.post('/island', infrastructureGatekeeper('grid', 'write', Substation), async (req, res) => {
  try {
    const { substationId } = req.body;
    const substation = await Substation.findOne({ substationId });
    if (!substation) return res.status(404).json({ message: 'Substation not found' });

    substation.operationalMode = 'Island';
    await substation.save();

    res.json({ message: 'Substation isolated (Island Mode)', substation });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Operational Mode logic coupling
router.post('/safety-lock', infrastructureGatekeeper('grid', 'write', Substation), async (req, res) => {
  try {
    const { substationId } = req.body;
    const substation = await Substation.findOne({ substationId });
    if (!substation) return res.status(404).json({ message: 'Substation not found' });

    substation.operationalMode = 'Safe';
    await substation.save();

    res.json({ message: 'Substation locked in Safe Mode', substation });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
