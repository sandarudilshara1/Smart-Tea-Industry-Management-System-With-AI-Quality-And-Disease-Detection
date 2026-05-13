const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema(
    {
        reportedByDriverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Driver',
            required: true,
        },
        reportedByUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },

        driverName: { type: String, required: true, trim: true },
        driverEmail: { type: String, required: true, trim: true, lowercase: true },

        vehicleNumber: { type: String, required: true, trim: true, uppercase: true },

        routeId: { type: String, required: false },
        routeName: { type: String, required: false },
        tripStatusAtReport: {
            type: String,
            required: false,
            enum: ['Not Started', 'Started', 'Collecting', 'Returning', 'Reached Destination', 'Completed'],
        },

        issueType: {
            type: String,
            required: true,
            enum: ['Breakdown', 'Accident', 'Medical', 'Other'],
            default: 'Breakdown',
        },
        severity: {
            type: String,
            required: true,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium',
        },

        description: { type: String, required: true, trim: true, maxlength: 1000 },
        locationText: { type: String, required: false, trim: true, maxlength: 300 },

        status: {
            type: String,
            required: true,
            enum: ['Reported', 'Acknowledged', 'Replacement Assigned', 'Resolved', 'Cancelled'],
            default: 'Reported',
        },

        replacementVehicleNumber: { type: String, default: null, trim: true, uppercase: true },
        assignedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        assignmentNote: { type: String, default: null, trim: true, maxlength: 500 },

        acknowledgedAt: { type: Date, default: null },
        replacementAssignedAt: { type: Date, default: null },
        resolvedAt: { type: Date, default: null },
        cancelledAt: { type: Date, default: null },
    },
    { timestamps: true }
);

emergencySchema.index({ status: 1, createdAt: -1 });
emergencySchema.index({ vehicleNumber: 1, createdAt: -1 });
emergencySchema.index({ reportedByDriverId: 1, createdAt: -1 });

module.exports = mongoose.model('Emergency', emergencySchema);
