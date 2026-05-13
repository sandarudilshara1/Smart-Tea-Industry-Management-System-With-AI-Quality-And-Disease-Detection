const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
    factoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    routeNumber: {
        type: String,
        required: true,
        unique: true
    },
    routeName: {
        type: String,
        required: true
    },
    area: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver'
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle'
    },
    collectionDays: [{
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    supplierCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes
routeSchema.index({ factoryId: 1, status: 1 });


module.exports = mongoose.model('Route', routeSchema);
