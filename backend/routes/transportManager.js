const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const transportManagerController = require('../controllers/transportManagerController');

router.use(auth);

router.get(
    '/dashboard',
    authorize('transport_manager', 'owner'),
    transportManagerController.getDashboard
);

module.exports = router;
