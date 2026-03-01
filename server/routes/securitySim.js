const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { simulateAttack } = require('../services/SecuritySimulationEngine');

const simRateLimitMap = new Map();

router.post(
    "/simulate",
    verifyToken,
    authorizeRoles("SuperAdmin"),
    async (req, res) => {
        try {
            if (process.env.ENABLE_LIVE_SIM !== "true") {
                return res.status(403).json({ message: "Simulation disabled" });
            }

            if (req.user.deviceTrustScore && req.user.deviceTrustScore < 70) {
                // req.user might just be the JWT payload, so let's fetch real score to be safe
            }

            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(401).json({ message: "Unknown user" });
            }

            if (user.deviceTrustScore < 70) {
                return res.status(403).json({ message: "Trust score too low" });
            }

            // Memory rate limit block
            const now = Date.now();
            const userRateLimit = simRateLimitMap.get(user._id.toString()) || { count: 0, resetTime: now + 3600000 };
            if (now > userRateLimit.resetTime) {
                userRateLimit.count = 0;
                userRateLimit.resetTime = now + 3600000;
            }
            if (userRateLimit.count >= 5) {
                return res.status(429).json({ message: 'Simulation rate limit exceeded (Max 5 per hour)' });
            }
            userRateLimit.count += 1;
            simRateLimitMap.set(user._id.toString(), userRateLimit);

            const realIp = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

            const result = await simulateAttack({
                type: req.body.attackType || req.body.type,
                user,
                io: req.app.get('io'),
                realIp: req.body.callerIp || req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress,
                callerGeo: req.body.callerGeo || null,
                callerIsp: req.body.callerIsp || null,
            });

            res.json(result);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Simulation failed" });
        }
    }
);

module.exports = router;
