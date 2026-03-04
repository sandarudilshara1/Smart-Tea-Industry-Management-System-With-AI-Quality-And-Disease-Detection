const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    vehicleNumber: {
        type: String,
        required: [true, 'Vehicle number is required'],
        trim: true,
        uppercase: true
    },
    vehicleType: {
        type: String,
        required: [true, 'Vehicle type is required'],
        enum: ['Truck', 'Van', 'Lorry', 'Pickup Truck', 'Other'],
        trim: true
    },
    model: {
        type: String,
        required: [true, 'Vehicle model is required'],
        trim: true
    },
    capacity: {
        type: String,
        required: [true, 'Capacity is required'],
        trim: true // e.g., "500kg", "1000kg"
    },
    status: {
        type: String,
        enum: ['Available', 'In Use', 'Maintenance', 'Unavailable'],
        default: 'Available'
    },
    assignedDriver: {
        type: String,
        default: null,
        trim: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        default: null
    },
    registrationNumber: {
        type: String,
        trim: true
    },
    chassisNumber: {
        type: String,
        trim: true
    },
    engineNumber: {
        type: String,
        trim: true
    },
    manufacturingYear: {
        type: Number,
        min: 1900,
        max: new Date().getFullYear() + 1
    },
    purchaseDate: {
        type: Date
    },
    lastServiceDate: {
        type: Date
    },
    nextServiceDate: {
        type: Date
    },
    insuranceExpiryDate: {
        type: Date
    },
    licenseExpiryDate: {
        type: Date
    },
    fuelType: {
        type: String,
        enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
        default: 'Diesel'
    },
    mileage: {
        type: Number,
        default: 0,
        min: 0
    },
    averageFuelConsumption: {
        type: String, // e.g., "15 km/l"
        trim: true
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 500
    },
    vehicleImage: {
        type: String, // Base64 or URL
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for better query performance
vehicleSchema.index({ vehicleNumber: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ vehicleType: 1 });
vehicleSchema.index({ isActive: 1 });
vehicleSchema.index({ assignedDriver: 1 });

// Virtual for checking if service is due
vehicleSchema.virtual('isServiceDue').get(function() {
    if (!this.nextServiceDate) return false;
    return new Date() >= this.nextServiceDate;
});

// Virtual for checking if insurance is expired
vehicleSchema.virtual('isInsuranceExpired').get(function() {
    if (!this.insuranceExpiryDate) return false;
    return new Date() >= this.insuranceExpiryDate;
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
