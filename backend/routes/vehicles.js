const express = require('express');
const router = express.Router();
const {
    getAllVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    updateVehicleStatus,
    assignDriver,
    unassignDriver,
    getVehicleStats
} = require('../controllers/vehicleController');
const { auth, authorize } = require('../middleware/auth');

// Statistics route (must be before /:id route)
router.get('/stats/summary', auth, getVehicleStats);

// Main CRUD routes
router.route('/')
    .get(auth, getAllVehicles)
    .post(auth, authorize('transport_manager', 'owner', 'driver'), createVehicle);

router.route('/:id')
    .get(auth, getVehicleById)
    .put(auth, authorize('transport_manager', 'owner', 'driver'), updateVehicle)
    .delete(auth, authorize('owner'), deleteVehicle);

// Status management
router.patch('/:id/status', auth, authorize('transport_manager', 'owner'), updateVehicleStatus);

// Driver assignment
router.patch('/:id/assign-driver', auth, authorize('transport_manager', 'owner'), assignDriver);
router.patch('/:id/unassign-driver', auth, authorize('transport_manager', 'owner'), unassignDriver);

module.exports = router;
