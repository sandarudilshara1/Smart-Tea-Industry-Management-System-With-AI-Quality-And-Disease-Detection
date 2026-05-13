const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    position: {
        type: String,
        required: [true, 'Position is required'],
        enum: [
            'Factory Manager',
            'Transport Manager',
            'Inventory Manager',
            'Fertilizer Manager',
            'Payment Manager',
            'Driver',
            'Tea Collector',
            'Quality Inspector',
            'Warehouse Supervisor',
            'Field Worker'
        ]
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        enum: [
            'Management',
            'Transport',
            'Inventory',
            'Fertilizer',
            'Payment',
            'Quality Control',
            'Production',
            'Field Operations'
        ]
    },
    salary: {
        type: Number,
        required: [true, 'Salary is required'],
        min: 0
    },
    hireDate: {
        type: Date,
        required: [true, 'Hire date is required']
    },
    address: {
        type: String,
        trim: true,
        default: ''
    },
    city: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        required: true,
        enum: ['Active', 'On Leave', 'Inactive'],
        default: 'Active'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for faster queries

employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ position: 1 });

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Employee', employeeSchema);
