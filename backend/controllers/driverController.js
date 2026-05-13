const Driver = require('../models/Driver');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Emergency = require('../models/Emergency');


// @desc    Create new driver
// @route   POST /api/drivers
// @access  Private (Manager/Owner)
exports.createDriver = async (req, res) => {
    try {
        const {
            userId, name, email, phone, licenseNo, licenseNumber, licenseExpiry,
            vehicleNo, nic, address, status, experience, emergencyContact
        } = req.body;

        const normalizedLicenseNo = (licenseNo || licenseNumber || '').trim();
        const normalizedEmail = (email || '').toLowerCase().trim();

        // Validation
        if (!name || !normalizedEmail || !phone || !normalizedLicenseNo || !nic || !address) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if driver with email already exists
        const existingDriver = await Driver.findOne({ email: normalizedEmail });
        if (existingDriver) {
            return res.status(400).json({
                success: false,
                message: 'Driver with this email already exists'
            });
        }

        // Create driver
        const driver = await Driver.create({
            userId: userId || undefined, // userId is optional
            name,
            email: normalizedEmail,
            phone,
            licenseNo: normalizedLicenseNo,
            licenseExpiry,
            vehicleNo,
            nic,
            address,
            status: status || 'Available',
            experience: experience || 0,
            emergencyContact,
            isActive: true
        });

        console.log(`✅ POST /api/drivers - Created driver: ${driver.name} (${driver._id})`);

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
            const fieldName = field === 'email'
                ? 'email address'
                : (field === 'licenseNo' || field === 'licenseNumber' ? 'license number' : field);
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
        const { status } = req.query;

        // Auto-sync missing Driver profiles for self-registered 'driver' Users
        const driverUsers = await User.find({ role: 'driver', isActive: true });
        const existingDrivers = await Driver.find({});
        const existingEmails = new Set(existingDrivers.map(d => (d.email || '').toLowerCase()));

        for (const user of driverUsers) {
            if (user.email && !existingEmails.has(user.email.toLowerCase())) {
                try {
                    const uniqueSuffix = user._id ? user._id.toString().slice(-6).toUpperCase() : Math.floor(Math.random() * 1000000).toString();
                    await Driver.create({
                        userId: user._id,
                        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed Driver',
                        email: user.email.toLowerCase(),
                        phone: user.phone || '0000000000',
                        licenseNo: `PENDING-${uniqueSuffix}`,
                        nic: user.nic || `PENDING-${uniqueSuffix}`,
                        address: user.address || 'PENDING SETUP',
                        status: 'Inactive', // Set to inactive so TM has to approve it
                        experience: 0,
                        isActive: true
                    });
                    console.log(`🔄 Auto-synced missing driver profile for self-registered user: ${user.email}`);
                    existingEmails.add(user.email.toLowerCase());
                } catch (syncErr) {
                    console.error(`Failed to auto-sync driver profile for ${user.email}:`, syncErr.message);
                }
            }
        }

        let query = { isActive: true };

        if (status && status !== 'All') {
            query.status = status;
        }

        const drivers = await Driver.find(query)
            .populate('userId', 'firstName lastName email role')
            .sort({ createdAt: -1 });

        // Log removed to reduce noise during polling
        // console.log(`📊 GET /api/drivers - Found ${drivers.length} drivers`);

        res.status(200).json({
            success: true,
            count: drivers.length,
            data: { drivers }
        });
    } catch (error) {
        console.error('❌ Get drivers error:', error);
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

// @desc    Get logged in driver profile
// @route   GET /api/drivers/me
// @access  Private (Driver)
exports.getMyDriverProfile = async (req, res) => {
    try {
        const authUserId = req.user.userId || req.user.id;

        if (!authUserId) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token: User ID missing'
            });
        }

        // First: try to find driver linked by userId
        let driver = await Driver.findOne({ userId: authUserId })
            .populate('userId', 'firstName lastName email role phone address nic');

        // Fallback: if no userId link exists, match by email
        if (!driver) {
            const user = await User.findById(authUserId).select('email firstName lastName phone address nic role');
            if (user && user.email) {
                driver = await Driver.findOne({ email: user.email })
                    .populate('userId', 'firstName lastName email role phone address nic');

                // Auto-link the userId for future lookups
                if (driver && !driver.userId) {
                    driver.userId = authUserId;
                    await driver.save();
                }

                // If still no driver record, return a partial profile from User model
                if (!driver) {
                    const partialProfile = {
                        _id: authUserId,
                        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                        email: user.email,
                        phone: user.phone || '',
                        address: user.address || '',
                        nic: user.nic || '',
                        status: 'Available',
                        licenseNo: '',
                        licenseExpiry: null,
                        vehicleNo: '',
                        experience: 0,
                        assignedRoutes: [],
                        emergencyContact: {},
                        userId: {
                            _id: authUserId,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            role: user.role
                        },
                        _isPartialProfile: true
                    };
                    return res.status(200).json({
                        success: true,
                        data: partialProfile,
                        message: 'Showing account info. Full driver profile not yet created.'
                    });
                }
            }
        }

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver profile not found.'
            });
        }

        res.status(200).json({
            success: true,
            data: driver
        });
    } catch (error) {
        console.error('Get my driver profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching profile',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Update logged in driver profile (Self-Service)
// @route   PUT /api/drivers/me
// @access  Private (Driver)
exports.updateMyDriverProfile = async (req, res) => {
    try {
        const authUserId = req.user.userId || req.user.id;

        if (!authUserId) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        const { nic, licenseNo, licenseNumber, licenseExpiry, experience, emergencyContact } = req.body;
        const normalizedLicenseNo = (licenseNo || licenseNumber || '').trim();

        // Find driver
        let driver = await Driver.findOne({ userId: authUserId });

        // If they don't have a full profile yet, we cannot update these fields here. They must be synced first.
        if (!driver) {
            return res.status(400).json({
                success: false,
                message: 'Your driver profile is not fully initialized. Please contact your Transport Manager.'
            });
        }

        // Update allowed fields
        if (nic) driver.nic = nic;
        if (normalizedLicenseNo) driver.licenseNo = normalizedLicenseNo;
        if (licenseExpiry) driver.licenseExpiry = licenseExpiry;
        if (experience !== undefined) driver.experience = experience;
        if (emergencyContact) driver.emergencyContact = emergencyContact;

        await driver.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: driver
        });
    } catch (error) {
        console.error('Update my driver profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating profile'
        });
    }
};

// @desc    Update driver
// @route   PUT /api/drivers/:id
// @access  Private (Manager/Owner)
exports.updateDriver = async (req, res) => {
    try {
        const {
            name, phone, licenseNo, licenseNumber, licenseExpiry, vehicleNo,
            address, status, experience, emergencyContact, assignedRoutes
        } = req.body;

        const normalizedLicenseNo = (licenseNo || licenseNumber || '').trim();

        const driver = await Driver.findById(req.params.id);

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        // Hardening Rule 5: Prevent changing status to non-active if on a trip
        if (
            status &&
            ['Available', 'Inactive', 'On Leave'].includes(status) &&
            driver.currentTrip &&
            driver.currentTrip.routeId &&
            !['Not Started', 'Completed'].includes(driver.currentTrip.status)
        ) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status to ${status}: The driver is currently on an active trip.`
            });
        }

        // Update fields
        if (name) driver.name = name;
        if (phone) driver.phone = phone;
        if (normalizedLicenseNo) driver.licenseNo = normalizedLicenseNo;
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

        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            const fieldName = field === 'email'
                ? 'email address'
                : (field === 'licenseNo' || field === 'licenseNumber' ? 'license number' : field);
            return res.status(400).json({
                success: false,
                message: `A driver with this ${fieldName} already exists. Please use a different ${fieldName}.`
            });
        }

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

        // Hardening Rule 3: Prevent deleting a driver if they are on an active trip
        if (
            driver.currentTrip &&
            driver.currentTrip.routeId &&
            !['Not Started', 'Completed'].includes(driver.currentTrip.status)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete driver: The driver is currently on an active trip.'
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
        // The frontend payload sends { route: {id, name, number}, date, notes, vehicleNo }
        // We handle both format styles to be safe
        const routeId = req.body.route?.id || req.body.routeId;
        const routeName = req.body.route?.name || req.body.routeName;
        const vehicleNo = req.body.vehicleNo;
        const normalizedVehicleNo = typeof vehicleNo === 'string' ? vehicleNo.trim().toUpperCase() : '';

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

        // Hardening Rule 2: Prevent assigning a new route if driver is on an active trip
        if (
            driver.currentTrip &&
            driver.currentTrip.routeId &&
            !['Not Started', 'Completed'].includes(driver.currentTrip.status)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Cannot assign new route: The driver is currently on an active trip.'
            });
        }

        // Validate vehicle availability using Vehicle collection (source of truth)
        const assignedVehicle = normalizedVehicleNo || (driver.vehicleNo ? String(driver.vehicleNo).trim().toUpperCase() : '');
        if (assignedVehicle && assignedVehicle !== 'NOT ASSIGNED') {
            const vehicleDoc = await Vehicle.findOne({ vehicleNumber: assignedVehicle, isActive: true });

            if (!vehicleDoc) {
                // If the caller explicitly chose a vehicle, enforce it exists.
                if (normalizedVehicleNo) {
                    return res.status(400).json({
                        success: false,
                        message: `Vehicle ${assignedVehicle} not found.`
                    });
                }
            } else {
                if (['Maintenance', 'Unavailable'].includes(vehicleDoc.status)) {
                    return res.status(400).json({
                        success: false,
                        message: `Vehicle ${assignedVehicle} is not available (status: ${vehicleDoc.status}).`
                    });
                }

                // If vehicle is not available and belongs to a different driver, block.
                if (vehicleDoc.status !== 'Available' && vehicleDoc.driverId && vehicleDoc.driverId.toString() !== driver._id.toString()) {
                    return res.status(400).json({
                        success: false,
                        message: `Vehicle ${assignedVehicle} is currently in use.`
                    });
                }

                // Mark vehicle as in-use for this assignment
                vehicleDoc.driverId = driver._id;
                vehicleDoc.assignedDriver = driver.name;
                vehicleDoc.status = 'In Use';
                await vehicleDoc.save();
            }
        }

        // Check if route already in history
        const routeExists = driver.assignedRoutes.some(r => r.routeId === routeId);
        if (!routeExists) {
            driver.assignedRoutes.push({
                routeId,
                routeName,
                assignedDate: new Date()
            });
        }

        // Set the active current trip for real-time tracking!
        driver.currentTrip = {
            routeId,
            routeName,
            vehicleNo: assignedVehicle || 'Not Assigned',
            status: 'Not Started',
            startTime: null,
            lastUpdate: new Date(),
            assignedDate: new Date()
        };

        // If a vehicle was assigned and driver didn't have one, make it their default
        if (assignedVehicle && !driver.vehicleNo && assignedVehicle !== 'NOT ASSIGNED') {
            driver.vehicleNo = assignedVehicle;
        }

        // We don't set status to 'On Route' until the driver actually starts it via Dashboard
        await driver.save();

        res.status(200).json({
            success: true,
            message: 'Route and vehicle assigned successfully',
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

// @desc    Update current trip status
// @route   PUT /api/drivers/:id/trip-status
// @access  Private (Driver/Manager)
exports.updateTripStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const driver = await Driver.findById(req.params.id);

        if (!driver) {
            return res.status(404).json({ success: false, message: 'Driver not found' });
        }

        if (!driver.currentTrip || !driver.currentTrip.routeId) {
            return res.status(400).json({ success: false, message: 'No active route assigned to this driver' });
        }

        driver.currentTrip.status = status;
        driver.currentTrip.lastUpdate = new Date();

        const tripVehicleNo = typeof driver.currentTrip.vehicleNo === 'string'
            ? driver.currentTrip.vehicleNo.trim().toUpperCase()
            : '';

        if (status === 'Started') {
            // Set start time only if it's not already started
            if (!driver.currentTrip.startTime) {
                driver.currentTrip.startTime = new Date();
            }
            driver.status = 'On Route';
        } else if (status === 'Completed') {
            driver.status = 'Available';
        }

        // Sync vehicle state with trip progression.
        // - For active (non-completed) trip statuses: mark vehicle In Use for this driver.
        // - For completed trips: release vehicle (handled below).
        if (tripVehicleNo && tripVehicleNo !== 'NOT ASSIGNED') {
            const vehicleDoc = await Vehicle.findOne({ vehicleNumber: tripVehicleNo, isActive: true });
            if (vehicleDoc) {
                const vehicleStatus = String(vehicleDoc.status || '').trim();

                if (status === 'Completed') {
                    if (vehicleDoc.driverId && vehicleDoc.driverId.toString() === driver._id.toString()) {
                        vehicleDoc.status = 'Available';
                        vehicleDoc.driverId = null;
                        vehicleDoc.assignedDriver = null;
                        await vehicleDoc.save();
                    }
                } else {
                    // Don't override Maintenance/Unavailable; still allow trip status updates.
                    if (!['Maintenance', 'Unavailable'].includes(vehicleStatus)) {
                        vehicleDoc.status = 'In Use';
                        vehicleDoc.driverId = driver._id;
                        vehicleDoc.assignedDriver = driver.name;
                        await vehicleDoc.save();
                    }
                }
            }
        }

        // When a trip is completed, automatically resolve any open emergencies for this driver
        if (status === 'Completed') {
            await Emergency.updateMany(
                { 
                    reportedByDriverId: driver._id, 
                    status: { $nin: ['Resolved', 'Cancelled'] } 
                },
                { 
                    $set: { 
                        status: 'Resolved',
                        resolvedAt: new Date()
                    } 
                }
            );
        }

        await driver.save();

        res.status(200).json({
            success: true,
            message: `Trip status updated to ${status}`,
            data: { driver }
        });
    } catch (error) {
        console.error('Update trip status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating trip status',
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

        // Hardening Rule 1: Prevent unassigning an active trip
        if (
            driver.currentTrip &&
            driver.currentTrip.routeId &&
            driver.currentTrip.routeId === req.params.routeId &&
            !['Not Started', 'Completed'].includes(driver.currentTrip.status)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Cannot remove route: The driver has already started this trip.'
            });
        }

        driver.assignedRoutes = driver.assignedRoutes.filter(
            r => r.routeId !== req.params.routeId
        );

        // If the unassigned route was the current (but not started) trip, clear it and release vehicle
        if (driver.currentTrip && driver.currentTrip.routeId === req.params.routeId) {
            const tripVehicleNo = typeof driver.currentTrip.vehicleNo === 'string'
                ? driver.currentTrip.vehicleNo.trim().toUpperCase()
                : '';

            driver.currentTrip = undefined;

            if (tripVehicleNo && tripVehicleNo !== 'NOT ASSIGNED') {
                const vehicleDoc = await Vehicle.findOne({ vehicleNumber: tripVehicleNo, isActive: true });
                if (vehicleDoc && vehicleDoc.driverId && vehicleDoc.driverId.toString() === driver._id.toString()) {
                    vehicleDoc.status = 'Available';
                    vehicleDoc.driverId = null;
                    vehicleDoc.assignedDriver = null;
                    await vehicleDoc.save();
                }
            }
        }

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
