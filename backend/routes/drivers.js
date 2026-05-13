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
    unassignRoute,
    getMyDriverProfile,
    updateMyDriverProfile,
    updateTripStatus
} = require('../controllers/driverController');

// Protect all routes
router.use(auth);

// Driver CRUD routes
router.post('/', authorize('owner', 'transport_manager'), createDriver);
router.get('/', getAllDrivers);
router.get('/me', getMyDriverProfile); // Must be before /:id
router.put('/me', updateMyDriverProfile); // Driver self-update
router.get('/:id', getDriverById);
router.put('/:id', authorize('owner', 'transport_manager'), updateDriver);
router.delete('/:id', authorize('owner', 'transport_manager'), deleteDriver);

// Route & Trip assignment
router.post('/:id/assign-route', authorize('owner', 'transport_manager'), assignRoute);
router.delete('/:id/assign-route/:routeId', authorize('owner', 'transport_manager'), unassignRoute);
router.put('/:id/trip-status', authorize('owner', 'transport_manager', 'driver'), updateTripStatus);

module.exports = router;
