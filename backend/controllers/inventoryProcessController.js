const mongoose = require('mongoose');

const Route = require('../models/Route');
const TeaLeafEntry = require('../models/TeaLeafEntry');
const LeafSupplyRequest = require('../models/LeafSupplyRequest');
const Supplier = require('../models/Supplier');
const FertilizerInventoryTransaction = require('../models/FertilizerInventoryTransaction');
const User = require('../models/User');

function isValidObjectId(value) {
    return typeof value === 'string' && mongoose.Types.ObjectId.isValid(value);
}

function getLocalDayRange(date = new Date()) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return { start, end };
}

// GET /api/inventory-process/dashboard-summary
// Provides Inventory Manager dashboard metrics derived from existing Route + TeaLeafEntry data.
exports.getDashboardSummary = async (req, res) => {
    try {
        const { factoryId } = req.query;

        const routeQuery = { status: 'Active' };
        const entryQuery = {};

        if (isValidObjectId(factoryId)) {
            routeQuery.factoryId = factoryId;
            entryQuery.factoryId = factoryId;
        }

        const { start, end } = getLocalDayRange(new Date());
        entryQuery.date = { $gte: start, $lt: end };

        const activeRoutes = await Route.find(routeQuery).select('supplierCount').lean();
        const totalActiveRoutes = activeRoutes.length;
        const todaySuppliers = activeRoutes.reduce((sum, r) => sum + (Number(r.supplierCount) || 0), 0);

        // 1. Calculate Today's Aggregates
        const todayAgg = await TeaLeafEntry.aggregate([
            { $match: entryQuery },
            {
                $group: {
                    _id: null,
                    totalBags: { $sum: 1 },
                    totalGrossWeight: { $sum: '$weight' },
                    suppliers: { $addToSet: '$supplierId' },
                    routes: { $addToSet: '$routeId' },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalBags: 1,
                    totalGrossWeight: 1,
                    completedSuppliers: { $size: '$suppliers' },
                    completedRoutes: { $size: '$routes' },
                },
            },
        ]);

        const today = todayAgg[0] || {
            totalBags: 0,
            totalGrossWeight: 0,
            completedSuppliers: 0,
            completedRoutes: 0,
        };

        // 2. Supply Metrics
        const [pendingLeafRequests, totalActiveSuppliers] = await Promise.all([
            LeafSupplyRequest.countDocuments({ status: { $in: ['PENDING', 'CONFIRMED'] } }),
            Supplier.countDocuments({ status: 'Active' })
        ]);

        // 3. Fertilizer Summary
        const fertilizerSummary = await FertilizerInventoryTransaction.aggregate([
            {
                $group: {
                    _id: '$categoryName',
                    inKg: { $sum: { $cond: [{ $eq: ['$type', 'IN'] }, '$kg', 0] } },
                    outKg: { $sum: { $cond: [{ $eq: ['$type', 'OUT'] }, '$kg', 0] } },
                },
            },
            {
                $project: {
                    _id: 0,
                    categoryName: '$_id',
                    availableKg: { $subtract: ['$inKg', '$outKg'] },
                },
            },
        ]);

        const lowStockCategories = fertilizerSummary.filter(f => f.availableKg < 100);
        const totalFertilizerAvailable = fertilizerSummary.reduce((sum, r) => sum + (r.availableKg || 0), 0);

        return res.status(200).json({
            success: true,
            ...today,
            totalActiveRoutes,
            todaySuppliers,
            totalActiveSuppliers,
            pendingLeafRequests,
            fertilizer: {
                totalAvailable: totalFertilizerAvailable,
                lowStockCount: lowStockCategories.length,
                topCategories: fertilizerSummary
                    .sort((a, b) => b.availableKg - a.availableKg)
                    .slice(0, 3),
            },
        });
    } catch (error) {
        console.error('Error building inventory dashboard summary:', error);
        return res.status(500).json({
            success: false,
            message: 'Error building inventory dashboard summary',
            error: error.message,
        });
    }
};

// GET /api/inventory-process/factories/trips/today?page=0&size=10&search=
// Maps "trips" to per-route activity for the current day.
exports.getTodayTrips = async (req, res) => {
    try {
        const { page = 0, size = 10, search = '', factoryId } = req.query;

        const routeQuery = { status: 'Active' };
        const entryMatch = {};

        if (isValidObjectId(factoryId)) {
            routeQuery.factoryId = factoryId;
            entryMatch.factoryId = factoryId;
        }

        const { start, end } = getLocalDayRange(new Date());
        entryMatch.date = { $gte: start, $lt: end };

        const perRouteAgg = await TeaLeafEntry.aggregate([
            { $match: entryMatch },
            {
                $group: {
                    _id: '$routeId',
                    totalWeight: { $sum: '$weight' },
                    totalBags: { $sum: 1 },
                    suppliers: { $addToSet: '$supplierId' },
                    lastUpdate: { $max: '$updatedAt' },
                },
            },
            {
                $project: {
                    totalWeight: 1,
                    totalBags: 1,
                    completedSuppliers: { $size: '$suppliers' },
                    lastUpdate: 1,
                },
            },
        ]);

        const routeStatsById = new Map(
            perRouteAgg.map((r) => [String(r._id), r])
        );

        const routes = await Route.find(routeQuery)
            .populate('driverId', 'name')
            .select('routeNumber routeName supplierCount driverId')
            .lean();

        const normalizedSearch = String(search || '').trim().toLowerCase();

        const allTrips = routes
            .map((route) => {
                const stats = routeStatsById.get(String(route._id)) || {
                    totalWeight: 0,
                    totalBags: 0,
                    completedSuppliers: 0,
                    lastUpdate: null,
                };

                const totalSuppliers = Number(route.supplierCount) || 0;
                const completedSuppliers = Number(stats.completedSuppliers) || 0;

                let tripStatus = 'pending';
                if (stats.totalBags > 0 || stats.totalWeight > 0 || completedSuppliers > 0) {
                    tripStatus = 'active';
                }
                if (totalSuppliers > 0 && completedSuppliers >= totalSuppliers) {
                    tripStatus = 'completed';
                }

                const lastUpdateStr = stats.lastUpdate
                    ? new Date(stats.lastUpdate).toTimeString().slice(0, 5)
                    : null;

                return {
                    tripId: String(route._id),
                    routeName: route.routeName,
                    routeCode: route.routeNumber,
                    driverName: route.driverId?.name || '-',
                    tripStatus,
                    totalSuppliers,
                    completedSuppliers,
                    totalBags: Number(stats.totalBags) || 0,
                    totalWeight: Number(stats.totalWeight) || 0,
                    lastUpdate: lastUpdateStr,
                };
            })
            .filter((trip) => {
                if (!normalizedSearch) return true;
                return (
                    String(trip.routeName || '').toLowerCase().includes(normalizedSearch) ||
                    String(trip.routeCode || '').toLowerCase().includes(normalizedSearch) ||
                    String(trip.driverName || '').toLowerCase().includes(normalizedSearch)
                );
            });

        const numericPage = Math.max(0, parseInt(page, 10) || 0);
        const numericSize = Math.max(1, parseInt(size, 10) || 10);

        const totalElements = allTrips.length;
        const totalPages = Math.max(1, Math.ceil(totalElements / numericSize));

        const startIndex = numericPage * numericSize;
        const content = allTrips.slice(startIndex, startIndex + numericSize);

        return res.status(200).json({
            success: true,
            content,
            totalElements,
            totalPages,
            currentPage: numericPage,
        });
    } catch (error) {
        console.error('Error building today trips:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching today trips',
            error: error.message,
        });
    }
};

// GET /api/inventory-process/bagweights
// Fetches detailed tea leaf entry history with supplier names and deductions
exports.getBagWeights = async (req, res) => {
    try {
        const { factoryId, page = 0, size = 10, routeId, userId, date, search } = req.query;
        console.log('[getBagWeights] Params:', { factoryId, page, size, routeId, userId, date, search });

        const matchQuery = {};
        if (isValidObjectId(factoryId)) {
            matchQuery.factoryId = new mongoose.Types.ObjectId(factoryId);
        }
        if (isValidObjectId(routeId)) {
            matchQuery.routeId = new mongoose.Types.ObjectId(routeId);
        }
        if (isValidObjectId(userId)) {
            matchQuery.recordedBy = new mongoose.Types.ObjectId(userId);
        }

        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setDate(end.getDate() + 1);
            matchQuery.date = { $gte: start, $lt: end };
        }

        console.log('[getBagWeights] matchQuery:', JSON.stringify(matchQuery));

        // Build aggregation pipeline
        const pipeline = [
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'suppliers', // standard pluralization
                    localField: 'supplierId',
                    foreignField: '_id',
                    as: 'supplierInfo'
                }
            },
            { $unwind: '$supplierInfo' }
        ];

        // Apply search filter if present (on supplier name or code)
        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { 'supplierInfo.name': { $regex: search, $options: 'i' } },
                        { 'supplierInfo.supplierCode': { $regex: search, $options: 'i' } }
                    ]
                }
            });
        }

        // Count total matches for pagination (before skip/limit)
        const countPipeline = [...pipeline, { $count: 'total' }];
        const countResult = await TeaLeafEntry.aggregate(countPipeline);
        const totalElements = countResult.length > 0 ? countResult[0].total : 0;
        console.log('[getBagWeights] totalElements:', totalElements);

        const numericPage = parseInt(page, 10) || 0;
        const numericSize = parseInt(size, 10) || 10;
        const totalPages = Math.ceil(totalElements / numericSize) || 1;

        // Final formatting and sorting
        pipeline.push(
            { $sort: { date: -1, createdAt: -1 } },
            { $skip: numericPage * numericSize },
            { $limit: numericSize },
            {
                $project: {
                    bagWeightId: '$_id',
                    supplierId: '$supplierInfo.supplierCode',
                    supplierName: '$supplierInfo.name',
                    grossWeight: '$weight',
                    deduction: { $add: ['$bagWeight', '$waterWeight', '$coarseLeafWeight'] },
                    netWeight: '$netWeight',
                    date: 1,
                    status: 1
                }
            }
        );

        const content = await TeaLeafEntry.aggregate(pipeline);
        console.log(`[getBagWeights] Returning ${content.length} records.`);

        return res.status(200).json({
            success: true,
            content,
            totalElements,
            totalPages,
            page: numericPage,
            size: numericSize
        });
    } catch (error) {
        console.error('[getBagWeights] Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching history data',
            error: error.message
        });
    }
};

// GET /api/inventory-process/inventory-managers
// Fetches all users with the role 'inventory_manager' for a specific factory
exports.getInventoryManagers = async (req, res) => {
    try {
        const { factoryId } = req.query;

        const query = { role: 'inventory_manager' };
        // If factoryId is provided, filter by it. 
        // Note: In User model factoryId is a Number, but we should handle it flexibly.
        if (factoryId) {
            query.factoryId = factoryId;
        }

        const managers = await User.find(query)
            .select('_id firstName lastName')
            .lean();

        const formattedManagers = managers.map(m => ({
            userId: m._id,
            userName: `${m.firstName} ${m.lastName}`
        }));

        return res.status(200).json(formattedManagers);
    } catch (error) {
        console.error('Error fetching inventory managers:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching inventory managers',
            error: error.message
        });
    }
};

// GET /api/inventory-process/fertilizer-history
// Fetches detailed fertilizer transaction history
exports.getFertilizerHistory = async (req, res) => {
    try {
        const { page = 0, size = 10, type, category, date, search } = req.query;
        console.log('[getFertilizerHistory] Params:', { page, size, type, category, date, search });

        const matchQuery = {};
        if (type && (type === 'IN' || type === 'OUT')) {
            matchQuery.type = type;
        }
        if (category) {
            matchQuery.categoryName = category;
        }

        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setDate(end.getDate() + 1);
            matchQuery.eventAt = { $gte: start, $lt: end };
        }

        if (search) {
            matchQuery.$or = [
                { categoryName: { $regex: search, $options: 'i' } },
                { companyName: { $regex: search, $options: 'i' } },
                { note: { $regex: search, $options: 'i' } }
            ];
        }

        console.log('[getFertilizerHistory] matchQuery:', JSON.stringify(matchQuery));

        const totalElements = await FertilizerInventoryTransaction.countDocuments(matchQuery);
        console.log('[getFertilizerHistory] totalElements:', totalElements);

        const numericPage = parseInt(page, 10) || 0;
        const numericSize = parseInt(size, 10) || 10;
        const totalPages = Math.ceil(totalElements / numericSize) || 1;

        const content = await FertilizerInventoryTransaction.find(matchQuery)
            .populate('createdBy', 'firstName lastName')
            .sort({ eventAt: -1 })
            .skip(numericPage * numericSize)
            .limit(numericSize)
            .lean();

        // Format for frontend
        const formattedContent = content.map(item => ({
            transactionId: item._id,
            type: item.type,
            categoryName: item.categoryName,
            companyName: item.companyName || '-',
            kg: item.kg,
            totalPrice: item.totalPrice,
            eventAt: item.eventAt,
            recordedBy: item.createdBy ? `${item.createdBy.firstName} ${item.createdBy.lastName}` : 'System',
            purpose: item.purpose || '-',
            note: item.note || '-'
        }));

        console.log(`[getFertilizerHistory] Returning ${formattedContent.length} records.`);

        return res.status(200).json({
            success: true,
            content: formattedContent,
            totalElements,
            totalPages,
            page: numericPage,
            size: numericSize
        });
    } catch (error) {
        console.error('[getFertilizerHistory] Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching fertilizer history',
            error: error.message
        });
    }
};
