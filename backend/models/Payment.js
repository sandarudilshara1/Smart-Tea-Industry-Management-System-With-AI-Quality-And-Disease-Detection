const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
    routeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route',
        required: true
    },
    paymentType: {
        type: String,
        enum: ['Monthly', 'Adhoc', 'Advance', 'Fertilizer'],
        required: true
    },
    paymentPeriod: {
        month: {
            type: Number,
            min: 1,
            max: 12
        },
        year: {
            type: Number
        }
    },
    // Calculation details
    totalWeight: {
        type: Number,
        default: 0
    },
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
    ratePerKg: {
        type: Number,
        required: true
    },
    grossAmount: {
        type: Number,
        required: true
    },
    // Deductions
    deductions: {
        advances: {
            type: Number,
            default: 0
        },
        fertilizer: {
            type: Number,
            default: 0
        },
        transport: {
            type: Number,
            default: 0
        },
        loans: {
            type: Number,
            default: 0
        },
        others: {
            type: Number,
            default: 0
        },
        otherDetails: {
            type: String
        }
    },
    totalDeductions: {
        type: Number,
        default: 0
    },
    finalAmount: {
        type: Number,
        required: true
    },
    // Payment details
    paymentMethod: {
        type: String,
        enum: ['Bank', 'Cash', 'Cheque'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Calculated', 'Approved', 'Queued', 'Processing', 'Paid', 'Failed', 'Rejected'],
        default: 'Calculated'
    },
    calculatedDate: {
        type: Date,
        default: Date.now
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedDate: {
        type: Date
    },
    paidDate: {
        type: Date
    },
    paymentReference: {
        type: String
    },
    bankBatchId: {
        type: String
    },
    cashBatchId: {
        type: String
    },
    disbursedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    disbursementDate: {
        type: Date
    },
    receiptNumber: {
        type: String
    },
    notes: {
        type: String
    },
    // Tea leaf entries included in this payment
    teaLeafEntries: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TeaLeafEntry'
    }]
}, {
    timestamps: true
});

// Indexes
paymentSchema.index({ supplierId: 1, paymentStatus: 1 });
paymentSchema.index({ factoryId: 1, paymentStatus: 1 });
paymentSchema.index({ routeId: 1 });
paymentSchema.index({ 'paymentPeriod.year': 1, 'paymentPeriod.month': 1 });
paymentSchema.index({ paymentType: 1, paymentStatus: 1 });
paymentSchema.index({ calculatedDate: -1 });
paymentSchema.index({ paidDate: -1 });
paymentSchema.index({ bankBatchId: 1 });
paymentSchema.index({ cashBatchId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
