const mongoose = require('mongoose');

const revokedTokenSchema = new mongoose.Schema({
  tokenId: { type: String, unique: true, required: true },
  expiresAt: { type: Date, required: true }
});

module.exports = mongoose.model('RevokedToken', revokedTokenSchema);
