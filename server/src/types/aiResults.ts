/**
 * TypeScript interfaces mirroring the Gemini `responseSchema` objects in
 * `../schemas/aiSchemas.ts`. Enum unions match the Mongoose model enums exactly.
 */

type Severity = 'low' | 'medium' | 'high';

export interface DiseaseAiResult {
  diseaseDetected: boolean;
  confidence: number;
  diseases: Array<{
    name: string;
    severity: Severity;
    confidence: number;
    description: string;
    symptoms: string[];
    causes: string[];
  }>;
  pests: Array<{
    name: string;
    severity: Severity;
    confidence: number;
    description: string;
  }>;
  healthStatus: 'healthy' | 'mild_issues' | 'moderate_issues' | 'severe_issues';
  recommendations: Array<{
    type: 'treatment' | 'prevention' | 'cultural_practice';
    action: string;
    priority: Severity;
    timeframe: 'immediate' | 'within_week' | 'within_month';
  }>;
  additionalNotes: string;
}

export interface SoilAiResult {
  soilType: 'clay' | 'sandy' | 'loamy' | 'silty' | 'rocky';
  fertilityLevel: 'poor' | 'fair' | 'good' | 'excellent';
  confidence: number;
  composition: {
    organicMatter: 'low' | 'medium' | 'high';
    moisture: 'dry' | 'adequate' | 'wet' | 'waterlogged';
    texture: 'fine' | 'medium' | 'coarse';
    color: string;
  };
  nutrients: {
    nitrogen: 'deficient' | 'adequate' | 'excess';
    phosphorus: 'deficient' | 'adequate' | 'excess';
    potassium: 'deficient' | 'adequate' | 'excess';
    ph: 'acidic' | 'neutral' | 'alkaline';
  };
  issues: Array<{
    type: 'compaction' | 'erosion' | 'salinity' | 'contamination' | 'drainage';
    severity: Severity;
    description: string;
  }>;
  suitableCrops: Array<{
    cropName: string;
    suitability: 'excellent' | 'good' | 'fair' | 'poor';
    reason: string;
  }>;
  recommendations: Array<{
    type: 'fertilizer' | 'amendment' | 'practice' | 'irrigation';
    action: string;
    priority: Severity;
    expectedImprovement: string;
  }>;
  additionalNotes: string;
}

export interface CropAiResult {
  recommendations: Array<{
    cropName: string;
    variety: string;
    suitability: 'excellent' | 'good' | 'fair';
    plantingWindow: { start: string; end: string };
    expectedYield: string;
    waterRequirement: Severity;
    growthDuration: string;
    marketValue: Severity;
    reasons: string[];
    considerations: string[];
  }>;
  seasonalAdvice: {
    currentSeason: string;
    nextSeason: string;
    yearRound: string;
  };
  riskFactors: Array<{
    factor: string;
    severity: Severity;
    mitigation: string;
  }>;
  additionalNotes: string;
}
