const express = require('express');
const router = express.Router();
const {
    getOverview,
    getProduction,
    getFinancial,
    getQuality,
    getDiseases,
    getSupplierInsights,
    getEmployeeStats,
    exportReport
} = require('../controllers/reportsController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/reports/overview - Get business overview
router.get('/overview', authorize('owner'), getOverview);

// GET /api/reports/production - Get production statistics
router.get('/production', authorize('owner'), getProduction);

// GET /api/reports/financial - Get financial statistics
router.get('/financial', authorize('owner'), getFinancial);

// GET /api/reports/quality - Get quality assessment statistics
router.get('/quality', authorize('owner'), getQuality);

// GET /api/reports/diseases - Get disease monitoring statistics
router.get('/diseases', authorize('owner'), getDiseases);

// GET /api/reports/suppliers - Get supplier insights
router.get('/suppliers', authorize('owner'), getSupplierInsights);

// GET /api/reports/employees - Get employee statistics
router.get('/employees', authorize('owner'), getEmployeeStats);

// POST /api/reports/export - Export report
router.post('/export', authorize('owner'), exportReport);

module.exports = router;
