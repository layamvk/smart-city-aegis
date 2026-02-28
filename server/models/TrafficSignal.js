const mongoose = require('mongoose');

const trafficSignalSchema = new mongoose.Schema({
  signalId: { type: String, unique: true, required: true },
  zone: { type: String, required: true },
  status: { type: String, enum: ['RED', 'YELLOW', 'GREEN'], default: 'GREEN' },
  cycleTimer: { type: Number, default: 60 },
  congestionLevel: { type: Number, default: 0 },
  manualOverride: { type: Boolean, default: false },
  emergencyPriority: { type: Boolean, default: false },
  history: [{
    timestamp: { type: Date, default: Date.now },
    congestion: Number
  }],
  lastModified: { type: Date, default: Date.now },
  modifiedBy: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('TrafficSignal', trafficSignalSchema);
