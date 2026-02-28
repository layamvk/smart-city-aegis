const { verifyToken } = require('./authMiddleware');
const authorizeModule = require('./authorizeModule');
const authorizeZoneAccess = require('./authorizeZoneAccess');
const threatEngine = require('../services/threatEngine');
const User = require('../models/User');
const auditLogger = require('../services/auditLogger');
const { DEVICE_TRUST_MIN } = require('../config/security');

const infrastructureGatekeeper = (moduleName, actionType, assetModel) => {
    return [
        // 1. JWT verification
        verifyToken,

        // 2. Role permission check (RBAC)
        authorizeModule(moduleName, actionType),

        // 3. Zone validation constraint
        ...(actionType === 'write' || actionType === 'override' ? [authorizeZoneAccess(assetModel)] : []),

        // 4. Zero Trust Policy Enforcement
        async (req, res, next) => {
            try {
                const user = await User.findById(req.user.id);
                const globalScore = await threatEngine.getThreatScore();

                // 4.1 Restricted Mode — score > 90: all manual operations frozen system-wide
                if (globalScore > 90) {
                    await auditLogger.logAction({
                        user: req.user.username,
                        role: req.user.role,
                        endpoint: req.originalUrl,
                        method: req.method,
                        status: 'Denied',
                        reason: `RESTRICTED MODE: globalThreatScore=${globalScore}`,
                        ipAddress: req.ip || 'Unknown'
                    });
                    return res.status(503).json({
                        message: 'RESTRICTED MODE ACTIVE: All manual infrastructure operations suspended. Contact Security Operations.'
                    });
                }

                // 4.2 Check Device Trust Score (unified threshold from config)
                if (user.deviceTrustScore < DEVICE_TRUST_MIN) {
                    await User.adjustTrustScore(user._id, -5);
                    await auditLogger.logAction({
                        user: req.user.username,
                        role: req.user.role,
                        endpoint: req.originalUrl,
                        method: req.method,
                        status: 'Denied',
                        reason: `Device trust score too low: ${user.deviceTrustScore}`,
                        ipAddress: req.ip || 'Unknown'
                    });
                    return res.status(403).json({ message: 'Gatekeeper Alert: Device trust score insufficient for infrastructure control.' });
                }

                // 4.3 Threat Lockdown (score 80-90) — check for active emergency override
                if (globalScore > 80) {
                    if (req.user.role === 'EmergencyAuthority' || req.user.role === 'SuperAdmin') {
                        if (user.emergencyOverrideUntil && new Date() < user.emergencyOverrideUntil) {
                            return next(); // Active timed override — allow through
                        }
                        return res.status(403).json({
                            message: 'Gatekeeper Alert: City in lockdown. Request emergency override via POST /emergency/override-elevation.'
                        });
                    }
                    await auditLogger.logAction({
                        user: req.user.username,
                        role: req.user.role,
                        endpoint: req.originalUrl,
                        method: req.method,
                        status: 'Denied',
                        reason: `Threat lockdown: globalThreatScore=${globalScore}`,
                        ipAddress: req.ip || 'Unknown'
                    });
                    return res.status(403).json({
                        message: 'Gatekeeper Alert: Manual infrastructure operations locked due to critical threat level.'
                    });
                }

                next();
            } catch (error) {
                return res.status(500).json({ message: 'Gatekeeper failure', error: error.message });
            }
        }
    ];
};

module.exports = infrastructureGatekeeper;
