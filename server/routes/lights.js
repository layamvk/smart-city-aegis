const express = require('express');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const LightCluster = require('../models/LightCluster');
const threatEngine = require('../services/threatEngine');
const infrastructureGatekeeper = require('../middleware/infrastructureGatekeeper');

const { validateBody } = require('../middleware/validateInput');

const router = express.Router();

// GET all lights
router.get('/', verifyToken, async (req, res) => {
    try {
        const lights = await LightCluster.find().lean();
        res.json(lights);
    } catch (err) {
        res.status(500).json({ message: 'Internal error' });
    }
});

// POST set brightness
router.post('/set-brightness', infrastructureGatekeeper('lighting', 'write', LightCluster), validateBody('lightUpdate'), async (req, res) => {
    try {
        const { zone, brightness } = req.body;

        const cluster = await LightCluster.findOne({ zone });
        if (!cluster) return res.status(404).json({ message: 'Light cluster not found' });

        // If globalThreatScore > 75, force emergency floodlight mode
        const globalScore = await threatEngine.getThreatScore();
        if (globalScore > 75) {
            cluster.brightness = 100;
            cluster.energyMode = 'Emergency';
        } else {
            cluster.brightness = brightness;
        }

        cluster.lastModified = new Date();
        cluster.modifiedBy = req.user.username;
        await cluster.save();

        res.json({ message: 'Lighting adjusted', cluster });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST emergency mode
router.post('/emergency-mode', infrastructureGatekeeper('lighting', 'override', LightCluster), validateBody('zoneAction'), async (req, res) => {
    try {
        const { zone } = req.body;
        const cluster = await LightCluster.findOne({ zone });
        if (!cluster) return res.status(404).json({ message: 'Light cluster not found' });

        cluster.brightness = 100;
        cluster.energyMode = 'Emergency';
        await cluster.save();

        res.json({ message: `Emergency lighting active in ${zone}`, cluster });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
