const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auditLogger = require('../services/auditLogger');
const threatEngine = require('../services/threatEngine');
const RevokedToken = require('../models/RevokedToken');
const redisClient = require('../config/redis');
const { DEVICE_TRUST_MIN } = require('../config/security');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256']
    });

    if (!decoded.jti) {
      return res.status(401).json({ message: 'Invalid session structure' });
    }

    // Check if token is revoked via Redis O(1) cache
    const isRevoked = await redisClient.get(`revoked:${decoded.jti}`);
    if (isRevoked) {
      return res.status(401).json({ message: 'Session expired or revoked' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid session' });
    }

    if (!user.phoneVerified) {
      return res.status(403).json({ message: 'Phone number not verified' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Session expired' : 'Invalid session';
    return res.status(401).json({ message });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      // Unauthorized access
      try {
        const user = await User.findById(req.user.id);
        if (user) {
          await User.adjustTrustScore(user._id, -10);
        }
        await auditLogger.logAction({
          user: req.user ? req.user.username : 'Unknown',
          role: req.user ? req.user.role : 'Unknown',
          endpoint: req.originalUrl,
          method: req.method,
          status: 'Denied',
          reason: 'Insufficient permissions',
          deviceId: req.header('User-Agent') || 'Unknown',
          ipAddress: req.ip || 'Unknown'
        });
        await threatEngine.recordUnauthorizedAccess(req.user, req.originalUrl);
      } catch (err) {
        // Continue
      }
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    // Role allowed, check device trust score
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (user.deviceTrustScore < DEVICE_TRUST_MIN) {
        // Low trust score
        await User.adjustTrustScore(user._id, -5);
        await auditLogger.logAction({
          user: req.user.username,
          role: req.user.role,
          endpoint: req.originalUrl,
          method: req.method,
          status: 'Denied',
          reason: 'Device trust score too low',
          deviceId: req.header('User-Agent') || 'Unknown',
          ipAddress: req.ip || 'Unknown'
        });
        await threatEngine.triggerThreat({
          type: 'UnauthorizedAccess',
          severity: 'High',
          user: req.user.username,
          endpoint: req.originalUrl
        });
        return res.status(403).json({ message: 'Device trust score too low' });
      }

      // All checks passed, increase trust score
      await User.adjustTrustScore(user._id, 1);
      next();
    } catch (err) {
      return res.status(500).json({ message: 'Server error' });
    }
  };
};

module.exports = {
  verifyToken,
  authorizeRoles
};
