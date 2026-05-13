const mongoose = require('mongoose');

const FertilizerRequestSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FertilizerCompany',
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    categoryName: {
        type: String,
        required: true
    },
    kg: {
        type: Number,
        required: true,
        min: 0
    },
    expectedDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Received', 'Cancelled'],
        default: 'Pending'
    },
    note: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('FertilizerRequest', FertilizerRequestSchema);
