import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import DiseaseAnalysis from '../DiseaseAnalysis.js';
import SoilAnalysis from '../SoilAnalysis.js';
import CropRecommendation from '../CropRecommendation.js';

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('analysis model statics', () => {
  it('getUserStats returns zeroed defaults for a user with no data', async () => {
    const id = new mongoose.Types.ObjectId();
    expect((await DiseaseAnalysis.getUserStats(id)).totalAnalyses).toBe(0);
    expect((await SoilAnalysis.getUserStats(id)).totalAnalyses).toBe(0);
    expect((await CropRecommendation.getUserStats(id)).totalRecommendations).toBe(0);
  });
});
