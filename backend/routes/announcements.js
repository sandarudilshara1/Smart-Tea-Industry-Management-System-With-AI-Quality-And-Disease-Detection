const express = require('express');
const router = express.Router();
const {
    createAnnouncement,
    getAllAnnouncements,
    getAnnouncementById,
    updateAnnouncement,
    deleteAnnouncement,
    getAnnouncementsByTopic
} = require('../controllers/announcementController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/announcements - Get all announcements
router.get('/', getAllAnnouncements);

// POST /api/announcements - Create announcement (owner only)
router.post('/', authorize('owner'), createAnnouncement);

// GET /api/announcements/topic/:topic - Get announcements by topic
router.get('/topic/:topic', getAnnouncementsByTopic);

// GET /api/announcements/:id - Get single announcement
router.get('/:id', getAnnouncementById);

// PUT /api/announcements/:id - Update announcement (owner only)
router.put('/:id', authorize('owner'), updateAnnouncement);

// DELETE /api/announcements/:id - Delete announcement (owner only)
router.delete('/:id', authorize('owner'), deleteAnnouncement);

module.exports = router;
