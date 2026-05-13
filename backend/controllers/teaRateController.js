const TeaRate = require('../models/TeaRate');

// Get active tea rate for a factory
exports.getActiveTeaRate = async (req, res) => {
    try {
        const teaRate = await TeaRate.findOne({
            status: 'Active'
        })
            .populate('createdBy', 'name email')
            .sort({ effectiveDate: -1 });

        if (!teaRate) {
            return res.status(404).json({
                success: false,
                message: 'No active tea rate found'
            });
        }

        res.status(200).json({
            success: true,
            data: teaRate
        });
    } catch (error) {
        console.error('Error fetching active tea rate:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching active tea rate',
            error: error.message
        });
    }
};

// Get all tea rates for a factory with pagination
exports.getAllTeaRates = async (req, res) => {
    try {
        const { page = 0, limit = 10, status } = req.query;

        const query = {};
        if (status) query.status = status;

        const skip = parseInt(page) * parseInt(limit);

        const teaRates = await TeaRate.find(query)
            .populate('createdBy', 'name email')
            .sort({ effectiveDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await TeaRate.countDocuments(query);

        res.status(200).json({
            success: true,
            content: teaRates,
            totalElements: total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Error fetching tea rates:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tea rates',
            error: error.message
        });
    }
};

// Get tea rate by ID
exports.getTeaRateById = async (req, res) => {
    try {
        const { teaRateId } = req.params;

        const teaRate = await TeaRate.findById(teaRateId)
            .populate('createdBy', 'name email')
            .populate('factoryId', 'name');

        if (!teaRate) {
            return res.status(404).json({
                success: false,
                message: 'Tea rate not found'
            });
        }

        res.status(200).json({
            success: true,
            data: teaRate
        });
    } catch (error) {
        console.error('Error fetching tea rate:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tea rate',
            error: error.message
        });
    }
};

// Create a new tea rate
exports.createTeaRate = async (req, res) => {
    try {
        const teaRateData = req.body;

        // When creating a new active rate, deactivate all previous active rates
        if (teaRateData.status === 'Active') {
            await TeaRate.updateMany(
                { factoryId: teaRateData.factoryId, status: 'Active' },
                { status: 'Inactive' }
            );
        }

        const teaRate = new TeaRate(teaRateData);
        await teaRate.save();

        res.status(201).json({
            success: true,
            message: 'Tea rate created successfully',
            data: teaRate
        });
    } catch (error) {
        console.error('Error creating tea rate:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating tea rate',
            error: error.message
        });
    }
};

// Update tea rate
exports.updateTeaRate = async (req, res) => {
    try {
        const { teaRateId } = req.params;
        const updateData = req.body;

        // If setting this rate to active, deactivate all other active rates
        if (updateData.status === 'Active') {
            const teaRate = await TeaRate.findById(teaRateId);
            if (teaRate) {
                await TeaRate.updateMany(
                    {
                        factoryId: teaRate.factoryId,
                        status: 'Active',
                        _id: { $ne: teaRateId }
                    },
                    { status: 'Inactive' }
                );
            }
        }

        const teaRate = await TeaRate.findByIdAndUpdate(
            teaRateId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!teaRate) {
            return res.status(404).json({
                success: false,
                message: 'Tea rate not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Tea rate updated successfully',
            data: teaRate
        });
    } catch (error) {
        console.error('Error updating tea rate:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating tea rate',
            error: error.message
        });
    }
};

// Delete tea rate
exports.deleteTeaRate = async (req, res) => {
    try {
        const { teaRateId } = req.params;

        const teaRate = await TeaRate.findById(teaRateId);
        if (!teaRate) {
            return res.status(404).json({
                success: false,
                message: 'Tea rate not found'
            });
        }

        // Don't allow deletion of active tea rate
        if (teaRate.status === 'Active') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete active tea rate. Please deactivate it first.'
            });
        }

        await teaRate.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Tea rate deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting tea rate:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting tea rate',
            error: error.message
        });
    }
};

// Activate tea rate (make it the active one)
exports.activateTeaRate = async (req, res) => {
    try {
        const { teaRateId } = req.params;

        const teaRate = await TeaRate.findById(teaRateId);
        if (!teaRate) {
            return res.status(404).json({
                success: false,
                message: 'Tea rate not found'
            });
        }

        // Deactivate all other rates for this factory
        await TeaRate.updateMany(
            { factoryId: teaRate.factoryId, status: 'Active' },
            { status: 'Inactive' }
        );

        // Activate this rate
        teaRate.status = 'Active';
        await teaRate.save();

        res.status(200).json({
            success: true,
            message: 'Tea rate activated successfully',
            data: teaRate
        });
    } catch (error) {
        console.error('Error activating tea rate:', error);
        res.status(500).json({
            success: false,
            message: 'Error activating tea rate',
            error: error.message
        });
    }
};

// Get tea rate for a specific date
exports.getTeaRateForDate = async (req, res) => {
    try {
        // Find the most recent rate that was effective on or before the specified date
        const teaRate = await TeaRate.findOne({
            effectiveDate: { $lte: new Date(date) },
            status: 'Active'
        })
            .sort({ effectiveDate: -1 })
            .limit(1);

        if (!teaRate) {
            return res.status(404).json({
                success: false,
                message: 'No tea rate found for the specified date'
            });
        }

        res.status(200).json({
            success: true,
            data: teaRate
        });
    } catch (error) {
        console.error('Error fetching tea rate for date:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tea rate for date',
            error: error.message
        });
    }
};
