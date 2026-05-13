const Employee = require('../models/Employee');
const FertilizerCompany = require('../models/FertilizerCompany');
const Announcement = require('../models/Announcement');
const Driver = require('../models/Driver');
const Supplier = require('../models/Supplier');
const Route = require('../models/Route');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const TeaRate = require('../models/TeaRate');
const TeaLeafEntry = require('../models/TeaLeafEntry');
const TeaFlavorQualityCalculation = require('../models/TeaFlavorQualityCalculation');
const DiseaseDetection = require('../models/DiseaseDetection');

const parsePositiveInt = (value, fallback) => {
    const parsed = Number.parseInt(String(value ?? ''), 10);
    if (Number.isNaN(parsed) || parsed <= 0) return fallback;
    return parsed;
};

const getPeriod = (req, defaultDays = 30) => {
    const days = parsePositiveInt(req.query.days, defaultDays);
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - days);
    return { days, from, to };
};

// @desc    Get business overview statistics
// @route   GET /api/reports/overview
// @access  Private (Owner only)
exports.getOverview = async (req, res) => {
    try {
        // Owner dashboard snapshot: focus on operational KPIs from stored data.
        // (No payments/advances/loans reporting here.)

        const period = getPeriod(req, 30);

        const [
            activeEmployees,
            activeManagers,
            activeDrivers,
            activeSuppliers,
            activeRoutes,
            activeVehicles,
            activeCompanies,
            activeAnnouncements,
            leafAgg,
            qualityAgg,
            diseaseAgg
        ] = await Promise.all([
            Employee.countDocuments({ status: 'Active' }),
            User.countDocuments({
                role: { $in: ['factory_manager', 'fertilizer_manager', 'inventory_manager', 'payment_manager', 'transport_manager'] },
                isActive: true
            }),
            Driver.countDocuments({ status: { $in: ['Available', 'On Route'] }, isActive: true }),
            Supplier.countDocuments({ status: 'Active' }),
            Route.countDocuments({ status: 'Active' }),
            Vehicle.countDocuments({ isActive: true, status: { $ne: 'Unavailable' } }),
            FertilizerCompany.countDocuments({ isActive: true }),
            Announcement.countDocuments({ isActive: true }),
            TeaLeafEntry.aggregate([
                { $match: { date: { $gte: period.from, $lte: period.to } } },
                {
                    $group: {
                        _id: null,
                        entries: { $sum: 1 },
                        grossWeightKg: { $sum: '$weight' },
                        netWeightKg: { $sum: '$netWeight' },
                        bagWeightKg: { $sum: '$bagWeight' },
                        waterWeightKg: { $sum: '$waterWeight' },
                        coarseLeafWeightKg: { $sum: '$coarseLeafWeight' },
                        grossAmount: { $sum: '$grossAmount' },
                        netAmount: { $sum: '$netAmount' }
                    }
                }
            ]),
            TeaFlavorQualityCalculation.aggregate([
                { $match: { createdAt: { $gte: period.from, $lte: period.to } } },
                {
                    $group: {
                        _id: null,
                        totalAssessments: { $sum: 1 },
                        avgQualityScore: { $avg: '$qualityScore' },
                        premiumGrades: {
                            $sum: {
                                $cond: [{ $in: ['$grade', ['A+', 'A', 'A-']] }, 1, 0]
                            }
                        }
                    }
                }
            ]),
            DiseaseDetection.aggregate([
                { $match: { createdAt: { $gte: period.from, $lte: period.to } } },
                {
                    $group: {
                        _id: null,
                        totalScans: { $sum: 1 },
                        diseasesFound: {
                            $sum: { $cond: [{ $ne: ['$diseaseType', 'GL'] }, 1, 0] }
                        },
                        healthyLeaves: {
                            $sum: { $cond: [{ $eq: ['$diseaseType', 'GL'] }, 1, 0] }
                        },
                        avgConfidence: { $avg: '$confidence' }
                    }
                }
            ])
        ]);

        const leaf = leafAgg?.[0] || {
            entries: 0,
            grossWeightKg: 0,
            netWeightKg: 0,
            bagWeightKg: 0,
            waterWeightKg: 0,
            coarseLeafWeightKg: 0,
            grossAmount: 0,
            netAmount: 0
        };

        const totalDeductionsKg = (leaf.bagWeightKg || 0) + (leaf.waterWeightKg || 0) + (leaf.coarseLeafWeightKg || 0);
        const avgDeductionPct = leaf.grossWeightKg > 0 ? Number(((totalDeductionsKg / leaf.grossWeightKg) * 100).toFixed(2)) : 0;
        const avgRatePerKg = leaf.grossWeightKg > 0 ? Number((leaf.grossAmount / leaf.grossWeightKg).toFixed(2)) : 0;

        const quality = qualityAgg?.[0] || { totalAssessments: 0, avgQualityScore: 0, premiumGrades: 0 };
        const disease = diseaseAgg?.[0] || { totalScans: 0, diseasesFound: 0, healthyLeaves: 0, avgConfidence: 0 };

        res.status(200).json({
            success: true,
            data: {
                period: {
                    days: period.days,
                    from: period.from,
                    to: period.to
                },
                counts: {
                    activeEmployees,
                    activeManagers,
                    activeDrivers,
                    activeSuppliers,
                    activeRoutes,
                    activeVehicles,
                    activeCompanies,
                    activeAnnouncements
                },
                leafIntake: {
                    entries: leaf.entries,
                    grossWeightKg: leaf.grossWeightKg,
                    netWeightKg: leaf.netWeightKg,
                    deductionsKg: totalDeductionsKg,
                    avgDeductionPct,
                    grossAmount: leaf.grossAmount,
                    netAmount: leaf.netAmount,
                    avgRatePerKg
                },
                ai: {
                    qualityAssessments: quality.totalAssessments,
                    avgQualityScore: quality.avgQualityScore ? Number(quality.avgQualityScore.toFixed(1)) : 0,
                    premiumGrades: quality.premiumGrades,
                    diseaseScans: disease.totalScans,
                    diseasesFound: disease.diseasesFound,
                    healthyLeaves: disease.healthyLeaves,
                    avgDiseaseConfidence: disease.avgConfidence ? Number(disease.avgConfidence.toFixed(1)) : 0
                }
            }
        });
    } catch (error) {
        console.error('Get overview error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching overview',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get production statistics
// @route   GET /api/reports/production
// @access  Private
exports.getProduction = async (req, res) => {
    try {
        // Repurposed for owner reports: Leaf Intake & Deductions
        const period = getPeriod(req, 30);

        const [summaryAgg, byRoute, byQuality, byStatus] = await Promise.all([
            TeaLeafEntry.aggregate([
                { $match: { date: { $gte: period.from, $lte: period.to } } },
                {
                    $group: {
                        _id: null,
                        entries: { $sum: 1 },
                        grossWeightKg: { $sum: '$weight' },
                        netWeightKg: { $sum: '$netWeight' },
                        bagWeightKg: { $sum: '$bagWeight' },
                        waterWeightKg: { $sum: '$waterWeight' },
                        coarseLeafWeightKg: { $sum: '$coarseLeafWeight' },
                        grossAmount: { $sum: '$grossAmount' },
                        netAmount: { $sum: '$netAmount' }
                    }
                }
            ]),
            TeaLeafEntry.aggregate([
                { $match: { date: { $gte: period.from, $lte: period.to } } },
                {
                    $group: {
                        _id: '$routeId',
                        entries: { $sum: 1 },
                        grossWeightKg: { $sum: '$weight' },
                        netWeightKg: { $sum: '$netWeight' },
                        netAmount: { $sum: '$netAmount' }
                    }
                },
                {
                    $lookup: {
                        from: 'routes',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'route'
                    }
                },
                { $unwind: { path: '$route', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        routeId: '$_id',
                        routeNumber: { $ifNull: ['$route.routeNumber', 'N/A'] },
                        routeName: { $ifNull: ['$route.routeName', 'Unknown Route'] },
                        area: { $ifNull: ['$route.area', 'N/A'] },
                        entries: 1,
                        grossWeightKg: 1,
                        netWeightKg: 1,
                        netAmount: 1
                    }
                },
                { $sort: { netWeightKg: -1 } },
                { $limit: 20 }
            ]),
            TeaLeafEntry.aggregate([
                { $match: { date: { $gte: period.from, $lte: period.to } } },
                {
                    $group: {
                        _id: '$quality',
                        entries: { $sum: 1 },
                        grossWeightKg: { $sum: '$weight' },
                        netWeightKg: { $sum: '$netWeight' },
                        netAmount: { $sum: '$netAmount' }
                    }
                },
                { $project: { quality: '$_id', entries: 1, grossWeightKg: 1, netWeightKg: 1, netAmount: 1 } },
                { $sort: { netWeightKg: -1 } }
            ]),
            TeaLeafEntry.aggregate([
                { $match: { date: { $gte: period.from, $lte: period.to } } },
                { $group: { _id: '$status', entries: { $sum: 1 } } },
                { $project: { status: '$_id', entries: 1 } },
                { $sort: { entries: -1 } }
            ])
        ]);

        const summary = summaryAgg?.[0] || {
            entries: 0,
            grossWeightKg: 0,
            netWeightKg: 0,
            bagWeightKg: 0,
            waterWeightKg: 0,
            coarseLeafWeightKg: 0,
            grossAmount: 0,
            netAmount: 0
        };

        const totalDeductionsKg = (summary.bagWeightKg || 0) + (summary.waterWeightKg || 0) + (summary.coarseLeafWeightKg || 0);
        const avgDeductionPct = summary.grossWeightKg > 0 ? Number(((totalDeductionsKg / summary.grossWeightKg) * 100).toFixed(2)) : 0;
        const avgRatePerKg = summary.grossWeightKg > 0 ? Number((summary.grossAmount / summary.grossWeightKg).toFixed(2)) : 0;

        res.status(200).json({
            success: true,
            data: {
                period: {
                    days: period.days,
                    from: period.from,
                    to: period.to
                },
                summary: {
                    ...summary,
                    deductionsKg: totalDeductionsKg,
                    avgDeductionPct,
                    avgRatePerKg
                },
                byRoute,
                byQuality,
                byStatus
            }
        });
    } catch (error) {
        console.error('Get production error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching production data',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get financial statistics (Revenue, Payments, Expenses)
// @route   GET /api/reports/financial
// @access  Private (Owner only)
exports.getFinancial = async (req, res) => {
    try {
        const period = getPeriod(req, 30);

        const Payment = require('../models/Payment');
        const FertilizerTransaction = require('../models/FertilizerInventoryTransaction');
        const TeaRate = require('../models/TeaRate');

        const [
            supplierPaymentsAgg,
            fertilizerExpensesAgg,
            payrollStats,
            leafAgg,
            latestRate
        ] = await Promise.all([
            // Supplier Payments (actually paid or approved)
            Payment.aggregate([
                { $match: { 
                    paymentStatus: { $in: ['Paid', 'Approved'] },
                    updatedAt: { $gte: period.from, $lte: period.to }
                } },
                {
                    $group: {
                        _id: null,
                        totalPaid: { $sum: '$finalAmount' },
                        totalDeductions: { $sum: '$totalDeductions' },
                        count: { $sum: 1 }
                    }
                }
            ]),
            // Fertilizer Purchases
            FertilizerTransaction.aggregate([
                { $match: { 
                    type: 'IN',
                    eventAt: { $gte: period.from, $lte: period.to }
                } },
                {
                    $group: {
                        _id: null,
                        totalCost: { $sum: '$totalPrice' },
                        totalKg: { $sum: '$kg' }
                    }
                }
            ]),
            // Employees Payroll (Estimate based on monthly salaries)
            Employee.aggregate([
                { $match: { status: 'Active' } },
                {
                    $group: {
                        _id: null,
                        totalMonthlyPayroll: { $sum: '$salary' },
                        count: { $sum: 1 }
                    }
                }
            ]),
            // Total Leaf Net Weight for Revenue estimation
            TeaLeafEntry.aggregate([
                { $match: { date: { $gte: period.from, $lte: period.to } } },
                {
                    $group: {
                        _id: null,
                        netWeightKg: { $sum: '$netWeight' },
                        netAmountToSuppliers: { $sum: '$netAmount' }
                    }
                }
            ]),
            // Get latest TeaRate for NSA (Net Sales Average)
            TeaRate.findOne({ status: 'Active' }).sort({ effectiveDate: -1 })
        ]);

        const supplierPayments = supplierPaymentsAgg?.[0] || { totalPaid: 0, totalDeductions: 0, count: 0 };
        const fertilizerExpenses = fertilizerExpensesAgg?.[0] || { totalCost: 0, totalKg: 0 };
        const payroll = payrollStats?.[0] || { totalMonthlyPayroll: 0, count: 0 };
        const leaf = leafAgg?.[0] || { netWeightKg: 0, netAmountToSuppliers: 0 };
        
        // Estimate Revenue: Net Weight * NSA
        const nsa = latestRate?.nsa || 0;
        const estimatedRevenue = leaf.netWeightKg * nsa;

        res.status(200).json({
            success: true,
            data: {
                period: { days: period.days, from: period.from, to: period.to },
                summary: {
                    estimatedRevenue,
                    supplierPayments: supplierPayments.totalPaid,
                    fertilizerCosts: fertilizerExpenses.totalCost,
                    payrollEstimate: payroll.totalMonthlyPayroll, // This is a monthly snapshot
                    netProfitEstimate: estimatedRevenue - supplierPayments.totalPaid - fertilizerExpenses.totalCost - payroll.totalMonthlyPayroll
                },
                breakdown: {
                    leafProductionValue: leaf.netAmountToSuppliers,
                    totalNetWeight: leaf.netWeightKg,
                    nsaApplied: nsa,
                    supplierDeductionsCollected: supplierPayments.totalDeductions
                }
            },
            message: 'Financial summary generated'
        });
    } catch (error) {
        console.error('Get financial error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching financial data',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get quality assessment statistics
// @route   GET /api/reports/quality
// @access  Private
exports.getQuality = async (req, res) => {
    try {
        const period = getPeriod(req, 30);

        const [summaryAgg, byFlavor, gradeDistribution, statusDistribution] = await Promise.all([
            TeaFlavorQualityCalculation.aggregate([
                { $match: { createdAt: { $gte: period.from, $lte: period.to } } },
                {
                    $group: {
                        _id: null,
                        totalAssessments: { $sum: 1 },
                        avgQualityScore: { $avg: '$qualityScore' },
                        avgAdjustedPricePerKg: { $avg: '$pricing.adjustedPricePerKg' },
                        totalBatchValue: { $sum: '$pricing.totalBatchValue' },
                        premiumGrades: {
                            $sum: {
                                $cond: [{ $in: ['$grade', ['A+', 'A', 'A-']] }, 1, 0]
                            }
                        }
                    }
                }
            ]),
            TeaFlavorQualityCalculation.aggregate([
                { $match: { createdAt: { $gte: period.from, $lte: period.to } } },
                {
                    $group: {
                        _id: '$teaFlavor.value',
                        assessments: { $sum: 1 },
                        avgQualityScore: { $avg: '$qualityScore' }
                    }
                },
                {
                    $project: {
                        flavor: '$_id',
                        assessments: 1,
                        avgQualityScore: { $round: ['$avgQualityScore', 1] }
                    }
                },
                { $sort: { assessments: -1 } }
            ]),
            TeaFlavorQualityCalculation.aggregate([
                { $match: { createdAt: { $gte: period.from, $lte: period.to } } },
                { $group: { _id: '$grade', count: { $sum: 1 } } },
                { $project: { grade: '$_id', count: 1 } },
                { $sort: { grade: 1 } }
            ]),
            TeaFlavorQualityCalculation.aggregate([
                { $match: { createdAt: { $gte: period.from, $lte: period.to } } },
                { $group: { _id: '$status', count: { $sum: 1 } } },
                { $project: { status: '$_id', count: 1 } },
                { $sort: { count: -1 } }
            ])
        ]);

        const summary = summaryAgg?.[0] || {
            totalAssessments: 0,
            avgQualityScore: 0,
            avgAdjustedPricePerKg: 0,
            totalBatchValue: 0,
            premiumGrades: 0
        };

        const formatFlavor = (value) => {
            if (!value) return 'Unknown';
            return String(value)
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase());
        };

        res.status(200).json({
            success: true,
            data: {
                period: { days: period.days, from: period.from, to: period.to },
                summary: {
                    ...summary,
                    avgQualityScore: summary.avgQualityScore ? Number(summary.avgQualityScore.toFixed(1)) : 0,
                    avgAdjustedPricePerKg: summary.avgAdjustedPricePerKg ? Number(summary.avgAdjustedPricePerKg.toFixed(2)) : 0
                },
                byFlavor: byFlavor.map((row) => ({
                    ...row,
                    flavorLabel: formatFlavor(row.flavor)
                })),
                gradeDistribution,
                statusDistribution
            },
            message: 'Quality intelligence generated'
        });
    } catch (error) {
        console.error('Get quality error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching quality data',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get disease monitoring statistics
// @route   GET /api/reports/diseases
// @access  Private
exports.getDiseases = async (req, res) => {
    try {
        const period = getPeriod(req, 30);

        const [summaryAgg, byDisease, severityDistribution, statusDistribution] = await Promise.all([
            DiseaseDetection.aggregate([
                { $match: { createdAt: { $gte: period.from, $lte: period.to } } },
                {
                    $group: {
                        _id: null,
                        totalScans: { $sum: 1 },
                        diseasesFound: {
                            $sum: { $cond: [{ $ne: ['$diseaseType', 'GL'] }, 1, 0] }
                        },
                        healthyLeaves: {
                            $sum: { $cond: [{ $eq: ['$diseaseType', 'GL'] }, 1, 0] }
                        },
                        avgConfidence: { $avg: '$confidence' },
                        highSeverity: {
                            $sum: { $cond: [{ $eq: ['$severity', 'High'] }, 1, 0] }
                        }
                    }
                }
            ]),
            DiseaseDetection.aggregate([
                { $match: { createdAt: { $gte: period.from, $lte: period.to } } },
                {
                    $group: {
                        _id: '$diseaseName',
                        cases: { $sum: 1 },
                        avgConfidence: { $avg: '$confidence' },
                        highSeverity: {
                            $sum: { $cond: [{ $eq: ['$severity', 'High'] }, 1, 0] }
                        }
                    }
                },
                {
                    $project: {
                        disease: '$_id',
                        cases: 1,
                        avgConfidence: { $round: ['$avgConfidence', 1] },
                        highSeverity: 1
                    }
                },
                { $sort: { cases: -1 } },
                { $limit: 20 }
            ]),
            DiseaseDetection.aggregate([
                { $match: { createdAt: { $gte: period.from, $lte: period.to } } },
                { $group: { _id: '$severity', count: { $sum: 1 } } },
                { $project: { severity: '$_id', count: 1 } },
                { $sort: { count: -1 } }
            ]),
            DiseaseDetection.aggregate([
                { $match: { createdAt: { $gte: period.from, $lte: period.to } } },
                { $group: { _id: '$status', count: { $sum: 1 } } },
                { $project: { status: '$_id', count: 1 } },
                { $sort: { count: -1 } }
            ])
        ]);

        const summary = summaryAgg?.[0] || {
            totalScans: 0,
            diseasesFound: 0,
            healthyLeaves: 0,
            avgConfidence: 0,
            highSeverity: 0
        };

        res.status(200).json({
            success: true,
            data: {
                period: { days: period.days, from: period.from, to: period.to },
                summary: {
                    ...summary,
                    avgConfidence: summary.avgConfidence ? Number(summary.avgConfidence.toFixed(1)) : 0
                },
                byDisease,
                severityDistribution,
                statusDistribution
            },
            message: 'Disease surveillance generated'
        });
    } catch (error) {
        console.error('Get diseases error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching disease data',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get supplier insights (top suppliers and contribution)
// @route   GET /api/reports/suppliers
// @access  Private (Owner only)
exports.getSupplierInsights = async (req, res) => {
    try {
        const period = getPeriod(req, 30);

        const topSuppliers = await TeaLeafEntry.aggregate([
            { $match: { date: { $gte: period.from, $lte: period.to } } },
            {
                $group: {
                    _id: '$supplierId',
                    entries: { $sum: 1 },
                    grossWeightKg: { $sum: '$weight' },
                    netWeightKg: { $sum: '$netWeight' },
                    netAmount: { $sum: '$netAmount' },
                    avgRatePerKg: { $avg: '$ratePerKg' },
                    qualityA: { $sum: { $cond: [{ $eq: ['$quality', 'A'] }, 1, 0] } },
                    qualityB: { $sum: { $cond: [{ $eq: ['$quality', 'B'] }, 1, 0] } },
                    qualityC: { $sum: { $cond: [{ $eq: ['$quality', 'C'] }, 1, 0] } },
                    qualityPremium: { $sum: { $cond: [{ $eq: ['$quality', 'Premium'] }, 1, 0] } }
                }
            },
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
                $lookup: {
                    from: 'routes',
                    localField: 'supplier.routeId',
                    foreignField: '_id',
                    as: 'route'
                }
            },
            { $unwind: { path: '$route', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    supplierId: '$_id',
                    supplierCode: { $ifNull: ['$supplier.supplierCode', 'N/A'] },
                    supplierName: { $ifNull: ['$supplier.name', 'Unknown Supplier'] },
                    routeNumber: { $ifNull: ['$route.routeNumber', 'N/A'] },
                    routeName: { $ifNull: ['$route.routeName', 'N/A'] },
                    area: { $ifNull: ['$route.area', 'N/A'] },
                    entries: 1,
                    grossWeightKg: 1,
                    netWeightKg: 1,
                    netAmount: 1,
                    avgRatePerKg: { $round: ['$avgRatePerKg', 2] },
                    qualityMix: {
                        A: '$qualityA',
                        B: '$qualityB',
                        C: '$qualityC',
                        Premium: '$qualityPremium'
                    }
                }
            },
            { $sort: { netWeightKg: -1 } },
            { $limit: 25 }
        ]);

        const totalsAgg = await TeaLeafEntry.aggregate([
            { $match: { date: { $gte: period.from, $lte: period.to } } },
            { $group: { _id: null, totalSuppliers: { $addToSet: '$supplierId' }, totalNetWeightKg: { $sum: '$netWeight' }, entries: { $sum: 1 } } },
            { $project: { distinctSuppliers: { $size: '$totalSuppliers' }, totalNetWeightKg: 1, entries: 1 } }
        ]);

        const totals = totalsAgg?.[0] || { distinctSuppliers: 0, totalNetWeightKg: 0, entries: 0 };

        res.status(200).json({
            success: true,
            data: {
                period: { days: period.days, from: period.from, to: period.to },
                summary: totals,
                topSuppliers
            }
        });
    } catch (error) {
        console.error('Get supplier insights error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching supplier insights',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get employee statistics by department
// @route   GET /api/reports/employees
// @access  Private (Owner only)
exports.getEmployeeStats = async (req, res) => {
    try {
        const byDepartment = await Employee.aggregate([
            { $match: { status: 'Active' } },
            {
                $group: {
                    _id: '$department',
                    count: { $sum: 1 },
                    avgSalary: { $avg: '$salary' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const byPosition = await Employee.aggregate([
            { $match: { status: 'Active' } },
            {
                $group: {
                    _id: '$position',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const total = await Employee.countDocuments({ status: 'Active' });
        const onLeave = await Employee.countDocuments({ status: 'On Leave' });
        const inactive = await Employee.countDocuments({ status: 'Inactive' });

        res.status(200).json({
            success: true,
            data: {
                total,
                onLeave,
                inactive,
                byDepartment,
                byPosition
            }
        });
    } catch (error) {
        console.error('Get employee stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching employee statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Export report as PDF/Excel (placeholder)
// @route   POST /api/reports/export
// @access  Private (Owner only)
exports.exportReport = async (req, res) => {
    try {
        const { reportType, format } = req.body;

        // This is a placeholder for export functionality
        // In a real implementation, you would generate PDF/Excel files here

        res.status(200).json({
            success: true,
            message: `Export ${reportType} report as ${format} - Feature coming soon`,
            data: {
                reportType,
                format,
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error('Export report error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error exporting report',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};
