import { Type, type Schema } from '@google/genai';

/**
 * Gemini structured-output schemas. Enum arrays mirror the Mongoose model enums
 * exactly, so the model returns valid values directly (no post-hoc coercion).
 */

const confidence: Schema = { type: Type.NUMBER, minimum: 0, maximum: 100 };
const stringArray: Schema = { type: Type.ARRAY, items: { type: Type.STRING } };

const severityEnum = ['low', 'medium', 'high'];

export const diseaseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    diseaseDetected: { type: Type.BOOLEAN },
    confidence,
    diseases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          severity: { type: Type.STRING, enum: severityEnum },
          confidence,
          description: { type: Type.STRING },
          symptoms: stringArray,
          causes: stringArray,
        },
        required: ['name', 'severity', 'confidence', 'description', 'symptoms', 'causes'],
      },
    },
    pests: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          severity: { type: Type.STRING, enum: severityEnum },
          confidence,
          description: { type: Type.STRING },
        },
        required: ['name', 'severity', 'confidence', 'description'],
      },
    },
    healthStatus: {
      type: Type.STRING,
      enum: ['healthy', 'mild_issues', 'moderate_issues', 'severe_issues'],
    },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['treatment', 'prevention', 'cultural_practice'] },
          action: { type: Type.STRING },
          priority: { type: Type.STRING, enum: severityEnum },
          timeframe: { type: Type.STRING, enum: ['immediate', 'within_week', 'within_month'] },
        },
        required: ['type', 'action', 'priority', 'timeframe'],
      },
    },
    additionalNotes: { type: Type.STRING },
  },
  required: [
    'diseaseDetected',
    'confidence',
    'diseases',
    'pests',
    'healthStatus',
    'recommendations',
    'additionalNotes',
  ],
  propertyOrdering: [
    'diseaseDetected',
    'confidence',
    'diseases',
    'pests',
    'healthStatus',
    'recommendations',
    'additionalNotes',
  ],
};

export const soilSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    soilType: { type: Type.STRING, enum: ['clay', 'sandy', 'loamy', 'silty', 'rocky'] },
    fertilityLevel: { type: Type.STRING, enum: ['poor', 'fair', 'good', 'excellent'] },
    confidence,
    composition: {
      type: Type.OBJECT,
      properties: {
        organicMatter: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
        moisture: { type: Type.STRING, enum: ['dry', 'adequate', 'wet', 'waterlogged'] },
        texture: { type: Type.STRING, enum: ['fine', 'medium', 'coarse'] },
        color: { type: Type.STRING },
      },
      required: ['organicMatter', 'moisture', 'texture', 'color'],
    },
    nutrients: {
      type: Type.OBJECT,
      properties: {
        nitrogen: { type: Type.STRING, enum: ['deficient', 'adequate', 'excess'] },
        phosphorus: { type: Type.STRING, enum: ['deficient', 'adequate', 'excess'] },
        potassium: { type: Type.STRING, enum: ['deficient', 'adequate', 'excess'] },
        ph: { type: Type.STRING, enum: ['acidic', 'neutral', 'alkaline'] },
      },
      required: ['nitrogen', 'phosphorus', 'potassium', 'ph'],
    },
    issues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            enum: ['compaction', 'erosion', 'salinity', 'contamination', 'drainage'],
          },
          severity: { type: Type.STRING, enum: severityEnum },
          description: { type: Type.STRING },
        },
        required: ['type', 'severity', 'description'],
      },
    },
    suitableCrops: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          cropName: { type: Type.STRING },
          suitability: { type: Type.STRING, enum: ['excellent', 'good', 'fair', 'poor'] },
          reason: { type: Type.STRING },
        },
        required: ['cropName', 'suitability', 'reason'],
      },
    },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['fertilizer', 'amendment', 'practice', 'irrigation'] },
          action: { type: Type.STRING },
          priority: { type: Type.STRING, enum: severityEnum },
          expectedImprovement: { type: Type.STRING },
        },
        required: ['type', 'action', 'priority', 'expectedImprovement'],
      },
    },
    additionalNotes: { type: Type.STRING },
  },
  required: [
    'soilType',
    'fertilityLevel',
    'confidence',
    'composition',
    'nutrients',
    'issues',
    'suitableCrops',
    'recommendations',
    'additionalNotes',
  ],
};

export const cropRecoSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          cropName: { type: Type.STRING },
          variety: { type: Type.STRING },
          suitability: { type: Type.STRING, enum: ['excellent', 'good', 'fair'] },
          plantingWindow: {
            type: Type.OBJECT,
            properties: {
              start: { type: Type.STRING },
              end: { type: Type.STRING },
            },
            required: ['start', 'end'],
          },
          expectedYield: { type: Type.STRING },
          waterRequirement: { type: Type.STRING, enum: severityEnum },
          growthDuration: { type: Type.STRING },
          marketValue: { type: Type.STRING, enum: severityEnum },
          reasons: stringArray,
          considerations: stringArray,
        },
        required: [
          'cropName',
          'variety',
          'suitability',
          'plantingWindow',
          'expectedYield',
          'waterRequirement',
          'growthDuration',
          'marketValue',
          'reasons',
          'considerations',
        ],
      },
    },
    seasonalAdvice: {
      type: Type.OBJECT,
      properties: {
        currentSeason: { type: Type.STRING },
        nextSeason: { type: Type.STRING },
        yearRound: { type: Type.STRING },
      },
      required: ['currentSeason', 'nextSeason', 'yearRound'],
    },
    riskFactors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          factor: { type: Type.STRING },
          severity: { type: Type.STRING, enum: severityEnum },
          mitigation: { type: Type.STRING },
        },
        required: ['factor', 'severity', 'mitigation'],
      },
    },
    additionalNotes: { type: Type.STRING },
  },
  required: ['recommendations', 'seasonalAdvice', 'riskFactors', 'additionalNotes'],
};
