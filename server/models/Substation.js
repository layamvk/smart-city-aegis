const mongoose = require('mongoose');

const substationSchema = new mongoose.Schema({
    substationId: { type: String, unique: true, required: true },
    zone: { type: String, required: true },
    loadPercent: { type: Number, default: 0 },
    frequency: { type: Number, default: 50 },
    transformerHealth: { type: Number, default: 100 },
    operationalMode: {
        type: String,
        enum: ['Normal', 'Island', 'Safe'],
        default: 'Normal'
    },
    history: [{
        timestamp: { type: Date, default: Date.now },
        load: Number
    }],
    lastModified: { type: Date, default: Date.now },
    modifiedBy: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Substation', substationSchema);
