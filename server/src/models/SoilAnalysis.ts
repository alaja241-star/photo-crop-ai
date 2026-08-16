import mongoose, { Schema, model, type Model, type Types } from 'mongoose';
import type { ILocation } from './DiseaseAnalysis.js';

type Severity = 'low' | 'medium' | 'high';

export interface ISoilComposition {
  organicMatter: 'low' | 'medium' | 'high';
  moisture: 'dry' | 'adequate' | 'wet' | 'waterlogged';
  texture: 'fine' | 'medium' | 'coarse';
  color: string;
}

export interface ISoilNutrients {
  nitrogen: 'deficient' | 'adequate' | 'excess';
  phosphorus: 'deficient' | 'adequate' | 'excess';
  potassium: 'deficient' | 'adequate' | 'excess';
  ph: 'acidic' | 'neutral' | 'alkaline';
}

export interface ISoilIssue {
  type: 'compaction' | 'erosion' | 'salinity' | 'contamination' | 'drainage';
  severity: Severity;
  description: string;
}

export interface ISuitableCrop {
  cropName: string;
  suitability: 'excellent' | 'good' | 'fair' | 'poor';
  reason: string;
}

export interface ISoilRecommendation {
  type: 'fertilizer' | 'amendment' | 'practice' | 'irrigation';
  action: string;
  priority: Severity;
  expectedImprovement: string;
}

export interface ISoilAnalysis {
  user: Types.ObjectId;
  imageUrl: string;
  image?: {
    data: Buffer;
    contentType: string;
    size: number;
  };
  soilType: 'clay' | 'sandy' | 'loamy' | 'silty' | 'rocky';
  fertilityLevel: 'poor' | 'fair' | 'good' | 'excellent';
  confidence: number;
  composition: ISoilComposition;
  nutrients: ISoilNutrients;
  issues: ISoilIssue[];
  suitableCrops: ISuitableCrop[];
  recommendations: ISoilRecommendation[];
  additionalNotes?: string;
  location?: ILocation;
  metadata: {
    analysisTime: number;
    imageSize?: number;
    imageDimensions?: { width?: number; height?: number };
  };
  status: 'pending' | 'completed' | 'failed';
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SoilUserStats {
  totalAnalyses: number;
  excellentSoil: number;
  goodSoil: number;
  avgConfidence: number;
}

interface SoilAnalysisModel extends Model<ISoilAnalysis> {
  getUserStats(userId: Types.ObjectId | string): Promise<SoilUserStats>;
}

const compositionSchema = new Schema<ISoilComposition>({
  organicMatter: { type: String, enum: ['low', 'medium', 'high'], required: true },
  moisture: {
    type: String,
    enum: ['dry', 'adequate', 'wet', 'waterlogged'],
    required: true,
  },
  texture: { type: String, enum: ['fine', 'medium', 'coarse'], required: true },
  color: { type: String, required: true },
});

const nutrientsSchema = new Schema<ISoilNutrients>({
  nitrogen: { type: String, enum: ['deficient', 'adequate', 'excess'], required: true },
  phosphorus: { type: String, enum: ['deficient', 'adequate', 'excess'], required: true },
  potassium: { type: String, enum: ['deficient', 'adequate', 'excess'], required: true },
  ph: { type: String, enum: ['acidic', 'neutral', 'alkaline'], required: true },
});

const issueSchema = new Schema<ISoilIssue>({
  type: {
    type: String,
    enum: ['compaction', 'erosion', 'salinity', 'contamination', 'drainage'],
    required: true,
  },
  severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
  description: { type: String, required: true },
});

const suitableCropSchema = new Schema<ISuitableCrop>({
  cropName: { type: String, required: true },
  suitability: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    required: true,
  },
  reason: { type: String, required: true },
});

const soilRecommendationSchema = new Schema<ISoilRecommendation>({
  type: {
    type: String,
    enum: ['fertilizer', 'amendment', 'practice', 'irrigation'],
    required: true,
  },
  action: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], required: true },
  expectedImprovement: { type: String, required: true },
});

const soilAnalysisSchema = new Schema<ISoilAnalysis, SoilAnalysisModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    imageUrl: {
      type: String,
    },
    image: {
      type: new Schema(
        {
          data: Buffer,
          contentType: String,
          size: Number,
        },
        { _id: false }
      ),
      select: false,
    },
    soilType: {
      type: String,
      enum: ['clay', 'sandy', 'loamy', 'silty', 'rocky'],
      required: true,
    },
    fertilityLevel: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent'],
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    composition: {
      type: compositionSchema,
      required: true,
    },
    nutrients: {
      type: nutrientsSchema,
      required: true,
    },
    issues: [issueSchema],
    suitableCrops: [suitableCropSchema],
    recommendations: [soilRecommendationSchema],
    additionalNotes: {
      type: String,
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
    metadata: {
      analysisTime: {
        type: Number,
        default: 0,
      },
      imageSize: {
        type: Number,
      },
      imageDimensions: {
        width: Number,
        height: Number,
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
soilAnalysisSchema.index({ user: 1, createdAt: -1 });
soilAnalysisSchema.index({ soilType: 1 });
soilAnalysisSchema.index({ fertilityLevel: 1 });
soilAnalysisSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for getting the public URL of the image (placeholder since images are deleted)
soilAnalysisSchema.virtual('imagePublicUrl').get(function () {
  return '/images/placeholder-soil.jpg';
});

// Method to get summary statistics
soilAnalysisSchema.methods.getSummary = function (this: ISoilAnalysis & { _id: Types.ObjectId }) {
  return {
    id: this._id,
    soilType: this.soilType,
    fertilityLevel: this.fertilityLevel,
    confidence: this.confidence,
    issueCount: this.issues.length,
    suitableCropCount: this.suitableCrops.length,
    recommendationCount: this.recommendations.length,
    createdAt: this.createdAt,
  };
};

// Static method to get user statistics
soilAnalysisSchema.statics.getUserStats = async function (
  userId: Types.ObjectId | string
): Promise<SoilUserStats> {
  const stats = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalAnalyses: { $sum: 1 },
        excellentSoil: {
          $sum: { $cond: [{ $eq: ['$fertilityLevel', 'excellent'] }, 1, 0] },
        },
        goodSoil: {
          $sum: { $cond: [{ $eq: ['$fertilityLevel', 'good'] }, 1, 0] },
        },
        avgConfidence: { $avg: '$confidence' },
      },
    },
  ]);

  return (
    stats[0] || {
      totalAnalyses: 0,
      excellentSoil: 0,
      goodSoil: 0,
      avgConfidence: 0,
    }
  );
};

export default model<ISoilAnalysis, SoilAnalysisModel>('SoilAnalysis', soilAnalysisSchema);
