const mongoose = require('mongoose');

const fertilizerInventoryTransactionSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['IN', 'OUT'],
            required: true,
            index: true,
        },

        // We store categoryName as the primary key for now because this codebase
        // doesn't expose a stable fertilizer-categories collection via backend routes.
        categoryName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        // Supplier/company (mainly for stock IN)
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FertilizerCompany',
            default: null,
            index: true,
        },
        companyName: {
            type: String,
            trim: true,
            default: null,
        },

        kg: {
            type: Number,
            required: true,
            min: 0,
        },

        // For IN only
        unitPrice: {
            type: Number,
            default: null,
            min: 0,
        },
        totalPrice: {
            type: Number,
            default: null,
            min: 0,
        },

        // Event time (received/used)
        eventAt: {
            type: Date,
            default: Date.now,
            index: true,
        },

        // For OUT only
        purpose: {
            type: String,
            trim: true,
            default: null,
        },

        note: {
            type: String,
            trim: true,
            default: null,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
    },
    { timestamps: true }
);

fertilizerInventoryTransactionSchema.index({ categoryName: 1, eventAt: -1 });
fertilizerInventoryTransactionSchema.index({ type: 1, eventAt: -1 });

module.exports = mongoose.model(
    'FertilizerInventoryTransaction',
    fertilizerInventoryTransactionSchema
);
