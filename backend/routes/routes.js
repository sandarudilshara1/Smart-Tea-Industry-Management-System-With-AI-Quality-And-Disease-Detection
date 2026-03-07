const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const { auth } = require('../middleware/auth');

// Get all routes for a factory
router.get('/factory/:factoryId', auth, routeController.getAllRoutes);

// Get route by ID
router.get('/:routeId', auth, routeController.getRouteById);

// Create route
router.post('/', auth, routeController.createRoute);

// Update route
router.put('/:routeId', auth, routeController.updateRoute);

// Delete route
router.delete('/:routeId', auth, routeController.deleteRoute);

// Get route statistics
router.get('/:routeId/statistics', auth, routeController.getRouteStatistics);

// Update route supplier count
router.put('/:routeId/update-supplier-count', auth, routeController.updateRouteSupplierCount);

module.exports = router;
