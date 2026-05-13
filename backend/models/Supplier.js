const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    factoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    supplierCode: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    routeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route',
        required: false  // Assigned by admin after registration
    },
    address: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    nicNumber: {
        type: String,
        required: false  // Optional for self-registered suppliers
    },
    bankDetails: {
        bankName: String,
        branchName: String,
        accountNumber: String,
        accountHolderName: String
    },
    preferredPaymentMethod: {
        type: String,
        enum: ['Bank', 'Cash'],
        default: 'Bank'
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Suspended'],
        default: 'Active'
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    // Statistics
    totalSupplied: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    outstandingAdvances: {
        type: Number,
        default: 0
    },
    outstandingFertilizer: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});


supplierSchema.index({ factoryId: 1, status: 1 });
supplierSchema.index({ routeId: 1 });
supplierSchema.index({ userId: 1 });

module.exports = mongoose.model('Supplier', supplierSchema);
