const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tokenId: { type: String, unique: true, required: true },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
  deviceFingerprint: { type: String, default: null }, // IP hash + device-id binding
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
