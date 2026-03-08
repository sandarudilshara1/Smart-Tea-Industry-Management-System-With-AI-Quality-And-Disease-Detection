const express = require('express');
const router = express.Router();
const {
    getAllManagers,
    getManagersByFactory,
    updateManagerStatus,
    deleteManager
} = require('../controllers/managerController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/manager-info - Get all managers
router.get('/', getAllManagers);

// GET /api/manager-info/:factoryId - Get managers by factory
router.get('/:factoryId', getManagersByFactory);

// PATCH /api/manager-info/:id/status - Update manager status (owner only)
router.patch('/:id/status', authorize('owner'), updateManagerStatus);

// DELETE /api/manager-info/:id - Delete manager (owner only)
router.delete('/:id', authorize('owner'), deleteManager);

module.exports = router;
