const Announcement = require('../models/Announcement');

// @desc    Create new announcement
// @route   POST /api/announcements
// @access  Private (Owner only)
exports.createAnnouncement = async (req, res) => {
    try {
        const { topic, subject, content, factories, attachments } = req.body;

        // Validation
        if (!topic || !subject || !content) {
            return res.status(400).json({
                success: false,
                message: 'Please provide topic, subject, and content'
            });
        }

        if (!factories || !Array.isArray(factories) || factories.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please select at least one factory'
            });
        }

        // Validate topic
        const validTopics = ['general', 'payments', 'maintenance', 'routes', 'inventory', 'fertilizer', 'event'];
        if (!validTopics.includes(topic)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid topic'
            });
        }

        // Create announcement
        const announcement = await Announcement.create({
            topic,
            subject,
            content,
            factories: factories.map(f => parseInt(f)),
            attachments: attachments || [],
            createdBy: req.user.userId
        });

        res.status(201).json({
            success: true,
            message: 'Announcement created successfully',
            data: {
                announcement
            }
        });
    } catch (error) {
        console.error('Create announcement error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating announcement',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
exports.getAllAnnouncements = async (req, res) => {
    try {
        const { factoryId } = req.query;

        let query = { isActive: true };

        // Filter by factory if provided
        if (factoryId) {
            query.factories = parseInt(factoryId);
        }

        const announcements = await Announcement.find(query)
            .select('topic subject content factories attachments createdAt updatedAt')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            count: announcements.length,
            data: {
                announcements
            }
        });
    } catch (error) {
        console.error('Get announcements error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching announcements',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Private
exports.getAnnouncementById = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id)
            .populate('createdBy', 'firstName lastName email role');

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        // Mark as viewed by current user if not already viewed
        const alreadyViewed = announcement.viewedBy.some(
            v => v.userId.toString() === req.user.userId
        );

        if (!alreadyViewed) {
            announcement.viewedBy.push({
                userId: req.user.userId,
                viewedAt: new Date()
            });
            await announcement.save();
        }

        res.status(200).json({
            success: true,
            data: {
                announcement
            }
        });
    } catch (error) {
        console.error('Get announcement error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching announcement',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Owner only)
exports.updateAnnouncement = async (req, res) => {
    try {
        const { topic, subject, content, factories, attachments } = req.body;

        let announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        // Check if user is the creator
        if (announcement.createdBy.toString() !== req.user.userId && req.user.role !== 'owner') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this announcement'
            });
        }

        // Update fields
        if (topic) announcement.topic = topic;
        if (subject) announcement.subject = subject;
        if (content) announcement.content = content;
        if (factories) announcement.factories = factories.map(f => parseInt(f));
        if (attachments !== undefined) announcement.attachments = attachments;

        await announcement.save();

        res.status(200).json({
            success: true,
            message: 'Announcement updated successfully',
            data: {
                announcement
            }
        });
    } catch (error) {
        console.error('Update announcement error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating announcement',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Owner only)
exports.deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        // Check if user is the creator or owner
        if (announcement.createdBy.toString() !== req.user.userId && req.user.role !== 'owner') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this announcement'
            });
        }

        // Soft delete
        announcement.isActive = false;
        await announcement.save();

        res.status(200).json({
            success: true,
            message: 'Announcement deleted successfully'
        });
    } catch (error) {
        console.error('Delete announcement error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting announcement',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get announcements by topic
// @route   GET /api/announcements/topic/:topic
// @access  Private
exports.getAnnouncementsByTopic = async (req, res) => {
    try {
        const { topic } = req.params;
        const { factoryId } = req.query;

        let query = { 
            topic, 
            isActive: true 
        };

        if (factoryId) {
            query.factories = parseInt(factoryId);
        }

        const announcements = await Announcement.find(query)
            .select('topic subject content factories attachments createdAt updatedAt')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            count: announcements.length,
            data: {
                announcements
            }
        });
    } catch (error) {
        console.error('Get announcements by topic error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching announcements',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};
