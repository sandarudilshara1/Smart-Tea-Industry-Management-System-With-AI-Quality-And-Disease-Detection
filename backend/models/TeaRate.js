const mongoose = require('mongoose');

const teaRateSchema = new mongoose.Schema({
    factoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    effectiveDate: {
        type: Date,
        required: true
    },
    rates: [{
        quality: {
            type: String,
            enum: ['A', 'B', 'C', 'Premium'],
            required: true
        },
        ratePerKg: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    defaultRate: {
        type: Number,
        required: true,
        min: 0
    },
    transportRatePerKg: {
        type: Number,
        default: 10,
        min: 0
    },
    bagWeightPercentage: {
        type: Number,
        default: 5,
        min: 0,
        max: 100
    },
    waterWeightPercentage: {
        type: Number,
        default: 3,
        min: 0,
        max: 100
    },
    coarseLeafPercentage: {
        type: Number,
        default: 2,
        min: 0,
        max: 100
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes
teaRateSchema.index({ factoryId: 1, effectiveDate: -1 });
teaRateSchema.index({ status: 1 });

module.exports = mongoose.model('TeaRate', teaRateSchema);
