const auditLogger = require('../services/auditLogger');
const threatEngine = require('../services/threatEngine');
const User = require('../models/User');
const { start, end } = require('../config/maintenanceWindow');

const enforceMaintenanceWindow = async (req, res, next) => {
  try {
    const now = new Date();
    const current = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const isWithinWindow = (() => {
      const toMinutes = (time) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
      };
      const currMin = toMinutes(current);
      const startMin = toMinutes(start);
      const endMin = toMinutes(end);
      if (startMin < endMin) {
        return currMin >= startMin && currMin <= endMin;
      } else {
        return currMin >= startMin || currMin <= endMin;
      }
    })();

    if (isWithinWindow || req.user.role === 'Admin' || req.user.role === 'EmergencyAuthority') {
      return next();
    }

    // Outside window and not allowed role
    const user = await User.findById(req.user.id);
    // Non-destructive learning logic:
    if (user) {
      await User.adjustTrustScore(user._id, -10);
    }
    await auditLogger.logAction({
      user: req.user ? req.user.username : 'Unknown',
      role: req.user ? req.user.role : 'Unknown',
      endpoint: req.originalUrl,
      method: req.method,
      status: 'Denied',
      reason: 'OutsideMaintenanceWindow',
      currentTime: current,
      allowedStart: start,
      allowedEnd: end,
      deviceId: req.header('User-Agent') || 'Unknown',
      ipAddress: req.ip || 'Unknown'
    });
    await threatEngine.triggerThreat({
      type: 'UnauthorizedTimeAccess',
      severity: 'Medium',
      user: req.user ? req.user.username : 'Unknown',
      endpoint: req.originalUrl
    });
    return res.status(403).json({ message: 'Access denied: Outside maintenance window' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  enforceMaintenanceWindow
};
