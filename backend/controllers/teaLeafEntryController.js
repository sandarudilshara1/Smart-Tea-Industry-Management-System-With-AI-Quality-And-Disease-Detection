const TeaLeafEntry = require('../models/TeaLeafEntry');
const Supplier = require('../models/Supplier');
const TeaRate = require('../models/TeaRate');

// Get all tea leaf entries for a factory
exports.getAllTeaLeafEntries = async (req, res) => {
    try {
        const { page = 0, limit = 10, startDate, endDate, supplierId, routeId, status } = req.query;

        const query = {};
        
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        if (supplierId) query.supplierId = supplierId;
        if (routeId) query.routeId = routeId;
        if (status) query.status = status;

        const skip = parseInt(page) * parseInt(limit);

        const entries = await TeaLeafEntry.find(query)
            .populate('supplierId', 'supplierCode name')
            .populate('routeId', 'routeName routeNumber')
            .populate('recordedBy', 'name email')
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await TeaLeafEntry.countDocuments(query);

        res.status(200).json({
            success: true,
            content: entries,
            totalElements: total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Error fetching tea leaf entries:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tea leaf entries',
            error: error.message
        });
    }
};

// Get tea leaf entry by ID
exports.getTeaLeafEntryById = async (req, res) => {
    try {
        const { entryId } = req.params;

        const entry = await TeaLeafEntry.findById(entryId)
            .populate('supplierId')
            .populate('routeId')
            .populate('recordedBy', 'name email')
            .populate('factoryId', 'name');

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Tea leaf entry not found'
            });
        }

        res.status(200).json({
            success: true,
            data: entry
        });
    } catch (error) {
        console.error('Error fetching tea leaf entry:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tea leaf entry',
            error: error.message
        });
    }
};

// Create a new tea leaf entry
exports.createTeaLeafEntry = async (req, res) => {
    try {
        const entryData = req.body;

        // Get active tea rate
        const teaRate = await TeaRate.findOne({
            factoryId: entryData.factoryId,
            status: 'Active'
        });

        if (!teaRate) {
            return res.status(404).json({
                success: false,
                message: 'No active tea rate found'
            });
        }

        // Calculate deductions
        const bagWeight = (entryData.weight * teaRate.bagWeightPercentage) / 100;
        const waterWeight = (entryData.weight * teaRate.waterWeightPercentage) / 100;
        const coarseLeafWeight = (entryData.weight * teaRate.coarseLeafPercentage) / 100;
        const netWeight = entryData.weight - bagWeight - waterWeight - coarseLeafWeight;

        // Get rate based on quality
        let ratePerKg = teaRate.defaultRate;
        if (entryData.quality && teaRate.rates && teaRate.rates.length > 0) {
            const rateInfo = teaRate.rates.find(r => r.quality === entryData.quality);
            if (rateInfo) {
                ratePerKg = rateInfo.ratePerKg;
            }
        }

        const netAmount = netWeight * ratePerKg;

        const entry = new TeaLeafEntry({
            ...entryData,
            bagWeight,
            waterWeight,
            coarseLeafWeight,
            netWeight,
            ratePerKg,
            grossAmount: entryData.weight * ratePerKg,
            netAmount
        });

        await entry.save();

        // Update supplier's total supplied
        await Supplier.findByIdAndUpdate(
            entryData.supplierId,
            { $inc: { totalSupplied: netWeight } }
        );

        res.status(201).json({
            success: true,
            message: 'Tea leaf entry created successfully',
            data: entry
        });
    } catch (error) {
        console.error('Error creating tea leaf entry:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating tea leaf entry',
            error: error.message
        });
    }
};

// Update tea leaf entry
exports.updateTeaLeafEntry = async (req, res) => {
    try {
        const { entryId } = req.params;
        const updateData = req.body;

        const entry = await TeaLeafEntry.findById(entryId);
        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Tea leaf entry not found'
            });
        }

        // Don't allow updates if entry is already processed or paid
        if (entry.status === 'Processed' || entry.status === 'Paid') {
            return res.status(400).json({
                success: false,
                message: `Cannot update entry with status: ${entry.status}`
            });
        }

        // If weight or quality changed, recalculate
        if (updateData.weight || updateData.quality) {
            const weight = updateData.weight || entry.weight;
            const quality = updateData.quality || entry.quality;

            const teaRate = await TeaRate.findOne({
                factoryId: entry.factoryId,
                status: 'Active'
            });

            if (teaRate) {
                const bagWeight = (weight * teaRate.bagWeightPercentage) / 100;
                const waterWeight = (weight * teaRate.waterWeightPercentage) / 100;
                const coarseLeafWeight = (weight * teaRate.coarseLeafPercentage) / 100;
                const netWeight = weight - bagWeight - waterWeight - coarseLeafWeight;

                let ratePerKg = teaRate.defaultRate;
                if (quality && teaRate.rates && teaRate.rates.length > 0) {
                    const rateInfo = teaRate.rates.find(r => r.quality === quality);
                    if (rateInfo) {
                        ratePerKg = rateInfo.ratePerKg;
                    }
                }

                updateData.bagWeight = bagWeight;
                updateData.waterWeight = waterWeight;
                updateData.coarseLeafWeight = coarseLeafWeight;
                updateData.netWeight = netWeight;
                updateData.ratePerKg = ratePerKg;
                updateData.grossAmount = weight * ratePerKg;
                updateData.netAmount = netWeight * ratePerKg;
            }
        }

        const updatedEntry = await TeaLeafEntry.findByIdAndUpdate(
            entryId,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Tea leaf entry updated successfully',
            data: updatedEntry
        });
    } catch (error) {
        console.error('Error updating tea leaf entry:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating tea leaf entry',
            error: error.message
        });
    }
};

// Delete tea leaf entry
exports.deleteTeaLeafEntry = async (req, res) => {
    try {
        const { entryId } = req.params;

        const entry = await TeaLeafEntry.findById(entryId);
        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Tea leaf entry not found'
            });
        }

        // Don't allow deletion if entry is processed or paid
        if (entry.status === 'Processed' || entry.status === 'Paid') {
            return res.status(400).json({
                success: false,
                message: `Cannot delete entry with status: ${entry.status}`
            });
        }

        await entry.deleteOne();

        // Update supplier's total supplied
        await Supplier.findByIdAndUpdate(
            entry.supplierId,
            { $inc: { totalSupplied: -entry.netWeight } }
        );

        res.status(200).json({
            success: true,
            message: 'Tea leaf entry deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting tea leaf entry:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting tea leaf entry',
            error: error.message
        });
    }
};

// Get tea leaf entries by supplier
exports.getTeaLeafEntriesBySupplier = async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const { supplierId } = req.params;
        const { page = 0, limit = 10, startDate, endDate, status } = req.query;

        let supplierObjectId = null;
        try { supplierObjectId = new mongoose.Types.ObjectId(supplierId); } catch (_) {}

        const idMatch = supplierObjectId
            ? { $or: [{ supplierId: supplierObjectId }, { supplierId: supplierId }] }
            : { supplierId: supplierId };

        const query = { ...idMatch };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (status) query.status = status;

        const skip = parseInt(page) * parseInt(limit);

        const entries = await TeaLeafEntry.find(query)
            .populate('routeId', 'routeName routeNumber')
            .populate('recordedBy', 'name email')
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await TeaLeafEntry.countDocuments(query);

        res.status(200).json({
            success: true,
            content: entries,
            totalElements: total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Error fetching tea leaf entries by supplier:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tea leaf entries by supplier',
            error: error.message
        });
    }
};

// Get tea leaf entries by route
exports.getTeaLeafEntriesByRoute = async (req, res) => {
    try {
        const { routeId } = req.params;
        const { page = 0, limit = 10, startDate, endDate, status } = req.query;

        const query = { routeId };
        
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        if (status) query.status = status;

        const skip = parseInt(page) * parseInt(limit);

        const entries = await TeaLeafEntry.find(query)
            .populate('supplierId', 'supplierCode name')
            .populate('recordedBy', 'name email')
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await TeaLeafEntry.countDocuments(query);

        res.status(200).json({
            success: true,
            content: entries,
            totalElements: total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Error fetching tea leaf entries by route:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tea leaf entries by route',
            error: error.message
        });
    }
};

// Verify tea leaf entry
exports.verifyTeaLeafEntry = async (req, res) => {
    try {
        const { entryId } = req.params;

        const entry = await TeaLeafEntry.findById(entryId);
        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Tea leaf entry not found'
            });
        }

        if (entry.status !== 'Recorded') {
            return res.status(400).json({
                success: false,
                message: 'Only recorded entries can be verified'
            });
        }

        entry.status = 'Verified';
        await entry.save();

        res.status(200).json({
            success: true,
            message: 'Tea leaf entry verified successfully',
            data: entry
        });
    } catch (error) {
        console.error('Error verifying tea leaf entry:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying tea leaf entry',
            error: error.message
        });
    }
};

// Bulk create tea leaf entries
exports.bulkCreateTeaLeafEntries = async (req, res) => {
    try {
        const { entries } = req.body;

        if (!entries || !Array.isArray(entries) || entries.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Entries array is required'
            });
        }

        // Get active tea rate
        const teaRate = await TeaRate.findOne({
            factoryId: entries[0].factoryId,
            status: 'Active'
        });

        if (!teaRate) {
            return res.status(404).json({
                success: false,
                message: 'No active tea rate found'
            });
        }

        // Process each entry
        const processedEntries = entries.map(entryData => {
            const bagWeight = (entryData.weight * teaRate.bagWeightPercentage) / 100;
            const waterWeight = (entryData.weight * teaRate.waterWeightPercentage) / 100;
            const coarseLeafWeight = (entryData.weight * teaRate.coarseLeafPercentage) / 100;
            const netWeight = entryData.weight - bagWeight - waterWeight - coarseLeafWeight;

            let ratePerKg = teaRate.defaultRate;
            if (entryData.quality && teaRate.rates && teaRate.rates.length > 0) {
                const rateInfo = teaRate.rates.find(r => r.quality === entryData.quality);
                if (rateInfo) {
                    ratePerKg = rateInfo.ratePerKg;
                }
            }

            const netAmount = netWeight * ratePerKg;

            return {
                ...entryData,
                bagWeight,
                waterWeight,
                coarseLeafWeight,
                netWeight,
                ratePerKg,
                grossAmount: entryData.weight * ratePerKg,
                netAmount
            };
        });

        const createdEntries = await TeaLeafEntry.insertMany(processedEntries);

        res.status(201).json({
            success: true,
            message: `Successfully created ${createdEntries.length} tea leaf entries`,
            data: createdEntries
        });
    } catch (error) {
        console.error('Error bulk creating tea leaf entries:', error);
        res.status(500).json({
            success: false,
            message: 'Error bulk creating tea leaf entries',
            error: error.message
        });
    }
};

// Get monthly supply summary — global aggregation (all entries, same for every owner)
exports.getMonthlySummary = async (req, res) => {
    try {
        const year = parseInt(req.query.year) || new Date().getFullYear();

        const start = new Date(`${year}-01-01T00:00:00.000Z`);
        const end = new Date(`${year}-12-31T23:59:59.999Z`);

        const monthly = await TeaLeafEntry.aggregate([
            {
                $match: {
                    date: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: { $month: '$date' },
                    totalWeight: { $sum: '$netWeight' },
                    entryCount: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Build full 12-month array, fill missing months with 0
        const result = Array.from({ length: 12 }, (_, i) => {
            const found = monthly.find(m => m._id === i + 1);
            return {
                month: i + 1,
                totalWeight: found ? Math.round(found.totalWeight) : 0,
                entryCount: found ? found.entryCount : 0
            };
        });

        res.status(200).json({
            success: true,
            data: result,
            year
        });
    } catch (error) {
        console.error('Error fetching monthly summary:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching monthly summary',
            error: error.message
        });
    }
};

// Get top suppliers by total weight
exports.getTopSuppliersByWeight = async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const limit = parseInt(req.query.limit) || 5;

        const topSuppliers = await TeaLeafEntry.aggregate([
            {
                $group: {
                    _id: '$supplierId',
                    totalWeight: { $sum: '$netWeight' },
                    entryCount: { $sum: 1 }
                }
            },
            { $sort: { totalWeight: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'suppliers',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'supplier'
                }
            },
            { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 0,
                    supplierId: '$_id',
                    name: { $ifNull: ['$supplier.name', 'Unknown Supplier'] },
                    supplierCode: { $ifNull: ['$supplier.supplierCode', ''] },
                    totalWeight: { $round: ['$totalWeight', 2] },
                    entryCount: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: topSuppliers
        });
    } catch (error) {
        console.error('Error fetching top suppliers:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching top suppliers',
            error: error.message
        });
    }
};

