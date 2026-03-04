const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
    createDriver,
    getAllDrivers,
    getDriverById,
    updateDriver,
    deleteDriver,
    assignRoute,
    unassignRoute
} = require('../controllers/driverController');

// Protect all routes
router.use(auth);

// Driver CRUD routes
router.post('/', authorize('owner', 'transport_manager'), createDriver);
router.get('/', getAllDrivers);
router.get('/:id', getDriverById);
router.put('/:id', authorize('owner', 'transport_manager'), updateDriver);
router.delete('/:id', authorize('owner', 'transport_manager'), deleteDriver);

// Route assignment
router.post('/:id/assign-route', authorize('owner', 'transport_manager'), assignRoute);
router.delete('/:id/assign-route/:routeId', authorize('owner', 'transport_manager'), unassignRoute);

module.exports = router;
