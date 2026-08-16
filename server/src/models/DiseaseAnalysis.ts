import mongoose, { Schema, model, type Model, type Types } from 'mongoose';

type Severity = 'low' | 'medium' | 'high';

export interface IDisease {
  name: string;
  severity: Severity;
  confidence: number;
  description: string;
  symptoms: string[];
  causes: string[];
}

export interface IPest {
  name: string;
  severity: Severity;
  confidence: number;
  description: string;
}

export interface IDiseaseRecommendation {
  type: 'treatment' | 'prevention' | 'cultural_practice';
  action: string;
  priority: Severity;
  timeframe: 'immediate' | 'within_week' | 'within_month';
}

export interface ILocation {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  coordinates?: { latitude?: number; longitude?: number };
}

export interface IDiseaseAnalysis {
  user: Types.ObjectId;
  imageUrl: string;
  image?: {
    data: Buffer;
    contentType: string;
    size: number;
  };
  cropType?: string;
  diseaseDetected: boolean;
  confidence: number;
  diseases: IDisease[];
  pests: IPest[];
  healthStatus: 'healthy' | 'mild_issues' | 'moderate_issues' | 'severe_issues';
  recommendations: IDiseaseRecommendation[];
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

export interface DiseaseUserStats {
  totalAnalyses: number;
  diseasesDetected: number;
  healthyPlants: number;
  avgConfidence: number;
}

interface DiseaseAnalysisModel extends Model<IDiseaseAnalysis> {
  getUserStats(userId: Types.ObjectId | string): Promise<DiseaseUserStats>;
}

const diseaseSchema = new Schema<IDisease>({
  name: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
  confidence: { type: Number, min: 0, max: 100, required: true },
  description: { type: String, required: true },
  symptoms: [{ type: String }],
  causes: [{ type: String }],
});

const pestSchema = new Schema<IPest>({
  name: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
  confidence: { type: Number, min: 0, max: 100, required: true },
  description: { type: String, required: true },
});

const recommendationSchema = new Schema<IDiseaseRecommendation>({
  type: {
    type: String,
    enum: ['treatment', 'prevention', 'cultural_practice'],
    required: true,
  },
  action: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], required: true },
  timeframe: {
    type: String,
    enum: ['immediate', 'within_week', 'within_month'],
    required: true,
  },
});

const diseaseAnalysisSchema = new Schema<IDiseaseAnalysis, DiseaseAnalysisModel>(
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
    cropType: {
      type: String,
      trim: true,
    },
    diseaseDetected: {
      type: Boolean,
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    diseases: [diseaseSchema],
    pests: [pestSchema],
    healthStatus: {
      type: String,
      enum: ['healthy', 'mild_issues', 'moderate_issues', 'severe_issues'],
      required: true,
    },
    recommendations: [recommendationSchema],
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
diseaseAnalysisSchema.index({ user: 1, createdAt: -1 });
diseaseAnalysisSchema.index({ diseaseDetected: 1 });
diseaseAnalysisSchema.index({ healthStatus: 1 });
diseaseAnalysisSchema.index({ cropType: 1 });
diseaseAnalysisSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for getting the public URL of the image (placeholder since images are deleted)
diseaseAnalysisSchema.virtual('imagePublicUrl').get(function () {
  return '/images/placeholder-crop.jpg';
});

// Method to get summary statistics
diseaseAnalysisSchema.methods.getSummary = function (this: IDiseaseAnalysis & { _id: Types.ObjectId }) {
  return {
    id: this._id,
    cropType: this.cropType,
    diseaseDetected: this.diseaseDetected,
    confidence: this.confidence,
    healthStatus: this.healthStatus,
    diseaseCount: this.diseases.length,
    pestCount: this.pests.length,
    recommendationCount: this.recommendations.length,
    createdAt: this.createdAt,
  };
};

// Static method to get user statistics
diseaseAnalysisSchema.statics.getUserStats = async function (
  userId: Types.ObjectId | string
): Promise<DiseaseUserStats> {
  const stats = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalAnalyses: { $sum: 1 },
        diseasesDetected: { $sum: { $cond: ['$diseaseDetected', 1, 0] } },
        healthyPlants: {
          $sum: { $cond: [{ $eq: ['$healthStatus', 'healthy'] }, 1, 0] },
        },
        avgConfidence: { $avg: '$confidence' },
      },
    },
  ]);

  return (
    stats[0] || {
      totalAnalyses: 0,
      diseasesDetected: 0,
      healthyPlants: 0,
      avgConfidence: 0,
    }
  );
};

export default model<IDiseaseAnalysis, DiseaseAnalysisModel>(
  'DiseaseAnalysis',
  diseaseAnalysisSchema
);
