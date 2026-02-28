const mongoose = require('mongoose');

const emergencyIncidentSchema = new mongoose.Schema({
  incidentId: { type: String, unique: true, required: true },
  type: { type: String, enum: ['Fire', 'Accident', 'Medical', 'UtilityFailure'], required: true },
  zone: { type: String, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  status: { type: String, enum: ['OPEN', 'DISPATCHED', 'RESOLVED'], default: 'OPEN' },
  assignedUnit: { type: String },
  eta: { type: Number }, // in minutes
  coordinates: {
    lat: Number,
    lng: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('EmergencyIncident', emergencyIncidentSchema);
