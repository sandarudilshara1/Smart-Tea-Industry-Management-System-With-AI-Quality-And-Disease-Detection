const express = require('express');
const router = express.Router();

const {
    receiveStock,
    recordUsage,
    getSummary,
    getTransactions,
    requestStock,
    getRequests,
    updateRequestStatus,
} = require('../controllers/fertilizerInventoryController');

const { auth, authorize } = require('../middleware/auth');

// Inventory Manager only
router.use(auth, authorize('inventory_manager'));

router.post('/receive', receiveStock);
router.post('/use', recordUsage);
router.get('/summary', getSummary);
router.get('/transactions', getTransactions);

router.post('/request', requestStock);
router.get('/requests', getRequests);
router.put('/requests/:id/status', updateRequestStatus);

module.exports = router;
