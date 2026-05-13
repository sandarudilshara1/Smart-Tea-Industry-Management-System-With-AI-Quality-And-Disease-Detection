const mongoose = require('mongoose');

const teaLeafEntrySchema = new mongoose.Schema({
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    factoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    routeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route',
        required: false // Optional — not all suppliers have a route assigned
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    weight: {
        type: Number,
        required: true,
        min: 0
    },
    quality: {
        type: String,
        enum: ['A', 'B', 'C', 'Premium'],
        default: 'A'
    },
    ratePerKg: {
        type: Number,
        required: true,
        min: 0
    },
    grossAmount: {
        type: Number,
        required: true,
        min: 0
    },
    // Weight deductions
    bagWeight: {
        type: Number,
        default: 0
    },
    waterWeight: {
        type: Number,
        default: 0
    },
    coarseLeafWeight: {
        type: Number,
        default: 0
    },
    netWeight: {
        type: Number,
        required: true
    },
    netAmount: {
        type: Number,
        required: true
    },
    vehicleNumber: {
        type: String
    },
    driverName: {
        type: String
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Recorded', 'Verified', 'Processed', 'Paid'],
        default: 'Recorded'
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
teaLeafEntrySchema.index({ supplierId: 1, date: -1 });
teaLeafEntrySchema.index({ factoryId: 1, date: -1 });
teaLeafEntrySchema.index({ routeId: 1, date: -1 });
teaLeafEntrySchema.index({ date: -1 });
teaLeafEntrySchema.index({ status: 1 });

module.exports = mongoose.model('TeaLeafEntry', teaLeafEntrySchema);
