const express = require('express');
const router = express.Router();
const {
    getAllCompanies,
    getCompanyDropdown,
    getCompanyCategories,
    createCompany,
    updateCompany,
    deleteCompany
} = require('../controllers/fertilizerCompanyController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/fertilizer-companies/dropdown - Get company dropdown
router.get('/dropdown', getCompanyDropdown);

// GET /api/fertilizer-companies/:id/categories - Get categories for a company
router.get('/:id/categories', getCompanyCategories);

// GET /api/fertilizer-companies - Get all companies
router.get('/', getAllCompanies);

// POST /api/fertilizer-companies - Create company (inventory manager only)
router.post('/', authorize('inventory_manager'), createCompany);

// PUT /api/fertilizer-companies/:id - Update company (inventory manager only)
router.put('/:id', authorize('inventory_manager'), updateCompany);

// DELETE /api/fertilizer-companies/:id - Delete company (inventory manager only)
router.delete('/:id', authorize('inventory_manager'), deleteCompany);

module.exports = router;
