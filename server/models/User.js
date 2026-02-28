const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { ROLE_VALUES, ROLES } = require('../constants/roles');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: [...ROLE_VALUES, 'Admin', 'TrafficOperator', 'EmergencyAuthority', 'SecurityAnalyst'], // Retain old ones for compatibility temporarily
    default: ROLES.VIEWER
  },
  phoneNumber: {
    type: String,
    required: true
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    default: null
  },
  deviceTrustScore: {
    type: Number,
    default: 100
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  accountLocked: {
    type: Boolean,
    default: false
  },
  zone: {
    type: String,
    required: true,
    default: 'Central'
  },
  lastLoginIP: {
    type: String
  },
  lastLoginCountry: {
    type: String
  },
  lastLoginTimestamp: {
    type: Date
  },
  lastLoginLat: {
    type: Number
  },
  lastLoginLon: {
    type: Number
  },
  lastDeviceId: {
    type: String
  },
  emergencyOverrideUntil: {
    type: Date
  }
}, {
  timestamps: true
});

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Static atomic method to adjust trust score
userSchema.statics.adjustTrustScore = async function (userId, delta) {
  // First, atomically increment
  const updatedUser = await this.findOneAndUpdate(
    { _id: userId },
    { $inc: { deviceTrustScore: delta } },
    { new: true }
  );

  if (!updatedUser) return null;

  // Clamp safely if value went out of bounds
  if (updatedUser.deviceTrustScore < 0 || updatedUser.deviceTrustScore > 100) {
    const clampedScore = Math.max(0, Math.min(100, updatedUser.deviceTrustScore));
    return await this.findOneAndUpdate(
      { _id: userId },
      { $set: { deviceTrustScore: clampedScore } },
      { new: true }
    );
  }

  return updatedUser;
};

module.exports = mongoose.model('User', userSchema);

