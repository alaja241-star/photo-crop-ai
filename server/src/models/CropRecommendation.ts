import mongoose, { Schema, model, type Model, type Types } from 'mongoose';
import type { ILocation } from './DiseaseAnalysis.js';

type Level = 'low' | 'medium' | 'high';

export interface IPlantingWindow {
  start: string;
  end: string;
}

export interface ICropRecommendationItem {
  cropName: string;
  variety?: string;
  suitability: 'excellent' | 'good' | 'fair';
  plantingWindow: IPlantingWindow;
  expectedYield: string;
  waterRequirement: Level;
  growthDuration: string;
  marketValue: Level;
  reasons: string[];
  considerations: string[];
}

export interface ISeasonalAdvice {
  currentSeason: string;
  nextSeason: string;
  yearRound: string;
}

export interface IRiskFactor {
  factor: string;
  severity: Level;
  mitigation: string;
}

export interface ICropRecommendation {
  user: Types.ObjectId;
  weatherData: unknown;
  soilData?: unknown;
  location?: ILocation;
  recommendations: ICropRecommendationItem[];
  seasonalAdvice: ISeasonalAdvice;
  riskFactors: IRiskFactor[];
  additionalNotes?: string;
  metadata: {
    analysisTime: number;
    season?: string;
    climateZone?: string;
  };
  status: 'pending' | 'completed' | 'failed';
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CropUserStats {
  totalRecommendations: number;
  avgRecommendationsPerRequest: number;
  avgRiskFactors: number;
}

export interface PopularCrop {
  _id: string;
  count: number;
  avgSuitability: number;
  avgMarketValue: number;
}

interface CropRecommendationModel extends Model<ICropRecommendation> {
  getUserStats(userId: Types.ObjectId | string): Promise<CropUserStats>;
  getPopularCrops(limit?: number): Promise<PopularCrop[]>;
}

const plantingWindowSchema = new Schema<IPlantingWindow>({
  start: { type: String, required: true },
  end: { type: String, required: true },
});

const cropRecommendationItemSchema = new Schema<ICropRecommendationItem>({
  cropName: { type: String, required: true },
  variety: { type: String },
  suitability: {
    type: String,
    enum: ['excellent', 'good', 'fair'],
    required: true,
  },
  plantingWindow: { type: plantingWindowSchema, required: true },
  expectedYield: { type: String, required: true },
  waterRequirement: { type: String, enum: ['low', 'medium', 'high'], required: true },
  growthDuration: { type: String, required: true },
  marketValue: { type: String, enum: ['low', 'medium', 'high'], required: true },
  reasons: [{ type: String, required: true }],
  considerations: [{ type: String, required: true }],
});

const seasonalAdviceSchema = new Schema<ISeasonalAdvice>({
  currentSeason: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => !!v && v.trim().length > 0,
      message: 'currentSeason cannot be empty',
    },
  },
  nextSeason: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => !!v && v.trim().length > 0,
      message: 'nextSeason cannot be empty',
    },
  },
  yearRound: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => !!v && v.trim().length > 0,
      message: 'yearRound cannot be empty',
    },
  },
});

const riskFactorSchema = new Schema<IRiskFactor>({
  factor: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
  mitigation: { type: String, required: true },
});

const cropRecommendationSchema = new Schema<ICropRecommendation, CropRecommendationModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    weatherData: {
      type: Schema.Types.Mixed,
      required: true,
    },
    soilData: {
      type: Schema.Types.Mixed,
    },
    location: {
      address: String,
      city: String,
      state: String,
      country: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    recommendations: [cropRecommendationItemSchema],
    seasonalAdvice: {
      type: seasonalAdviceSchema,
      required: true,
    },
    riskFactors: [riskFactorSchema],
    additionalNotes: {
      type: String,
    },
    metadata: {
      analysisTime: {
        type: Number,
        default: 0,
      },
      season: {
        type: String,
      },
      climateZone: {
        type: String,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
cropRecommendationSchema.index({ user: 1, createdAt: -1 });
cropRecommendationSchema.index({ 'location.coordinates': '2dsphere' });
cropRecommendationSchema.index({ 'recommendations.cropName': 1 });
cropRecommendationSchema.index({ 'recommendations.suitability': 1 });

// Method to get summary statistics
cropRecommendationSchema.methods.getSummary = function (
  this: ICropRecommendation & { _id: Types.ObjectId }
) {
  return {
    id: this._id,
    location: this.location,
    recommendationCount: this.recommendations.length,
    excellentCrops: this.recommendations.filter((r) => r.suitability === 'excellent').length,
    goodCrops: this.recommendations.filter((r) => r.suitability === 'good').length,
    riskFactorCount: this.riskFactors.length,
    createdAt: this.createdAt,
  };
};

// Static method to get user statistics
cropRecommendationSchema.statics.getUserStats = async function (
  userId: Types.ObjectId | string
): Promise<CropUserStats> {
  const stats = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalRecommendations: { $sum: 1 },
        avgRecommendationsPerRequest: { $avg: { $size: '$recommendations' } },
        avgRiskFactors: { $avg: { $size: '$riskFactors' } },
      },
    },
  ]);

  return (
    stats[0] || {
      totalRecommendations: 0,
      avgRecommendationsPerRequest: 0,
      avgRiskFactors: 0,
    }
  );
};

// Static method to get popular crops
cropRecommendationSchema.statics.getPopularCrops = async function (
  limit = 10
): Promise<PopularCrop[]> {
  const popularCrops = await this.aggregate([
    { $unwind: '$recommendations' },
    {
      $group: {
        _id: '$recommendations.cropName',
        count: { $sum: 1 },
        avgSuitability: {
          $avg: {
            $cond: [
              { $eq: ['$recommendations.suitability', 'excellent'] },
              3,
              {
                $cond: [{ $eq: ['$recommendations.suitability', 'good'] }, 2, 1],
              },
            ],
          },
        },
        avgMarketValue: {
          $avg: {
            $cond: [
              { $eq: ['$recommendations.marketValue', 'high'] },
              3,
              {
                $cond: [{ $eq: ['$recommendations.marketValue', 'medium'] }, 2, 1],
              },
            ],
          },
        },
      },
    },
    { $sort: { count: -1, avgSuitability: -1 } },
    { $limit: limit },
  ]);

  return popularCrops as PopularCrop[];
};

// Pre-save middleware to handle empty seasonal advice
cropRecommendationSchema.pre('validate', function (next) {
  if (this.seasonalAdvice) {
    if (!this.seasonalAdvice.currentSeason || this.seasonalAdvice.currentSeason.trim() === '') {
      this.seasonalAdvice.currentSeason = 'Current season recommendations not available';
    }
    if (!this.seasonalAdvice.nextSeason || this.seasonalAdvice.nextSeason.trim() === '') {
      this.seasonalAdvice.nextSeason = 'Next season recommendations not available';
    }
    if (!this.seasonalAdvice.yearRound || this.seasonalAdvice.yearRound.trim() === '') {
      this.seasonalAdvice.yearRound = 'Year-round recommendations not available';
    }
  }
  next();
});

export default model<ICropRecommendation, CropRecommendationModel>(
  'CropRecommendation',
  cropRecommendationSchema
);
