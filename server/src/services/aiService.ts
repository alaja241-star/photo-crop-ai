import { GoogleGenAI, type Schema, type ContentListUnion } from '@google/genai';
import fs from 'fs';
import config from '../config/index.js';
import { diseaseSchema, soilSchema, cropRecoSchema } from '../schemas/aiSchemas.js';
import type { DiseaseAiResult, SoilAiResult, CropAiResult } from '../types/aiResults.js';
import { AppError } from '../errors/AppError.js';

class AIService {
  private ai = new GoogleGenAI({ apiKey: config.googleAiApiKey });
  private model = config.geminiModel;

  private async generateJson<T>(contents: ContentListUnion, schema: Schema): Promise<T> {
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) {
      throw new AppError('Empty response from AI', 502);
    }
    return JSON.parse(text) as T;
  }

  /**
   * Analyze crop disease from image.
   */
  async analyzeCropDisease(
    imagePath: string,
    cropType: string | null = null
  ): Promise<DiseaseAiResult> {
    const base64Image = fs.readFileSync(imagePath).toString('base64');
    const prompt = `You are an expert agricultural pathologist. Analyze this crop image for diseases, pests, and health issues.${
      cropType ? ` The crop type is: ${cropType}.` : ''
    }
Be specific and provide actionable recommendations. If no disease is detected, still provide preventive care suggestions.`;

    try {
      return await this.generateJson<DiseaseAiResult>(
        [prompt, { inlineData: { data: base64Image, mimeType: 'image/jpeg' } }],
        diseaseSchema
      );
    } catch (error) {
      console.error('Error analyzing crop disease:', error);
      throw error instanceof AppError ? error : new AppError('Failed to analyze crop disease', 502);
    }
  }

  /**
   * Analyze soil fertility from image.
   */
  async analyzeSoilFertility(imagePath: string, location: unknown = null): Promise<SoilAiResult> {
    const base64Image = fs.readFileSync(imagePath).toString('base64');
    const prompt = `You are an expert soil scientist. Analyze this soil image for fertility, composition, and health.${
      location ? ` The location is: ${JSON.stringify(location)}.` : ''
    }
Provide specific, actionable recommendations for improving soil fertility and crop selection.`;

    try {
      return await this.generateJson<SoilAiResult>(
        [prompt, { inlineData: { data: base64Image, mimeType: 'image/jpeg' } }],
        soilSchema
      );
    } catch (error) {
      console.error('Error analyzing soil fertility:', error);
      throw error instanceof AppError ? error : new AppError('Failed to analyze soil fertility', 502);
    }
  }

  /**
   * Get crop recommendations based on weather and optional soil data.
   */
  async getCropRecommendations(
    weatherData: unknown,
    soilData: unknown = null,
    location: unknown = null
  ): Promise<CropAiResult> {
    const prompt = `You are an expert agricultural advisor. Based on the provided weather data and optional soil data, recommend suitable crops.
Weather Data: ${JSON.stringify(weatherData)}${soilData ? `\nSoil Data: ${JSON.stringify(soilData)}` : ''}${
      location ? `\nLocation: ${JSON.stringify(location)}` : ''
    }
Ensure all seasonal advice fields contain meaningful, specific recommendations. Consider climate patterns, soil conditions, market demand, and sustainable farming practices.`;

    try {
      return await this.generateJson<CropAiResult>([prompt], cropRecoSchema);
    } catch (error) {
      console.error('Error getting crop recommendations:', error);
      throw error instanceof AppError
        ? error
        : new AppError('Failed to get crop recommendations', 502);
    }
  }
}

export default new AIService();
