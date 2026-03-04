const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Private (Transport Manager, Factory Manager, Owner)
exports.getAllVehicles = async (req, res) => {
    try {
        const { status, vehicleType, isActive } = req.query;
        
        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (vehicleType) filter.vehicleType = vehicleType;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const vehicles = await Vehicle.find(filter)
            .populate('driverId', 'name phone')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: vehicles.length,
            data: vehicles
        });
    } catch (error) {
        console.error('Get all vehicles error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching vehicles',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get single vehicle by ID
// @route   GET /api/vehicles/:id
// @access  Private
exports.getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id)
            .populate('driverId', 'name phone email licenseNumber');

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.status(200).json({
            success: true,
            data: vehicle
        });
    } catch (error) {
        console.error('Get vehicle by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching vehicle',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Private (Transport Manager, Owner)
exports.createVehicle = async (req, res) => {
    try {
        const vehicleData = req.body;

        // Check if vehicle number already exists
        const existingVehicle = await Vehicle.findOne({ 
            vehicleNumber: vehicleData.vehicleNumber.toUpperCase() 
        });

        if (existingVehicle) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle with this number already exists'
            });
        }

        // If driver is assigned, verify driver exists and update driver's vehicleNo
        if (vehicleData.driverId) {
            const driver = await Driver.findById(vehicleData.driverId);
            if (!driver) {
                return res.status(404).json({
                    success: false,
                    message: 'Assigned driver not found'
                });
            }
            
            // Update driver's vehicle number
            await Driver.findByIdAndUpdate(vehicleData.driverId, {
                vehicleNo: vehicleData.vehicleNumber.toUpperCase()
            });
        }

        const vehicle = await Vehicle.create(vehicleData);

        res.status(201).json({
            success: true,
            message: 'Vehicle created successfully',
            data: vehicle
        });
    } catch (error) {
        console.error('Create vehicle error:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error creating vehicle',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private (Transport Manager, Owner)
exports.updateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // If vehicle number is being changed, check if new number is unique
        if (req.body.vehicleNumber && req.body.vehicleNumber !== vehicle.vehicleNumber) {
            const existingVehicle = await Vehicle.findOne({
                vehicleNumber: req.body.vehicleNumber.toUpperCase(),
                _id: { $ne: req.params.id }
            });

            if (existingVehicle) {
                return res.status(400).json({
                    success: false,
                    message: 'Vehicle number already exists'
                });
            }
        }

        // If driver is being changed, update both old and new driver records
        if (req.body.driverId !== vehicle.driverId?.toString()) {
            // Remove vehicle from old driver
            if (vehicle.driverId) {
                await Driver.findByIdAndUpdate(vehicle.driverId, {
                    vehicleNo: null
                });
            }

            // Assign vehicle to new driver
            if (req.body.driverId) {
                const newDriver = await Driver.findById(req.body.driverId);
                if (!newDriver) {
                    return res.status(404).json({
                        success: false,
                        message: 'New driver not found'
                    });
                }
                
                await Driver.findByIdAndUpdate(req.body.driverId, {
                    vehicleNo: req.body.vehicleNumber || vehicle.vehicleNumber
                });
            }
        }

        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate('driverId', 'name phone email');

        res.status(200).json({
            success: true,
            message: 'Vehicle updated successfully',
            data: updatedVehicle
        });
    } catch (error) {
        console.error('Update vehicle error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error updating vehicle',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Delete vehicle (soft delete)
// @route   DELETE /api/vehicles/:id
// @access  Private (Owner only)
exports.deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // If vehicle is assigned to a driver, remove assignment
        if (vehicle.driverId) {
            await Driver.findByIdAndUpdate(vehicle.driverId, {
                vehicleNo: null
            });
        }

        // Soft delete
        vehicle.isActive = false;
        vehicle.status = 'Unavailable';
        await vehicle.save();

        res.status(200).json({
            success: true,
            message: 'Vehicle deleted successfully'
        });
    } catch (error) {
        console.error('Delete vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting vehicle',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Update vehicle status
// @route   PATCH /api/vehicles/:id/status
// @access  Private (Transport Manager, Owner)
exports.updateVehicleStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['Available', 'In Use', 'Maintenance', 'Unavailable'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Vehicle status updated successfully',
            data: vehicle
        });
    } catch (error) {
        console.error('Update vehicle status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating vehicle status',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Assign driver to vehicle
// @route   PATCH /api/vehicles/:id/assign-driver
// @access  Private (Transport Manager, Owner)
exports.assignDriver = async (req, res) => {
    try {
        const { driverId, driverName } = req.body;

        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // Verify driver exists
        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        // Update vehicle
        vehicle.driverId = driverId;
        vehicle.assignedDriver = driverName || driver.name;
        vehicle.status = 'In Use';
        await vehicle.save();

        // Update driver's vehicle number
        await Driver.findByIdAndUpdate(driverId, {
            vehicleNo: vehicle.vehicleNumber
        });

        res.status(200).json({
            success: true,
            message: 'Driver assigned successfully',
            data: vehicle
        });
    } catch (error) {
        console.error('Assign driver error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error assigning driver',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Unassign driver from vehicle
// @route   PATCH /api/vehicles/:id/unassign-driver
// @access  Private (Transport Manager, Owner)
exports.unassignDriver = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // Remove vehicle from driver record
        if (vehicle.driverId) {
            await Driver.findByIdAndUpdate(vehicle.driverId, {
                vehicleNo: null
            });
        }

        vehicle.driverId = null;
        vehicle.assignedDriver = null;
        vehicle.status = 'Available';
        await vehicle.save();

        res.status(200).json({
            success: true,
            message: 'Driver unassigned successfully',
            data: vehicle
        });
    } catch (error) {
        console.error('Unassign driver error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error unassigning driver',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get vehicle statistics
// @route   GET /api/vehicles/stats/summary
// @access  Private
exports.getVehicleStats = async (req, res) => {
    try {
        const total = await Vehicle.countDocuments({ isActive: true });
        const available = await Vehicle.countDocuments({ status: 'Available', isActive: true });
        const inUse = await Vehicle.countDocuments({ status: 'In Use', isActive: true });
        const maintenance = await Vehicle.countDocuments({ status: 'Maintenance', isActive: true });
        
        const byType = await Vehicle.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$vehicleType',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                total,
                available,
                inUse,
                maintenance,
                byType
            }
        });
    } catch (error) {
        console.error('Get vehicle stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching vehicle statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};
