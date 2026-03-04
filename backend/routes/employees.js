const express = require('express');
const router = express.Router();
const {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    getEmployeeStats
} = require('../controllers/employeeController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/employees/stats - Get employee statistics
router.get('/stats', getEmployeeStats);

// GET /api/employees - Get all employees
router.get('/', getAllEmployees);

// POST /api/employees - Create employee (owner only)
router.post('/', authorize('owner'), createEmployee);

// GET /api/employees/:id - Get single employee
router.get('/:id', getEmployeeById);

// PUT /api/employees/:id - Update employee (owner only)
router.put('/:id', authorize('owner'), updateEmployee);

// DELETE /api/employees/:id - Delete employee (owner only)
router.delete('/:id', authorize('owner'), deleteEmployee);

module.exports = router;
