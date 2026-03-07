const express = require('express');
const router = express.Router();
const {
    createDetection,
    getAllDetections,
    getDetectionById,
    updateDetection,
    deleteDetection,
    getStatistics,
    markAsTreated,
    createTreatmentPlan,
    getRecentDetections
} = require('../controllers/diseaseDetectionController');
const { auth } = require('../middleware/auth');

// All routes are protected (require authentication)
router.use(auth);

// GET /api/disease-detections/statistics/summary - Get statistics
router.get('/statistics/summary', getStatistics);

// GET /api/disease-detections/recent/list - Get recent detections
router.get('/recent/list', getRecentDetections);

// GET /api/disease-detections - Get all detections (with filters)
// POST /api/disease-detections - Create new detection
router.route('/')
    .get(getAllDetections)
    .post(createDetection);

// GET /api/disease-detections/:id - Get single detection
// PUT /api/disease-detections/:id - Update detection
// DELETE /api/disease-detections/:id - Delete detection
router.route('/:id')
    .get(getDetectionById)
    .put(updateDetection)
    .delete(deleteDetection);

// PATCH /api/disease-detections/:id/treat - Mark as treated
router.patch('/:id/treat', markAsTreated);

// POST /api/disease-detections/:id/treatment-plan - Create treatment plan
router.post('/:id/treatment-plan', createTreatmentPlan);

module.exports = router;
