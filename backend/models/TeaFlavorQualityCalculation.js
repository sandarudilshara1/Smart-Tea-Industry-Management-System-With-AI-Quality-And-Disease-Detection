const mongoose = require('mongoose');

const teaFlavorQualityCalculationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    teaFlavor: {
      value: {
        type: String,
        enum: ['black_tea', 'green_tea', 'oolong', 'white_tea', 'matcha', 'chai_spice', 'earl_grey'],
        required: true
      },
      label: String,
      basePrice: Number
    },
    qualityParameters: {
      particleSize: Number,
      moistureContent: Number,
      colorValue: Number,
      aromaPower: Number,
      tasteStrength: Number,
      solubility: Number,
      caffeineContent: Number,
      powderFineness: Number
    },
    batchWeight: {
      type: Number,
      required: true
    },
    qualityScore: {
      type: Number,
      min: 0,
      max: 100
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C', 'D'],
      required: true
    },
    gradeLabel: String,
    qualityStatus: String,
    priceMultiplier: Number,
    pricing: {
      basePrice: Number,
      adjustedPricePerKg: Number,
      totalBatchValue: Number,
      marketAvgPrice: Number,
      priceDifference: Number,
      pricePercentDiff: String
    },
    parameterResults: [
      {
        name: String,
        value: Number,
        unit: String,
        range: [Number],
        status: {
          type: String,
          enum: ['pass', 'fail']
        },
        score: Number
      }
    ],
    notes: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Draft', 'Completed', 'Approved', 'Rejected'],
      default: 'Completed'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    indexes: [
      { userId: 1, createdAt: -1 },
      { grade: 1, createdAt: -1 },
      { status: 1 }
    ]
  }
);

// Index for faster queries
teaFlavorQualityCalculationSchema.index({ userId: 1, createdAt: -1 });
teaFlavorQualityCalculationSchema.index({ grade: 1, createdAt: -1 });
teaFlavorQualityCalculationSchema.index({ status: 1 });

// Static methods
teaFlavorQualityCalculationSchema.statics.getStatistics = async function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$grade',
        count: { $sum: 1 },
        avgQualityScore: { $avg: '$qualityScore' },
        avgPrice: { $avg: '$pricing.adjustedPricePerKg' }
      }
    },
    {
      $sort: { avgQualityScore: -1 }
    }
  ]);
};

teaFlavorQualityCalculationSchema.statics.getDailyStatistics = async function(userId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      }
    },
    {
      $group: {
        _id: null,
        totalAssessments: { $sum: 1 },
        avgQualityScore: { $avg: '$qualityScore' },
        avgPrice: { $avg: '$pricing.adjustedPricePerKg' },
        totalBatchValue: { $sum: '$pricing.totalBatchValue' },
        premiumGrades: {
          $sum: {
            $cond: [{ $in: ['$grade', ['A+', 'A', 'A-']] }, 1, 0]
          }
        }
      }
    }
  ]);
};

teaFlavorQualityCalculationSchema.statics.getGradeDistribution = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$grade',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

module.exports = mongoose.model('TeaFlavorQualityCalculation', teaFlavorQualityCalculationSchema);
