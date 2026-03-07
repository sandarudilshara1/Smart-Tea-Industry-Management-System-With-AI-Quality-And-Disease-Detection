const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: [true, 'Topic is required'],
        enum: ['general', 'payments', 'maintenance', 'routes', 'inventory', 'fertilizer', 'event'],
        default: 'general'
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Content is required']
    },
    factories: [{
        type: Number,
        required: true
    }],
    attachments: [{
        name: String,
        size: String,
        url: String,
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    viewedBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        viewedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Index for faster queries
announcementSchema.index({ createdBy: 1, createdAt: -1 });
announcementSchema.index({ factories: 1 });
announcementSchema.index({ topic: 1 });
announcementSchema.index({ isActive: 1, createdAt: -1 });
announcementSchema.index({ isActive: 1, factories: 1, createdAt: -1 });
announcementSchema.index({ isActive: 1, topic: 1, createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
