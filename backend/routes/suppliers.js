const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { auth, authorize } = require('../middleware/auth');

console.log('[DEBUG] Loading suppliers routes...');

// Debug ping
router.get('/ping', (req, res) => res.json({ success: true, message: 'pong' }));

// Get logged-in supplier profile
router.get('/me', auth, supplierController.getMySupplierProfile);

// Link a supplier to a user — admin/manager only (never call from supplier-facing UI)
router.post('/me/link', auth, authorize('owner', 'factory_manager'), supplierController.linkMySupplierProfile);

// Get all suppliers
router.get('/', auth, supplierController.getAllSuppliers);

// Get suppliers by route
router.get('/route/:routeId', auth, supplierController.getSuppliersByRoute);

// Get supplier by ID
router.get('/:supplierId', auth, supplierController.getSupplierById);

// Create supplier
router.post('/', auth, supplierController.createSupplier);

// Update supplier
router.put('/:supplierId', auth, supplierController.updateSupplier);

// Delete supplier
router.delete('/:supplierId', auth, supplierController.deleteSupplier);

// Get supplier statistics
router.get('/:supplierId/statistics', auth, supplierController.getSupplierStatistics);

module.exports = router;
