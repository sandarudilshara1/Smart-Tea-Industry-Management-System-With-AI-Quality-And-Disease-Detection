const express = require('express');
const router = express.Router();
const teaRateController = require('../controllers/teaRateController');
const { auth } = require('../middleware/auth');

// Get active tea rate
router.get('/active', auth, teaRateController.getActiveTeaRate);

// Get all tea rates for a factory
router.get('/', auth, teaRateController.getAllTeaRates);

// Get tea rate for a specific date
router.get('/for-date', auth, teaRateController.getTeaRateForDate);

// Get tea rate by ID
router.get('/:teaRateId', auth, teaRateController.getTeaRateById);

// Create tea rate
router.post('/', auth, teaRateController.createTeaRate);

// Update tea rate
router.put('/:teaRateId', auth, teaRateController.updateTeaRate);

// Delete tea rate
router.delete('/:teaRateId', auth, teaRateController.deleteTeaRate);

// Activate tea rate
router.put('/:teaRateId/activate', auth, teaRateController.activateTeaRate);

module.exports = router;
