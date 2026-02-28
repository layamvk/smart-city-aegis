const mongoose = require('mongoose');

const waterZoneSchema = new mongoose.Schema({
  zoneId: { type: String, unique: true, required: true },
  waterLevel: { type: Number, required: true },
  flowRate: { type: Number, required: true },
  isShutdown: { type: Boolean, default: false },
  lastModified: { type: Date, default: Date.now },
  modifiedBy: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('WaterZone', waterZoneSchema);
