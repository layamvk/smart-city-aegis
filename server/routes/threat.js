const express = require('express');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const ThreatEvent = require('../models/ThreatEvent');
const threatEngine = require('../services/threatEngine');

const router = express.Router();

router.get('/status', verifyToken, authorizeRoles('Admin', 'SecurityAnalyst'), async (req, res) => {
  try {
    const totalThreats = await ThreatEvent.countDocuments();
    const recentThreats = await ThreatEvent.find().sort({ timestamp: -1 }).limit(5);
    const severityBreakdown = await ThreatEvent.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);

    const breakdown = {};
    severityBreakdown.forEach(item => {
      breakdown[item._id] = item.count;
    });

    res.json({
      threatScore: await threatEngine.getThreatScore(),
      totalThreats,
      recentThreats,
      severityBreakdown: breakdown
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

