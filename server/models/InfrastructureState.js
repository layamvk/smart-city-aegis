const mongoose = require('mongoose');

const infrastructureStateSchema = new mongoose.Schema({
  systemType: {
    type: String,
    required: true,
    enum: ['Traffic', 'Water', 'Power']
  },
  resourceId: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  updatedBy: {
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

module.exports = mongoose.model('InfrastructureState', infrastructureStateSchema);
