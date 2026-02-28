const mongoose = require('mongoose');

const reservoirSchema = new mongoose.Schema({
    name: { type: String, required: true },
    zone: { type: String, required: true, unique: true },
    capacityPercent: { type: Number, default: 100 },
    flowRate: { type: Number, default: 0 },
    pressure: { type: Number, default: 100 },
    contaminationFlag: { type: Boolean, default: false },
    history: [{
        timestamp: { type: Date, default: Date.now },
        capacity: Number,
        pressure: Number
    }],
    lastModified: { type: Date, default: Date.now },
    modifiedBy: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Reservoir', reservoirSchema);
