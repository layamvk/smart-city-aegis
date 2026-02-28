const mongoose = require('mongoose');

const lightClusterSchema = new mongoose.Schema({
    zone: { type: String, required: true, unique: true },
    brightness: { type: Number, default: 85 },
    energyMode: {
        type: String,
        enum: ['Normal', 'Saving', 'Emergency'],
        default: 'Normal'
    },
    faultCount: { type: Number, default: 0 },
    lastModified: { type: Date, default: Date.now },
    modifiedBy: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('LightCluster', lightClusterSchema);
