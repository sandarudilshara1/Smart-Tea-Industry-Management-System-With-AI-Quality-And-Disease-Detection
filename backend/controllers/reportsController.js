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

        // Sample financial data (can be replaced with actual data from payment/financial models)
        const overview = {
            totalRevenue: 'Rs. 12,450,000',
            totalExpenses: 'Rs. 8,200,000',
            netProfit: 'Rs. 4,250,000',
            totalEmployees: totalEmployees + totalManagers + totalDrivers,
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
        // Sample production data for all factories
        // This should be replaced with actual production data from a Production model
        const productionData = [
            { factory: 'Wawlugala Tea Factory', production: '12,500 kg', growth: '+11.3%', factoryId: 1 },
            { factory: 'Miyanawathura Tea Factory', production: '10,800 kg', growth: '+9.7%', factoryId: 2 },
            { factory: 'Andaradeniya Tea Factory', production: '14,200 kg', growth: '+13.2%', factoryId: 3 },
            { factory: 'Batuwangala Tea Factory', production: '11,600 kg', growth: '+10.5%', factoryId: 4 },
            { factory: 'Duli Ella Tea Factory', production: '13,400 kg', growth: '+12.1%', factoryId: 5 },
            { factory: 'Devonia Tea Factory', production: '9,800 kg', growth: '+8.4%', factoryId: 6 },
            { factory: 'Fortune Tea Factory', production: '15,100 kg', growth: '+14.8%', factoryId: 7 },
            { factory: 'Galaxi Tea Factory', production: '10,500 kg', growth: '+9.2%', factoryId: 8 },
            { factory: 'Ruhunu Tea Factory', production: '12,900 kg', growth: '+11.7%', factoryId: 9 }
        ];

        res.status(200).json({
            success: true,
            data: productionData
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
        // Sample financial data
        // This should be replaced with actual financial data from payment/transaction models
        const financialData = [
            { month: 'January', revenue: 'Rs. 1,200,000', expenses: 'Rs. 780,000', profit: 'Rs. 420,000' },
            { month: 'February', revenue: 'Rs. 1,150,000', expenses: 'Rs. 760,000', profit: 'Rs. 390,000' },
            { month: 'March', revenue: 'Rs. 1,350,000', expenses: 'Rs. 850,000', profit: 'Rs. 500,000' },
            { month: 'April', revenue: 'Rs. 1,280,000', expenses: 'Rs. 820,000', profit: 'Rs. 460,000' },
            { month: 'May', revenue: 'Rs. 1,420,000', expenses: 'Rs. 890,000', profit: 'Rs. 530,000' },
            { month: 'June', revenue: 'Rs. 1,380,000', expenses: 'Rs. 870,000', profit: 'Rs. 510,000' }
        ];

        res.status(200).json({
            success: true,
            data: financialData
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
        // Sample quality data
        // This should be replaced with actual quality data from a Quality/Assessment model
        const qualityData = [
            { factory: 'Wawlugala Tea Factory', grade: 'A+', score: 92, assessments: 45, factoryId: 1 },
            { factory: 'Miyanawathura Tea Factory', grade: 'A', score: 88, assessments: 38, factoryId: 2 },
            { factory: 'Andaradeniya Tea Factory', grade: 'A', score: 89, assessments: 42, factoryId: 3 },
            { factory: 'Batuwangala Tea Factory', grade: 'B+', score: 82, assessments: 36, factoryId: 4 },
            { factory: 'Duli Ella Tea Factory', grade: 'A+', score: 94, assessments: 50, factoryId: 5 },
            { factory: 'Devonia Tea Factory', grade: 'B', score: 78, assessments: 32, factoryId: 6 },
            { factory: 'Fortune Tea Factory', grade: 'A+', score: 95, assessments: 52, factoryId: 7 },
            { factory: 'Galaxi Tea Factory', grade: 'A', score: 87, assessments: 40, factoryId: 8 },
            { factory: 'Ruhunu Tea Factory', grade: 'A', score: 90, assessments: 44, factoryId: 9 }
        ];

        res.status(200).json({
            success: true,
            data: qualityData
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
        // Sample disease data
        // This should be replaced with actual disease monitoring data
        const diseaseData = [
            { disease: 'Blister Blight', cases: 8, status: 'Active', affectedArea: '12 hectares', severity: 'High' },
            { disease: 'Red Rust', cases: 5, status: 'Monitoring', affectedArea: '8 hectares', severity: 'Medium' },
            { disease: 'Root Rot', cases: 3, status: 'Under Control', affectedArea: '4 hectares', severity: 'Low' },
            { disease: 'Grey Blight', cases: 2, status: 'Monitoring', affectedArea: '3 hectares', severity: 'Low' },
            { disease: 'Black Rot', cases: 1, status: 'Under Control', affectedArea: '1 hectare', severity: 'Low' }
        ];

        res.status(200).json({
            success: true,
            data: diseaseData
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
