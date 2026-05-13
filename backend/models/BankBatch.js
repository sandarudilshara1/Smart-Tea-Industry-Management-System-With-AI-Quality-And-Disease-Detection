const mongoose = require('mongoose');

const bankBatchSchema = new mongoose.Schema({
    factoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    batchNumber: {
        type: String,
        required: true,
        unique: true
    },
    generatedDate: {
        type: Date,
        default: Date.now
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    paymentIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    }],
    totalPayments: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    csvFilePath: {
        type: String
    },
    csvFileName: {
        type: String
    },
    status: {
        type: String,
        enum: ['Generated', 'Downloaded', 'Uploaded', 'Processed', 'Completed', 'Failed'],
        default: 'Generated'
    },
    processedDate: {
        type: Date
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes
bankBatchSchema.index({ factoryId: 1, generatedDate: -1 });
bankBatchSchema.index({ status: 1 });


module.exports = mongoose.model('BankBatch', bankBatchSchema);
