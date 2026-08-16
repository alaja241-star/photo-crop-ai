export interface User {
  id: string;
  name: string;
  email: string;
  role: 'farmer' | 'admin' | 'expert';
  profile?: {
    phone?: string;
    location?: {
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
    farmSize?: number;
    farmType?: 'crop' | 'livestock' | 'mixed' | 'organic' | 'conventional';
    experience?: number;
  };
  preferences?: {
    language: string;
    units: 'metric' | 'imperial';
    notifications: {
      email: boolean;
      weather: boolean;
      reports: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface Disease {
  name: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  description: string;
  symptoms: string[];
  causes: string[];
}

export interface Pest {
  name: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  description: string;
}

export interface Recommendation {
  type: 'treatment' | 'prevention' | 'cultural_practice';
  action: string;
  priority: 'low' | 'medium' | 'high';
  timeframe: 'immediate' | 'within_week' | 'within_month';
}

export interface DiseaseAnalysis {
  id: string;
  user: string;
  imageUrl: string;
  cropType?: string;
  diseaseDetected: boolean;
  confidence: number;
  diseases: Disease[];
  pests: Pest[];
  healthStatus: 'healthy' | 'mild_issues' | 'moderate_issues' | 'severe_issues';
  recommendations: Recommendation[];
  additionalNotes?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  metadata: {
    analysisTime: number;
    imageSize?: number;
    imageDimensions?: {
      width: number;
      height: number;
    };
  };
  status: 'pending' | 'completed' | 'failed';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SoilComposition {
  organicMatter: 'low' | 'medium' | 'high';
  moisture: 'dry' | 'adequate' | 'wet' | 'waterlogged';
  texture: 'fine' | 'medium' | 'coarse';
  color: string;
}

export interface SoilNutrients {
  nitrogen: 'deficient' | 'adequate' | 'excess';
  phosphorus: 'deficient' | 'adequate' | 'excess';
  potassium: 'deficient' | 'adequate' | 'excess';
  ph: 'acidic' | 'neutral' | 'alkaline';
}

export interface SoilIssue {
  type: 'compaction' | 'erosion' | 'salinity' | 'contamination' | 'drainage';
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface SuitableCrop {
  cropName: string;
  suitability: 'excellent' | 'good' | 'fair' | 'poor';
  reason: string;
}

export interface SoilRecommendation {
  type: 'fertilizer' | 'amendment' | 'practice' | 'irrigation';
  action: string;
  priority: 'low' | 'medium' | 'high';
  expectedImprovement: string;
}

export interface SoilAnalysis {
  id: string;
  user: string;
  imageUrl: string;
  soilType: 'clay' | 'sandy' | 'loamy' | 'silty' | 'rocky';
  fertilityLevel: 'poor' | 'fair' | 'good' | 'excellent';
  confidence: number;
  composition: SoilComposition;
  nutrients: SoilNutrients;
  issues: SoilIssue[];
  suitableCrops: SuitableCrop[];
  recommendations: SoilRecommendation[];
  additionalNotes?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  metadata: {
    analysisTime: number;
    imageSize?: number;
    imageDimensions?: {
      width: number;
      height: number;
    };
  };
  status: 'pending' | 'completed' | 'failed';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WeatherCurrent {
  temperature: {
    current: number;
    feelsLike: number;
    min: number;
    max: number;
  };
  humidity: number;
  pressure: number;
  visibility: number;
  uvIndex?: number;
  weather: {
    main: string;
    description: string;
    icon: string;
  };
  wind: {
    speed: number;
    direction: number;
    gust?: number;
  };
  clouds: number;
  rain: number;
  snow: number;
  sunrise: Date;
  sunset: Date;
  timestamp: Date;
}

export interface WeatherForecast {
  date: Date;
  temperature: {
    min: number;
    max: number;
    avg: number;
  };
  humidity: {
    avg: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  };
  rain: number;
  wind: {
    avg: number;
  };
}

export interface AgriculturalMetrics {
  avgTemperature: number;
  temperatureRange: {
    min: number;
    max: number;
  };
  totalRainfall: number;
  avgHumidity: number;
  growingDegreeDays: number;
  frostRisk: 'low' | 'medium' | 'high';
  droughtRisk: 'low' | 'medium' | 'high';
  optimalPlantingConditions: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface CropRecommendationItem {
  cropName: string;
  variety?: string;
  suitability: 'excellent' | 'good' | 'fair';
  plantingWindow: {
    start: string;
    end: string;
  };
  expectedYield: string;
  waterRequirement: 'low' | 'medium' | 'high';
  growthDuration: string;
  marketValue: 'low' | 'medium' | 'high';
  reasons: string[];
  considerations: string[];
}

export interface SeasonalAdvice {
  currentSeason: string;
  nextSeason: string;
  yearRound: string;
}

export interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface CropRecommendation {
  id: string;
  user: string;
  weatherData: any;
  soilData?: any;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  recommendations: CropRecommendationItem[];
  seasonalAdvice: SeasonalAdvice;
  riskFactors: RiskFactor[];
  additionalNotes?: string;
  metadata: {
    analysisTime: number;
    season?: string;
    climateZone?: string;
  };
  status: 'pending' | 'completed' | 'failed';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  overview: {
    totalAnalyses: number;
    diseaseAnalyses: number;
    soilAnalyses: number;
    cropRecommendations: number;
    overallHealthScore: number;
  };
  diseaseStats: {
    totalAnalyses: number;
    diseasesDetected: number;
    healthyPlants: number;
    avgConfidence: number;
  };
  soilStats: {
    totalAnalyses: number;
    excellentSoil: number;
    goodSoil: number;
    avgConfidence: number;
  };
  cropStats: {
    totalRecommendations: number;
    avgRecommendationsPerRequest: number;
    avgRiskFactors: number;
  };
  recentActivities: Array<{
    id: string;
    type: 'disease' | 'soil' | 'recommendation';
    title: string;
    status: string;
    createdAt: string;
    imageUrl?: string;
  }>;
}
