const mongoose = require('mongoose');

const SecurityLogSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    attackId: { type: String, required: true },
    attackType: { type: String, required: true },
    severity: { type: String, enum: ['INFO', 'WARNING', 'CRITICAL'], required: true },

    ipAddress: String,
    geoLocation: String,
    deviceFingerprint: String,

    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String,

    targetEndpoint: String,
    responseCode: Number,
    safeguardTriggered: Boolean,

    trustBefore: Number,
    trustAfter: Number,
    threatBefore: Number,
    threatAfter: Number,

    systemStatus: String
});

SecurityLogSchema.index({ timestamp: -1 });
SecurityLogSchema.index({ attackType: 1 });

module.exports = mongoose.model('SecurityLog', SecurityLogSchema);
