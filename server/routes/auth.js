const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const geoip = require('geoip-lite');
const User = require('../models/User');
const ThreatEvent = require('../models/ThreatEvent');
const threatEngine = require('../services/threatEngine');
const SystemState = require('../models/SystemState');
const RefreshToken = require('../models/RefreshToken');
const RevokedToken = require('../models/RevokedToken');
const redisClient = require('../config/redis');

const { validateBody } = require('../middleware/validateInput');
const { ROLES } = require('../constants/roles');
const { calculateDistance } = require('../utils/geo');
const secConfig = require('../config/security');
const router = express.Router();

// ── Device fingerprint helper ───────────────────────────────────────────────
const makeFingerprint = (req) => {
  const ip = req.ip || 'unknown';
  const ua = req.headers['x-device-id'] || req.headers['user-agent'] || 'unknown';
  return crypto.createHash('sha256').update(`${ip}:${ua}`).digest('hex');
};

router.post('/login', validateBody('login'), async (req, res) => {
  try {
    const { username, password } = req.body;


    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const normalizedUsername = String(username).trim().toLowerCase();
    const user = await User.findOne({ username: normalizedUsername });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.accountLocked) {
      return res.status(403).json({ message: 'Account locked due to multiple failed attempts' });
    }

    // Assuming this block is intended to be an 'if' condition based on the diff structure
    if (user.deviceTrustScore < 20) { // Placeholder condition, adjust as needed
      await User.adjustTrustScore(user._id, -20);
      return res.status(401).json({ message: 'Device trust too low, verify immediately' });
    }

    if (!user.phoneVerified) {
      return res.status(403).json({ message: 'Phone number not verified' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Atomic increment + conditional lock in a single DB round-trip.
      // Guard: only act while failedLoginAttempts < 5 and account is still unlocked.
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id, accountLocked: false, failedLoginAttempts: { $lt: 5 } },
        [
          {
            $set: {
              failedLoginAttempts: { $add: ['$failedLoginAttempts', 1] }
            }
          },
          {
            $set: {
              accountLocked: { $gte: ['$failedLoginAttempts', 5] }
            }
          }
        ],
        { new: true }
      );

      if (updatedUser?.accountLocked) {
        await threatEngine.recordFailedLogin(updatedUser);
      }

      if (updatedUser) {
        await User.adjustTrustScore(updatedUser._id, -15);
      }

      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Atomic reset — no instance.save()
    await User.findOneAndUpdate(
      { _id: user._id },
      { $set: { failedLoginAttempts: 0 } }
    );

    // Geo-IP logic
    const ip =
      req.ip ||
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      (req.connection && req.connection.socket && req.connection.socket.remoteAddress) ||
      'Unknown';
    const geo = geoip.lookup(ip);
    const currentCountry = geo ? geo.country : 'Unknown';
    // Advanced Geo-IP and Device Context Anomaly Detection
    const deviceId = req.headers['x-device-id'] || req.headers['user-agent'] || 'Unknown';
    const currentLat = geo?.ll?.[0] || 0;
    const currentLon = geo?.ll?.[1] || 0;
    const currentTime = new Date();

    if (user.lastLoginTimestamp && (user.lastLoginLat !== undefined && user.lastLoginLon !== undefined)) {
      const distance = calculateDistance(user.lastLoginLat, user.lastLoginLon, currentLat, currentLon);
      const hoursDiff = (currentTime - user.lastLoginTimestamp) / (1000 * 60 * 60);

      // Prevent division by zero for near-instantaneous concurrent logins
      const hours = Math.max(hoursDiff, 0.001);
      const speed = distance / hours;

      const isSameDevice = user.lastDeviceId === deviceId;
      const isSameIP = user.lastLoginIP === ip;

      let anomalySeverity = null;
      let penalty = 0;

      if (speed > secConfig.ANOMALY_CRITICAL_SPEED && !isSameDevice) {
        anomalySeverity = 'Critical';
        penalty = secConfig.TRUST_PENALTY_CRITICAL;

        // Critical Anomaly Exception: Force phone re-verification
        await User.findOneAndUpdate({ _id: user._id }, { phoneVerified: false });
      } else if (speed > secConfig.ANOMALY_MAX_SPEED) {
        anomalySeverity = 'High';
        penalty = secConfig.TRUST_PENALTY_HIGH;
      } else if (user.lastLoginCountry && user.lastLoginCountry !== currentCountry && !isSameDevice) {
        anomalySeverity = 'Medium';
        penalty = secConfig.TRUST_PENALTY_MEDIUM;
      }

      if (anomalySeverity) {
        await User.adjustTrustScore(user._id, penalty);
        await threatEngine.triggerThreat({
          type: 'ImpossibleTravel',
          severity: anomalySeverity,
          user: user.username,
          metadata: { speed: Math.round(speed), distance: Math.round(distance) },
          endpoint: '/auth/login'
        });
      }
    }

    await User.findOneAndUpdate(
      { username: normalizedUsername },
      {
        lastLoginIP: ip,
        lastLoginCountry: currentCountry,
        lastLoginTimestamp: currentTime,
        lastLoginLat: currentLat,
        lastLoginLon: currentLon,
        lastDeviceId: deviceId
      }
    );

    if (!process.env.JWT_SECRET || !process.env.REFRESH_SECRET) {
      return res.status(500).json({ message: 'Server misconfigured: JWT secrets missing' });
    }

    const accessJti = crypto.randomUUID();
    const accessToken = jwt.sign(
      { id: user._id, role: user.role, zone: user.zone, jti: accessJti },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshJti = crypto.randomUUID();
    const refreshToken = jwt.sign(
      { userId: user._id, jti: refreshJti },
      process.env.REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    const refreshDoc = new RefreshToken({
      user: user._id,
      tokenId: refreshJti,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deviceFingerprint: makeFingerprint(req)
    });
    await refreshDoc.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      token: accessToken,
      role: user.role,
      zone: user.zone,
      message: 'Login successful'
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const refreshDoc = await RefreshToken.findOne({
      tokenId: decoded.jti,
      revoked: false,
      expiresAt: { $gt: new Date() }
    });

    if (!refreshDoc) {
      // Token not found or already revoked — possible theft/reuse
      await RefreshToken.updateMany({ user: decoded.userId }, { revoked: true });
      const user = await User.findById(decoded.userId);
      if (user) await User.adjustTrustScore(user._id, -20);
      await threatEngine.triggerThreat({
        type: 'RefreshTokenReuse',
        severity: 'High',
        user: user ? user.username : 'Unknown',
        endpoint: '/auth/refresh'
      });
      res.clearCookie('refreshToken');
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // ── Device fingerprint binding check ───────────────────────────────────
    const incomingFingerprint = makeFingerprint(req);
    if (refreshDoc.deviceFingerprint && refreshDoc.deviceFingerprint !== incomingFingerprint) {
      // Stolen token used from a different device/IP
      await RefreshToken.updateMany({ user: decoded.userId }, { revoked: true });
      const user = await User.findById(decoded.userId);
      if (user) await User.adjustTrustScore(user._id, -30);
      await threatEngine.triggerThreat({
        type: 'RefreshTokenReuse',
        severity: 'Critical',
        user: user ? user.username : 'Unknown',
        endpoint: '/auth/refresh'
      });
      res.clearCookie('refreshToken');
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Rotate
    await RefreshToken.findOneAndUpdate({ tokenId: decoded.jti }, { revoked: true });

    const newRefreshJti = crypto.randomUUID();
    const newRefreshToken = jwt.sign(
      { userId: decoded.userId, jti: newRefreshJti },
      process.env.REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    const newRefreshDoc = new RefreshToken({
      user: decoded.userId,
      tokenId: newRefreshJti,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deviceFingerprint: makeFingerprint(req)  // Re-bind to current device
    });
    await newRefreshDoc.save();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const newAccessJti = crypto.randomUUID();
    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role, zone: user.zone, jti: newAccessJti },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ token: newAccessToken, role: user.role, zone: user.zone, username: user.username });
  } catch (err) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(400).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(400).json({ message: 'Invalid token format' });
    }

    const decoded = jwt.decode(token);
    if (!decoded || !decoded.jti) {
      return res.status(400).json({ message: 'Malformed token' });
    }

    const now = Math.floor(Date.now() / 1000);
    const ttl = decoded.exp - now;

    if (ttl > 0) {
      // Guard: prevent duplicate revocation entries filling Redis
      const redisKey = `revoked:${decoded.jti}`;
      const alreadyRevoked = await redisClient.exists(redisKey);
      if (!alreadyRevoked) {
        await redisClient.setEx(redisKey, ttl, '1');
      }
    }

    // Keep MongoDB for audit history
    await RevokedToken.create({
      tokenId: decoded.jti,
      user: decoded.id,
      expiresAt: new Date(decoded.exp * 1000)
    });

    res.json({ message: 'Successfully logged out' });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed', error: err.message });
  }
});

router.post('/admin/system-root-access', async (req, res) => {
  // Honeypot: Always 404, but log threat
  const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
  await threatEngine.triggerThreat({
    type: 'HoneypotAccess',
    severity: 'Critical',
    user: 'Unknown',
    endpoint: '/admin/system-root-access'
  });
  res.status(404).json({ message: 'Not found' });
});

router.post('/system/elevated-mode', require('../middleware/authMiddleware').verifyToken, require('../middleware/authMiddleware').authorizeRoles('Admin'), async (req, res) => {
  try {
    const { enabled } = req.body;
    await SystemState.findOneAndUpdate(
      { name: 'elevatedMode' },
      { value: enabled ? 1 : 0 },
      { upsert: true }
    );
    await threatEngine.triggerThreat({
      type: 'ElevatedModeRestriction',
      severity: 'Low',
      user: req.user.username,
      endpoint: '/system/elevated-mode'
    });
    res.json({ message: `Elevated mode ${enabled ? 'enabled' : 'disabled'}` });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register', validateBody('register'), async (req, res) => {
  try {
    const { username, password, phoneNumber, role, zone } = req.body;

    const normalizedUsername = String(username).trim().toLowerCase();

    const existingUser = await User.findOne({ username: normalizedUsername });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const finalRole = role ? String(role) : ROLES.VIEWER;

    const user = new User({
      username: normalizedUsername,
      password: String(password),
      phoneNumber: String(phoneNumber),
      role: finalRole,
      deviceTrustScore: 100,
      accountLocked: false,
      verificationCode,
      phoneVerified: false
    });

    await user.save();

    return res.status(201).json({
      message: 'Verification code sent',
      mockCode: verificationCode
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    return res.status(500).json({ message: 'Registration failed due to server error' });
  }
});

router.post('/verify-phone', validateBody('verifyPhone'), async (req, res) => {
  try {
    const { username, code } = req.body;
    const normalizedUsername = String(username).trim().toLowerCase();
    const strCode = String(code);

    const user = await User.findOne({ username: normalizedUsername });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.phoneVerified) {
      return res.status(400).json({ message: 'Phone is already verified' });
    }

    if (user.verificationCode !== strCode) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    await User.findOneAndUpdate(
      { _id: user._id },
      { $set: { phoneVerified: true, verificationCode: null } }
    );

    return res.json({ message: 'Phone verified successfully. You can now login.' });
  } catch (err) {
    return res.status(500).json({ message: 'Verification failed' });
  }
});

module.exports = router;
