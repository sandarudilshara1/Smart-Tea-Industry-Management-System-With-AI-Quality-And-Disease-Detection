const express = require('express');
const router = express.Router();

const { auth, authorize } = require('../middleware/auth');
const emergencyController = require('../controllers/emergencyController');

router.use(auth);

// Driver endpoints
router.post('/report', authorize('driver'), emergencyController.reportEmergency);
router.get('/my', authorize('driver'), emergencyController.getMyEmergencies);

// Transport manager / owner endpoints
router.get('/', authorize('transport_manager', 'owner'), emergencyController.getEmergencies);
router.patch('/:id/assign-replacement', authorize('transport_manager', 'owner'), emergencyController.assignReplacement);
router.patch('/:id/status', authorize('transport_manager', 'owner'), emergencyController.updateEmergencyStatus);

module.exports = router;
