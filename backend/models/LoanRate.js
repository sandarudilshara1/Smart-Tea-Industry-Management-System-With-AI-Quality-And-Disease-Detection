const mongoose = require('mongoose');

const loanRateSchema = new mongoose.Schema({
    rate: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    effectiveDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('LoanRate', loanRateSchema);
