const express = require('express');
const router = express.Router();
const teaLeafEntryController = require('../controllers/teaLeafEntryController');
const { auth } = require('../middleware/auth');

// Get all tea leaf entries for a factory
router.get('/factory/:factoryId', auth, teaLeafEntryController.getAllTeaLeafEntries);

// Get tea leaf entries by supplier
router.get('/supplier/:supplierId', auth, teaLeafEntryController.getTeaLeafEntriesBySupplier);

// Get tea leaf entries by route
router.get('/route/:routeId', auth, teaLeafEntryController.getTeaLeafEntriesByRoute);

// Get tea leaf entry by ID
router.get('/:entryId', auth, teaLeafEntryController.getTeaLeafEntryById);

// Create tea leaf entry
router.post('/', auth, teaLeafEntryController.createTeaLeafEntry);

// Bulk create tea leaf entries
router.post('/bulk', auth, teaLeafEntryController.bulkCreateTeaLeafEntries);

// Update tea leaf entry
router.put('/:entryId', auth, teaLeafEntryController.updateTeaLeafEntry);

// Delete tea leaf entry
router.delete('/:entryId', auth, teaLeafEntryController.deleteTeaLeafEntry);

// Verify tea leaf entry
router.put('/:entryId/verify', auth, teaLeafEntryController.verifyTeaLeafEntry);

module.exports = router;
