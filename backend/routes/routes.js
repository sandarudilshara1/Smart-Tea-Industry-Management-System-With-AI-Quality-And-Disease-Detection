const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const { auth } = require('../middleware/auth');

// Get all routes
router.get('/', auth, routeController.getAllRoutes);

// Get route statistics (must be before /:routeId)
router.get('/:routeId/statistics', auth, routeController.getRouteStatistics);

// Update route supplier count (must be before /:routeId)
router.put('/:routeId/update-supplier-count', auth, routeController.updateRouteSupplierCount);

// Get route by ID
router.get('/:routeId', auth, routeController.getRouteById);

// Create route
router.post('/', auth, routeController.createRoute);

// Update route
router.put('/:routeId', auth, routeController.updateRoute);

// Delete route
router.delete('/:routeId', auth, routeController.deleteRoute);

module.exports = router;
