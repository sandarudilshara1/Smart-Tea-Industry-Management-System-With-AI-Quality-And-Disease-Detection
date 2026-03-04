const Driver = require('../models/Driver');
const User = require('../models/User');

// @desc    Create new driver
// @route   POST /api/drivers
// @access  Private (Manager/Owner)
exports.createDriver = async (req, res) => {
    try {
        const { 
            userId, name, email, phone, licenseNo, licenseExpiry,
            vehicleNo, nic, address, status, experience, emergencyContact, factoryId
        } = req.body;

        // Validation
        if (!name || !email || !phone || !licenseNo || !nic || !address) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if driver with email already exists
        const existingDriver = await Driver.findOne({ email: email.toLowerCase() });
        if (existingDriver) {
            return res.status(400).json({
                success: false,
                message: 'Driver with this email already exists'
            });
        }

        // Create driver
        const driver = await Driver.create({
            userId: userId || req.user.userId, // Use provided userId or logged-in user's ID
            name,
            email: email.toLowerCase(),
            phone,
            licenseNo,
            licenseExpiry,
            vehicleNo,
            nic,
            address,
            status: status || 'Available',
            experience: experience || 0,
            emergencyContact,
            factoryId,
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: 'Driver created successfully',
            data: { driver }
        });
    } catch (error) {
        console.error('Create driver error:', error);
        
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: validationErrors
            });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            const fieldName = field === 'email' ? 'email address' : field;
            return res.status(400).json({
                success: false,
                message: `A driver with this ${fieldName} already exists. Please use a different ${fieldName}.`
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error creating driver',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Private
exports.getAllDrivers = async (req, res) => {
    try {
        const { status, factoryId } = req.query;

        let query = { isActive: true };

        if (status && status !== 'All') {
            query.status = status;
        }

        if (factoryId) {
            query.factoryId = parseInt(factoryId);
        }

        const drivers = await Driver.find(query)
            .populate('userId', 'firstName lastName email role')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: drivers.length,
            data: { drivers }
        });
    } catch (error) {
        console.error('Get drivers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching drivers',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get single driver
// @route   GET /api/drivers/:id
// @access  Private
exports.getDriverById = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id)
            .populate('userId', 'firstName lastName email role');

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { driver }
        });
    } catch (error) {
        console.error('Get driver error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching driver',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Update driver
// @route   PUT /api/drivers/:id
// @access  Private (Manager/Owner)
exports.updateDriver = async (req, res) => {
    try {
        const { 
            name, phone, licenseNo, licenseExpiry, vehicleNo,
            address, status, experience, emergencyContact, assignedRoutes
        } = req.body;

        const driver = await Driver.findById(req.params.id);

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        // Update fields
        if (name) driver.name = name;
        if (phone) driver.phone = phone;
        if (licenseNo) driver.licenseNo = licenseNo;
        if (licenseExpiry) driver.licenseExpiry = licenseExpiry;
        if (vehicleNo) driver.vehicleNo = vehicleNo;
        if (address) driver.address = address;
        if (status) driver.status = status;
        if (experience !== undefined) driver.experience = experience;
        if (emergencyContact) driver.emergencyContact = emergencyContact;
        if (assignedRoutes) driver.assignedRoutes = assignedRoutes;

        await driver.save();

        res.status(200).json({
            success: true,
            message: 'Driver updated successfully',
            data: { driver }
        });
    } catch (error) {
        console.error('Update driver error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating driver',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Delete driver (soft delete)
// @route   DELETE /api/drivers/:id
// @access  Private (Manager/Owner)
exports.deleteDriver = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        driver.isActive = false;
        await driver.save();

        res.status(200).json({
            success: true,
            message: 'Driver deleted successfully'
        });
    } catch (error) {
        console.error('Delete driver error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting driver',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Assign route to driver
// @route   POST /api/drivers/:id/assign-route
// @access  Private (Manager/Owner)
exports.assignRoute = async (req, res) => {
    try {
        const { routeId, routeName } = req.body;

        if (!routeId || !routeName) {
            return res.status(400).json({
                success: false,
                message: 'Please provide routeId and routeName'
            });
        }

        const driver = await Driver.findById(req.params.id);

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        // Check if route already assigned
        const routeExists = driver.assignedRoutes.some(r => r.routeId === routeId);
        if (routeExists) {
            return res.status(400).json({
                success: false,
                message: 'Route already assigned to this driver'
            });
        }

        driver.assignedRoutes.push({
            routeId,
            routeName,
            assignedDate: new Date()
        });

        driver.status = 'On Route';
        await driver.save();

        res.status(200).json({
            success: true,
            message: 'Route assigned successfully',
            data: { driver }
        });
    } catch (error) {
        console.error('Assign route error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error assigning route',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Unassign route from driver
// @route   DELETE /api/drivers/:id/assign-route/:routeId
// @access  Private (Manager/Owner)
exports.unassignRoute = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        driver.assignedRoutes = driver.assignedRoutes.filter(
            r => r.routeId !== req.params.routeId
        );

        if (driver.assignedRoutes.length === 0) {
            driver.status = 'Available';
        }

        await driver.save();

        res.status(200).json({
            success: true,
            message: 'Route unassigned successfully',
            data: { driver }
        });
    } catch (error) {
        console.error('Unassign route error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error unassigning route',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};
