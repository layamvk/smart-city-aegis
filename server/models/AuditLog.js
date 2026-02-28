const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  endpoint: {
    type: String,
    required: true
  },
  method: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Allowed', 'Denied'],
    required: true
  },
  reason: {
    type: String,
    default: null
  },
  deviceId: {
    type: String,
    default: 'Unknown'
  },
  ipAddress: {
    type: String,
    default: 'Unknown'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes optimised for paginated filtered queries
auditLogSchema.index({ timestamp: -1 });                  // default sort
auditLogSchema.index({ user: 1, timestamp: -1 });          // filter by user
auditLogSchema.index({ status: 1, timestamp: -1 });        // filter by status

module.exports = mongoose.model('AuditLog', auditLogSchema);
