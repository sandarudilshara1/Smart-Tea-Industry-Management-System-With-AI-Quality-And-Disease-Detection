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

// POST /api/fertilizer-companies - Create company (owner only)
router.post('/', authorize('owner'), createCompany);

// PUT /api/fertilizer-companies/:id - Update company (owner only)
router.put('/:id', authorize('owner'), updateCompany);

// DELETE /api/fertilizer-companies/:id - Delete company (owner only)
router.delete('/:id', authorize('owner'), deleteCompany);

module.exports = router;
