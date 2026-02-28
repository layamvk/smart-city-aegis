const express = require('express');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const User = require('../models/User');
const ThreatEvent = require('../models/ThreatEvent');
const threatEngine = require('../services/threatEngine');

const router = express.Router();

// Seed default users
router.post('/seed-users', verifyToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const users = [
      { username: 'admin', password: 'password123', role: 'Admin' },
      { username: 'operator', password: 'password123', role: 'TrafficOperator' },
      { username: 'authority', password: 'password123', role: 'EmergencyAuthority' },
      { username: 'analyst', password: 'password123', role: 'SecurityAnalyst' }
    ];

    for (const userData of users) {
      const normalizedUsername = String(userData.username).toLowerCase();
      const existing = await User.findOne({ username: normalizedUsername });
      if (!existing) {
        const user = new User({
          username: normalizedUsername,
          password: userData.password,
          role: userData.role,
          phoneNumber: '0000000000',
          zone: 'Central',
          phoneVerified: true
        });
        await user.save();
      }
    }

    res.json({ message: 'Users seeded successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Seeding failed' });
  }
});

// Reset system
router.get('/reset-system', verifyToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    // Reset users
    await User.updateMany({}, {
      failedLoginAttempts: 0,
      deviceTrustScore: 100,
      accountLocked: false
    });

    // Clear threats
    await ThreatEvent.deleteMany({});

    // Reset global threat score
    await threatEngine.resetThreatScore();

    res.json({ message: 'System reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Reset failed' });
  }
});

module.exports = router;

