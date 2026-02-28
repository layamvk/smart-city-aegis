const mongoose = require('mongoose');

const threatEventSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'BruteForce', 'PrivilegeEscalation', 'DDoS', 'UnauthorizedAccess',
      'ImpossibleTravel', 'GeoAnomaly', 'HoneypotAccess', 'Bioterrorism',
      'ElevatedModeRestriction', 'RefreshTokenReuse', 'RateLimitBreach'
    ]
  },
  severity: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Critical']
  },
  user: {
    type: String,
    default: 'Unknown'
  },
  endpoint: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes for paginated, filtered queries
threatEventSchema.index({ timestamp: -1 });                    // default sort
threatEventSchema.index({ type: 1, timestamp: -1 });            // filter by type
threatEventSchema.index({ severity: 1, timestamp: -1 });        // filter by severity

module.exports = mongoose.model('ThreatEvent', threatEventSchema);
