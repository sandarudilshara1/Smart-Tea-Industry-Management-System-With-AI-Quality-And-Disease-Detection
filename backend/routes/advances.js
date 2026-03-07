const express = require('express');
const router = express.Router();
const advanceController = require('../controllers/advanceController');
const { auth } = require('../middleware/auth');

// Get advances by status with filtering
router.get('/:factoryId/status', auth, advanceController.getAdvancesByStatus);

// Get advance status counts
router.get('/:factoryId/status-counts', auth, advanceController.getAdvanceStatusCounts);

// Get advance details
router.get('/:advanceId', auth, advanceController.getAdvanceDetails);

// Create advance request
router.post('/', auth, advanceController.createAdvanceRequest);

// Approve advance
router.put('/:advanceId/approve', auth, advanceController.approveAdvance);

// Reject advance
router.put('/:advanceId/reject', auth, advanceController.rejectAdvance);

// Get advances by supplier
router.get('/supplier/:supplierId', auth, advanceController.getAdvancesBySupplier);

module.exports = router;
