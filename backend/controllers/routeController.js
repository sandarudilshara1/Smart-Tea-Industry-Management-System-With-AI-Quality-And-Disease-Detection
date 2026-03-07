const Route = require('../models/Route');
const Supplier = require('../models/Supplier');

// Get all routes for a factory
exports.getAllRoutes = async (req, res) => {
    try {
        const { factoryId } = req.params;
        const { page = 0, limit = 10, search, status } = req.query;

        const query = { factoryId };
        
        if (status) query.status = status;
        
        // Search by route name or number
        if (search) {
            query.$or = [
                { routeName: { $regex: search, $options: 'i' } },
                { routeNumber: { $regex: search, $options: 'i' } },
                { area: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = parseInt(page) * parseInt(limit);

        const routes = await Route.find(query)
            .populate('driverId', 'name contactNumber')
            .populate('vehicleId', 'vehicleNumber vehicleType')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Route.countDocuments(query);

        res.status(200).json({
            success: true,
            content: routes,
            totalElements: total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Error fetching routes:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching routes',
            error: error.message
        });
    }
};

// Get route by ID
exports.getRouteById = async (req, res) => {
    try {
        const { routeId } = req.params;

        const route = await Route.findById(routeId)
            .populate('driverId')
            .populate('vehicleId')
            .populate('factoryId', 'name');

        if (!route) {
            return res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        }

        // Get suppliers for this route
        const suppliers = await Supplier.find({ routeId, status: 'Active' });

        res.status(200).json({
            success: true,
            data: {
                ...route.toObject(),
                suppliers
            }
        });
    } catch (error) {
        console.error('Error fetching route:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching route',
            error: error.message
        });
    }
};

// Create a new route
exports.createRoute = async (req, res) => {
    try {
        const routeData = req.body;

        // Check if route number already exists
        const existingRoute = await Route.findOne({ routeNumber: routeData.routeNumber });
        if (existingRoute) {
            return res.status(400).json({
                success: false,
                message: 'Route number already exists'
            });
        }

        const route = new Route(routeData);
        await route.save();

        res.status(201).json({
            success: true,
            message: 'Route created successfully',
            data: route
        });
    } catch (error) {
        console.error('Error creating route:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating route',
            error: error.message
        });
    }
};

// Update route
exports.updateRoute = async (req, res) => {
    try {
        const { routeId } = req.params;
        const updateData = req.body;

        // If route number is being updated, check for duplicates
        if (updateData.routeNumber) {
            const existingRoute = await Route.findOne({
                routeNumber: updateData.routeNumber,
                _id: { $ne: routeId }
            });
            if (existingRoute) {
                return res.status(400).json({
                    success: false,
                    message: 'Route number already exists'
                });
            }
        }

        const route = await Route.findByIdAndUpdate(
            routeId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!route) {
            return res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Route updated successfully',
            data: route
        });
    } catch (error) {
        console.error('Error updating route:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating route',
            error: error.message
        });
    }
};

// Delete route
exports.deleteRoute = async (req, res) => {
    try {
        const { routeId } = req.params;

        // Check if route has active suppliers
        const supplierCount = await Supplier.countDocuments({ routeId, status: 'Active' });
        if (supplierCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete route. It has ${supplierCount} active supplier(s)`
            });
        }

        const route = await Route.findById(routeId);
        if (!route) {
            return res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        }

        // Mark as inactive instead of deleting
        route.status = 'Inactive';
        await route.save();

        res.status(200).json({
            success: true,
            message: 'Route deactivated successfully'
        });
    } catch (error) {
        console.error('Error deleting route:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting route',
            error: error.message
        });
    }
};

// Get route statistics
exports.getRouteStatistics = async (req, res) => {
    try {
        const { routeId } = req.params;
        const { startDate, endDate } = req.query;

        const TeaLeafEntry = require('../models/TeaLeafEntry');
        const Payment = require('../models/Payment');

        const dateFilter = startDate && endDate ? {
            date: { $gte: new Date(startDate), $lte: new Date(endDate) }
        } : {};

        // Get tea leaf collection statistics
        const teaLeafStats = await TeaLeafEntry.aggregate([
            { $match: { routeId: require('mongoose').Types.ObjectId(routeId), ...dateFilter } },
            {
                $group: {
                    _id: null,
                    totalWeight: { $sum: '$weight' },
                    totalNetWeight: { $sum: '$netWeight' },
                    totalAmount: { $sum: '$netAmount' },
                    entryCount: { $sum: 1 }
                }
            }
        ]);

        // Get payment statistics
        const paymentStats = await Payment.aggregate([
            { $match: { routeId: require('mongoose').Types.ObjectId(routeId), paymentStatus: 'Paid' } },
            {
                $group: {
                    _id: null,
                    totalPaid: { $sum: '$finalAmount' },
                    paymentCount: { $sum: 1 }
                }
            }
        ]);

        // Get supplier count
        const supplierCount = await Supplier.countDocuments({ routeId, status: 'Active' });

        res.status(200).json({
            success: true,
            data: {
                supplierCount,
                teaLeaf: teaLeafStats[0] || { totalWeight: 0, totalNetWeight: 0, totalAmount: 0, entryCount: 0 },
                payments: paymentStats[0] || { totalPaid: 0, paymentCount: 0 }
            }
        });
    } catch (error) {
        console.error('Error fetching route statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching route statistics',
            error: error.message
        });
    }
};

// Update supplier count for a route
exports.updateRouteSupplierCount = async (req, res) => {
    try {
        const { routeId } = req.params;

        const count = await Supplier.countDocuments({ routeId, status: 'Active' });

        await Route.findByIdAndUpdate(routeId, { supplierCount: count });

        res.status(200).json({
            success: true,
            message: 'Supplier count updated successfully',
            data: { supplierCount: count }
        });
    } catch (error) {
        console.error('Error updating supplier count:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating supplier count',
            error: error.message
        });
    }
};
