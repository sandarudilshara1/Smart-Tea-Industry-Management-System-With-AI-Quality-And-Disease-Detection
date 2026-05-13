const express = require('express');
const router = express.Router();

const { auth, authorize } = require('../middleware/auth');
const inventoryProcessController = require('../controllers/inventoryProcessController');

// Inventory Manager dashboard endpoints (minimal implementation based on existing models)
router.get(
    '/dashboard-summary',
    auth,
    authorize('inventory_manager', 'factory_manager', 'owner'),
    inventoryProcessController.getDashboardSummary
);

router.get(
    '/factories/trips/today',
    auth,
    authorize('inventory_manager', 'factory_manager', 'owner'),
    inventoryProcessController.getTodayTrips
);

router.get(
    '/bagweights',
    auth,
    authorize('inventory_manager', 'factory_manager', 'owner'),
    inventoryProcessController.getBagWeights
);

router.get(
    '/inventory-managers',
    auth,
    authorize('inventory_manager', 'factory_manager', 'owner'),
    inventoryProcessController.getInventoryManagers
);

router.get(
    '/fertilizer-history',
    auth,
    authorize('inventory_manager', 'factory_manager', 'owner'),
    inventoryProcessController.getFertilizerHistory
);

module.exports = router;
