const mongoose = require('mongoose');

const leafSupplyRequestSchema = new mongoose.Schema(
    {
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Supplier',
            required: true,
            index: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        requestedKg: {
            type: Number,
            required: true,
            min: 0,
        },
        requestedForAt: {
            type: Date,
        },
        pickupLocation: {
            type: String,
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['PENDING', 'CONFIRMED', 'REJECTED', 'RECEIVED'],
            default: 'PENDING',
            index: true,
        },
        confirmedAt: { type: Date },
        rejectedAt: { type: Date },
        receivedAt: { type: Date },
        rejectionReason: { type: String, trim: true },
        actualReceivedKg: { type: Number, min: 0 },
        teaLeafEntryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TeaLeafEntry',
        },
    },
    { timestamps: true }
);

leafSupplyRequestSchema.index({ supplierId: 1, status: 1, createdAt: -1 });
leafSupplyRequestSchema.index({ createdBy: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('LeafSupplyRequest', leafSupplyRequestSchema);
