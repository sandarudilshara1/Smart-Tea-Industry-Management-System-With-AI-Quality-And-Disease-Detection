const Employee = require('../models/Employee');
const FertilizerCompany = require('../models/FertilizerCompany');
const Announcement = require('../models/Announcement');
const Driver = require('../models/Driver');
const User = require('../models/User');

// @desc    Get business overview statistics
// @route   GET /api/reports/overview
// @access  Private (Owner only)
exports.getOverview = async (req, res) => {
    try {
        // Get various counts and statistics
        const totalEmployees = await Employee.countDocuments({ status: 'Active' });
        const totalManagers = await User.countDocuments({ 
            role: { $in: ['factory_manager', 'fertilizer_manager', 'inventory_manager', 'payment_manager', 'transport_manager'] },
            isActive: true
        });
        const totalDrivers = await Driver.countDocuments({ status: 'Active' });
        const totalCompanies = await FertilizerCompany.countDocuments({ isActive: true });
        const totalAnnouncements = await Announcement.countDocuments({ isActive: true });

        // Note: Financial data (revenue, expenses, profit) requires Payment/Transaction models
        const overview = {
            totalRevenue: 0,
            totalExpenses: 0,
            netProfit: 0,
            totalEmployees: totalEmployees + totalManagers + totalDrivers,
            totalManagers,
            activeFactories: 9,
            totalCompanies,
            totalAnnouncements,
            totalDrivers
        };

        res.status(200).json({
            success: true,
            data: overview
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
        // Note: Production data requires a Production/Inventory model with historical data
        // Returning empty array until production tracking is implemented
        const productionData = [];

        res.status(200).json({
            success: true,
            data: productionData,
            message: 'Production tracking not yet implemented'
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

// @desc    Get financial statistics
// @route   GET /api/reports/financial
// @access  Private (Owner only)
exports.getFinancial = async (req, res) => {
    try {
        // Note: Financial data requires Payment/Transaction models with monthly aggregation
        // Returning empty array until financial tracking is implemented
        const financialData = [];

        res.status(200).json({
            success: true,
            data: financialData,
            message: 'Financial tracking not yet implemented'
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
        // Note: Quality data requires a Quality/Assessment model
        // Returning empty array until quality assessment system is implemented
        const qualityData = [];

        res.status(200).json({
            success: true,
            data: qualityData,
            message: 'Quality assessment system not yet implemented'
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
        // Note: Disease data requires a Disease/Monitoring model
        // Returning empty array until disease monitoring system is implemented
        const diseaseData = [];

        res.status(200).json({
            success: true,
            data: diseaseData,
            message: 'Disease monitoring system not yet implemented'
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
