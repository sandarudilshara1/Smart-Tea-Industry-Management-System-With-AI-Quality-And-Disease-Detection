const express = require('express');
const router = express.Router();
const controller = require('../controllers/leafSupplyRequestController');
const { auth, authorize } = require('../middleware/auth');

// Inventory Manager
router.post('/', auth, authorize('inventory_manager'), controller.createRequest);
router.get('/mine', auth, authorize('inventory_manager'), controller.getMyRequests);
router.patch('/:id/receive', auth, authorize('inventory_manager'), controller.receiveRequest);

// Supplier
router.get('/inbox', auth, authorize('supplier'), controller.getSupplierInbox);
router.patch('/:id/confirm', auth, authorize('supplier'), controller.confirmRequest);
router.patch('/:id/reject', auth, authorize('supplier'), controller.rejectRequest);

module.exports = router;
