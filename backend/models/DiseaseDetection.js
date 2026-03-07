const mongoose = require('mongoose');

const diseaseDetectionSchema = new mongoose.Schema({
    // User who performed the detection
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Disease information
    diseaseType: {
        type: String,
        required: true,
        enum: ['BB', 'RR', 'RSM', 'GL'], // Brown Blight, Red Rust, Red Spider Mite, Green Leaf (Healthy)
        description: 'Disease code'
    },

    diseaseName: {
        type: String,
        required: true
    },

    diseaseFullName: {
        type: String,
        required: true
    },

    // Detection confidence score
    confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },

    // Image information
    imagePath: {
        type: String,
        required: true,
        description: 'Path or URL to the analyzed leaf image'
    },

    imageUploadMethod: {
        type: String,
        enum: ['upload', 'camera'],
        default: 'upload'
    },

    // Disease characteristics
    severity: {
        type: String,
        enum: ['None', 'Low', 'Medium', 'High'],
        required: true
    },

    symptoms: [{
        type: String
    }],

    impact: {
        type: String,
        required: true,
        description: 'Expected yield/quality impact'
    },

    // Treatment recommendations
    immediateActions: [{
        type: String
    }],

    preventiveMeasures: [{
        type: String
    }],

    // Status tracking
    status: {
        type: String,
        enum: ['pending', 'treated', 'healthy', 'monitoring'],
        default: 'pending'
    },

    // Treatment plan (if created)
    treatmentPlan: {
        created: {
            type: Boolean,
            default: false
        },
        createdAt: Date,
        planDetails: String,
        completedAt: Date
    },

    // Location information (optional)
    location: {
        section: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },

    // Additional notes
    notes: {
        type: String,
        maxlength: 1000
    },

    // Analyzed by user details
    analyzedBy: {
        name: String,
        role: String
    },

    // Report metadata
    reportDownloaded: {
        type: Boolean,
        default: false
    },

    reportShared: {
        type: Boolean,
        default: false
    },

    // AI Model information
    modelVersion: {
        type: String,
        default: 'v1.0'
    },

    processingTime: {
        type: Number, // in milliseconds
        description: 'Time taken for AI analysis'
    }

}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Indexes for efficient querying
diseaseDetectionSchema.index({ userId: 1, createdAt: -1 });
diseaseDetectionSchema.index({ diseaseType: 1 });
diseaseDetectionSchema.index({ status: 1 });
diseaseDetectionSchema.index({ createdAt: -1 });

// Virtual for detection date formatting
diseaseDetectionSchema.virtual('detectionDate').get(function() {
    return this.createdAt.toLocaleDateString();
});

diseaseDetectionSchema.virtual('detectionTime').get(function() {
    return this.createdAt.toLocaleTimeString();
});

// Methods
diseaseDetectionSchema.methods.markAsTreated = function() {
    this.status = 'treated';
    if (this.treatmentPlan.created) {
        this.treatmentPlan.completedAt = new Date();
    }
    return this.save();
};

diseaseDetectionSchema.methods.createTreatmentPlan = function(planDetails) {
    this.treatmentPlan = {
        created: true,
        createdAt: new Date(),
        planDetails: planDetails
    };
    return this.save();
};

// Static methods for statistics
diseaseDetectionSchema.statics.getStatisticsByUser = async function(userId, startDate, endDate) {
    const match = {
        userId: new mongoose.Types.ObjectId(userId)
    };
    
    if (startDate || endDate) {
        match.createdAt = {};
        if (startDate) match.createdAt.$gte = new Date(startDate);
        if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    return this.aggregate([
        { $match: match },
        {
            $group: {
                _id: '$diseaseType',
                count: { $sum: 1 },
                avgConfidence: { $avg: '$confidence' },
                diseaseName: { $first: '$diseaseName' }
            }
        },
        { $sort: { count: -1 } }
    ]);
};

diseaseDetectionSchema.statics.getDailyStatistics = async function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await this.aggregate([
        {
            $match: {
                createdAt: { $gte: today }
            }
        },
        {
            $group: {
                _id: null,
                totalScans: { $sum: 1 },
                diseasesFound: {
                    $sum: {
                        $cond: [{ $ne: ['$diseaseType', 'GL'] }, 1, 0]
                    }
                },
                healthyLeaves: {
                    $sum: {
                        $cond: [{ $eq: ['$diseaseType', 'GL'] }, 1, 0]
                    }
                },
                avgConfidence: { $avg: '$confidence' }
            }
        }
    ]);

    return stats[0] || {
        totalScans: 0,
        diseasesFound: 0,
        healthyLeaves: 0,
        avgConfidence: 0
    };
};

const DiseaseDetection = mongoose.model('DiseaseDetection', diseaseDetectionSchema);

module.exports = DiseaseDetection;
