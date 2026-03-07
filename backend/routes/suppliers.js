const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { auth } = require('../middleware/auth');

// Get all suppliers for a factory
router.get('/factory/:factoryId', auth, supplierController.getAllSuppliers);

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
