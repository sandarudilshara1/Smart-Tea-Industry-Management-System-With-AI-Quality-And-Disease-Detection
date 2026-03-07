const Advance = require('../models/Advance');
const Supplier = require('../models/Supplier');

// Get advances by status for a factory with pagination and filtering
exports.getAdvancesByStatus = async (req, res) => {
    try {
        const { factoryId } = req.params;
        const { status, page = 0, month, year, search } = req.query;
        const limit = 10;

        const query = { factoryId, status };

        // Date filtering
        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);
            query.requestDate = { $gte: startDate, $lte: endDate };
        } else if (year) {
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31, 23, 59, 59);
            query.requestDate = { $gte: startDate, $lte: endDate };
        }

        const skip = parseInt(page) * limit;

        let advances = await Advance.find(query)
            .populate('supplierId', 'supplierCode name contactNumber')
            .populate('approvedBy', 'name email')
            .sort({ requestDate: -1 })
            .skip(skip)
            .limit(limit);

        // Search filtering (in-memory for populated fields)
        if (search) {
            advances = advances.filter(advance => {
                const supplierName = advance.supplierId?.name?.toLowerCase() || '';
                const supplierCode = advance.supplierId?.supplierCode?.toLowerCase() || '';
                const searchLower = search.toLowerCase();
                return supplierName.includes(searchLower) || supplierCode.includes(searchLower);
            });
        }

        const total = await Advance.countDocuments(query);

        res.status(200).json({
            success: true,
            content: advances,
            totalElements: total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Error fetching advances by status:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching advances',
            error: error.message
        });
    }
};

// Get advance details by ID
exports.getAdvanceDetails = async (req, res) => {
    try {
        const { advanceId } = req.params;

        const advance = await Advance.findById(advanceId)
            .populate('supplierId')
            .populate('approvedBy', 'name email')
            .populate('factoryId', 'name');

        if (!advance) {
            return res.status(404).json({
                success: false,
                message: 'Advance not found'
            });
        }

        res.status(200).json({
            success: true,
            data: advance
        });
    } catch (error) {
        console.error('Error fetching advance details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching advance details',
            error: error.message
        });
    }
};

// Approve an advance request
exports.approveAdvance = async (req, res) => {
    try {
        const { advanceId } = req.params;
        const { approvedAmount, approvedBy, notes } = req.body;

        if (!approvedAmount || !approvedBy) {
            return res.status(400).json({
                success: false,
                message: 'Approved amount and approver are required'
            });
        }

        const advance = await Advance.findById(advanceId);
        if (!advance) {
            return res.status(404).json({
                success: false,
                message: 'Advance not found'
            });
        }

        if (advance.status !== 'REQUESTED') {
            return res.status(400).json({
                success: false,
                message: 'Only requested advances can be approved'
            });
        }

        advance.status = 'APPROVED';
        advance.approvedAmount = approvedAmount;
        advance.amount = approvedAmount;
        advance.approvedBy = approvedBy;
        advance.approvedDate = new Date();
        if (notes) advance.notes = notes;

        await advance.save();

        // Update supplier's outstanding advances
        await Supplier.findByIdAndUpdate(
            advance.supplierId,
            { $inc: { outstandingAdvances: approvedAmount } }
        );

        res.status(200).json({
            success: true,
            message: 'Advance approved successfully',
            data: advance
        });
    } catch (error) {
        console.error('Error approving advance:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving advance',
            error: error.message
        });
    }
};

// Reject an advance request
exports.rejectAdvance = async (req, res) => {
    try {
        const { advanceId } = req.params;
        const { rejectionReason, approvedBy } = req.body;

        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const advance = await Advance.findById(advanceId);
        if (!advance) {
            return res.status(404).json({
                success: false,
                message: 'Advance not found'
            });
        }

        if (advance.status !== 'REQUESTED') {
            return res.status(400).json({
                success: false,
                message: 'Only requested advances can be rejected'
            });
        }

        advance.status = 'REJECTED';
        advance.rejectionReason = rejectionReason;
        advance.approvedBy = approvedBy;
        advance.approvedDate = new Date();

        await advance.save();

        res.status(200).json({
            success: true,
            message: 'Advance rejected successfully',
            data: advance
        });
    } catch (error) {
        console.error('Error rejecting advance:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting advance',
            error: error.message
        });
    }
};

// Get advance status counts for a factory
exports.getAdvanceStatusCounts = async (req, res) => {
    try {
        const { factoryId } = req.params;
        const { month, year, startDate, endDate } = req.query;

        const query = { factoryId };

        // Date filtering
        if (startDate && endDate) {
            query.requestDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if (month && year) {
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 0, 23, 59, 59);
            query.requestDate = { $gte: start, $lte: end };
        }

        const counts = await Advance.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        const statusCounts = {
            REQUESTED: { count: 0, amount: 0 },
            APPROVED: { count: 0, amount: 0 },
            REJECTED: { count: 0, amount: 0 },
            PAID: { count: 0, amount: 0 }
        };

        counts.forEach(item => {
            statusCounts[item._id] = {
                count: item.count,
                amount: item.totalAmount
            };
        });

        res.status(200).json({
            success: true,
            data: statusCounts
        });
    } catch (error) {
        console.error('Error fetching advance status counts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching advance status counts',
            error: error.message
        });
    }
};

// Create a new advance request
exports.createAdvanceRequest = async (req, res) => {
    try {
        const advanceData = req.body;

        const advance = new Advance(advanceData);
        await advance.save();

        res.status(201).json({
            success: true,
            message: 'Advance request created successfully',
            data: advance
        });
    } catch (error) {
        console.error('Error creating advance request:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating advance request',
            error: error.message
        });
    }
};

// Get advances by supplier
exports.getAdvancesBySupplier = async (req, res) => {
    try {
        const { supplierId } = req.params;
        const { page = 0, limit = 10, status } = req.query;

        const query = { supplierId };
        if (status) query.status = status;

        const skip = parseInt(page) * parseInt(limit);

        const advances = await Advance.find(query)
            .populate('approvedBy', 'name email')
            .sort({ requestDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Advance.countDocuments(query);

        res.status(200).json({
            success: true,
            content: advances,
            totalElements: total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Error fetching advances by supplier:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching advances by supplier',
            error: error.message
        });
    }
};
