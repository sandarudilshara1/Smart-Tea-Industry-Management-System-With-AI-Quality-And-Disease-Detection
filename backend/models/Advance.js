const mongoose = require('mongoose');

const advanceSchema = new mongoose.Schema({
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    factoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    requestDate: {
        type: Date,
        default: Date.now
    },
    requestedAmount: {
        type: Number,
        required: true
    },
    approvedAmount: {
        type: Number
    },
    status: {
        type: String,
        enum: ['REQUESTED', 'APPROVED', 'REJECTED', 'PAID'],
        default: 'REQUESTED'
    },
    reason: {
        type: String,
        required: true
    },
    notes: {
        type: String
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedDate: {
        type: Date
    },
    rejectionReason: {
        type: String
    },
    paidDate: {
        type: Date
    },
    paymentMethod: {
        type: String,
        enum: ['Bank', 'Cash']
    },
    paymentReference: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
advanceSchema.index({ supplierId: 1, status: 1 });
advanceSchema.index({ factoryId: 1, status: 1 });
advanceSchema.index({ requestDate: -1 });

module.exports = mongoose.model('Advance', advanceSchema);
