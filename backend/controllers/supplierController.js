const Supplier = require('../models/Supplier');
const User = require('../models/User');

// Get all suppliers for a factory
exports.getAllSuppliers = async (req, res) => {
    try {
        const { factoryId } = req.params;
        const { page = 0, limit = 10, search, status, routeId } = req.query;

        const query = { factoryId };
        
        if (status) query.status = status;
        if (routeId) query.routeId = routeId;
        
        // Search by name or supplier code
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { supplierCode: { $regex: search, $options: 'i' } },
                { contactNumber: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = parseInt(page) * parseInt(limit);

        const suppliers = await Supplier.find(query)
            .populate('routeId', 'routeName routeNumber')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Supplier.countDocuments(query);

        res.status(200).json({
            success: true,
            content: suppliers,
            totalElements: total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching suppliers',
            error: error.message
        });
    }
};

// Get supplier by ID
exports.getSupplierById = async (req, res) => {
    try {
        const { supplierId } = req.params;

        const supplier = await Supplier.findById(supplierId)
            .populate('routeId')
            .populate('userId', 'name email')
            .populate('factoryId', 'name');

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        res.status(200).json({
            success: true,
            data: supplier
        });
    } catch (error) {
        console.error('Error fetching supplier:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching supplier',
            error: error.message
        });
    }
};

// Create a new supplier
exports.createSupplier = async (req, res) => {
    try {
        const supplierData = req.body;

        // Check if supplier code already exists
        const existingSupplier = await Supplier.findOne({ supplierCode: supplierData.supplierCode });
        if (existingSupplier) {
            return res.status(400).json({
                success: false,
                message: 'Supplier code already exists'
            });
        }

        // Create user account for supplier
        const user = new User({
            name: supplierData.name,
            email: supplierData.email,
            password: supplierData.password || 'supplier123', // Default password
            role: 'supplier',
            factoryId: supplierData.factoryId
        });
        await user.save();

        supplierData.userId = user._id;

        const supplier = new Supplier(supplierData);
        await supplier.save();

        res.status(201).json({
            success: true,
            message: 'Supplier created successfully',
            data: supplier
        });
    } catch (error) {
        console.error('Error creating supplier:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating supplier',
            error: error.message
        });
    }
};

// Update supplier
exports.updateSupplier = async (req, res) => {
    try {
        const { supplierId } = req.params;
        const updateData = req.body;

        // If supplier code is being updated, check for duplicates
        if (updateData.supplierCode) {
            const existingSupplier = await Supplier.findOne({
                supplierCode: updateData.supplierCode,
                _id: { $ne: supplierId }
            });
            if (existingSupplier) {
                return res.status(400).json({
                    success: false,
                    message: 'Supplier code already exists'
                });
            }
        }

        const supplier = await Supplier.findByIdAndUpdate(
            supplierId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Supplier updated successfully',
            data: supplier
        });
    } catch (error) {
        console.error('Error updating supplier:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating supplier',
            error: error.message
        });
    }
};

// Delete supplier
exports.deleteSupplier = async (req, res) => {
    try {
        const { supplierId } = req.params;

        const supplier = await Supplier.findById(supplierId);
        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        // Instead of deleting, mark as inactive
        supplier.status = 'Inactive';
        await supplier.save();

        res.status(200).json({
            success: true,
            message: 'Supplier deactivated successfully'
        });
    } catch (error) {
        console.error('Error deleting supplier:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting supplier',
            error: error.message
        });
    }
};

// Get suppliers by route
exports.getSuppliersByRoute = async (req, res) => {
    try {
        const { routeId } = req.params;

        const suppliers = await Supplier.find({ routeId, status: 'Active' })
            .populate('userId', 'name email')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            data: suppliers
        });
    } catch (error) {
        console.error('Error fetching suppliers by route:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching suppliers by route',
            error: error.message
        });
    }
};

// Get supplier statistics
exports.getSupplierStatistics = async (req, res) => {
    try {
        const { supplierId } = req.params;
        const { startDate, endDate } = req.query;

        const TeaLeafEntry = require('../models/TeaLeafEntry');
        const Payment = require('../models/Payment');
        const Advance = require('../models/Advance');

        const dateFilter = startDate && endDate ? {
            date: { $gte: new Date(startDate), $lte: new Date(endDate) }
        } : {};

        // Get tea leaf entry statistics
        const teaLeafStats = await TeaLeafEntry.aggregate([
            { $match: { supplierId: require('mongoose').Types.ObjectId(supplierId), ...dateFilter } },
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
            { $match: { supplierId: require('mongoose').Types.ObjectId(supplierId), paymentStatus: 'Paid' } },
            {
                $group: {
                    _id: null,
                    totalPaid: { $sum: '$finalAmount' },
                    paymentCount: { $sum: 1 }
                }
            }
        ]);

        // Get advance statistics
        const advanceStats = await Advance.aggregate([
            { $match: { supplierId: require('mongoose').Types.ObjectId(supplierId), status: 'APPROVED' } },
            {
                $group: {
                    _id: null,
                    totalAdvances: { $sum: '$approvedAmount' },
                    advanceCount: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                teaLeaf: teaLeafStats[0] || { totalWeight: 0, totalNetWeight: 0, totalAmount: 0, entryCount: 0 },
                payments: paymentStats[0] || { totalPaid: 0, paymentCount: 0 },
                advances: advanceStats[0] || { totalAdvances: 0, advanceCount: 0 }
            }
        });
    } catch (error) {
        console.error('Error fetching supplier statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching supplier statistics',
            error: error.message
        });
    }
};
