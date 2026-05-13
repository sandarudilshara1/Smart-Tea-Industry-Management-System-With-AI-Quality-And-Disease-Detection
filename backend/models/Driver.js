const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false  // Optional - drivers may not have user accounts
    },
    name: {
        type: String,
        required: [true, 'Driver name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    licenseNo: {
        type: String,
        required: [true, 'License number is required']
    },
    licenseExpiry: {
        type: Date
    },
    vehicleNo: {
        type: String
    },
    nic: {
        type: String,
        required: [true, 'NIC is required']
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    status: {
        type: String,
        enum: ['Available', 'On Route', 'On Leave', 'Inactive'],
        default: 'Available'
    },
    currentTrip: {
        routeId: String,
        routeName: String,
        vehicleNo: String,
        status: { 
            type: String, 
            enum: ['Not Started', 'Started', 'Collecting', 'Returning', 'Reached Destination', 'Completed'] 
        },
        startTime: Date,
        lastUpdate: Date,
        assignedDate: Date
    },
    assignedRoutes: [{
        routeId: String,
        routeName: String,
        assignedDate: Date
    }],
    experience: {
        type: Number, // years
        default: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalTrips: {
        type: Number,
        default: 0
    },
    emergencyContact: {
        name: String,
        phone: String,
        relationship: String
    },
    factoryId: {
        type: Number,
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries (email and licenseNo already have unique indexes)
driverSchema.index({ status: 1 });
driverSchema.index({ factoryId: 1 });

module.exports = mongoose.model('Driver', driverSchema);
