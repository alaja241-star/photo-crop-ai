import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';

const generateContent = vi.fn();
vi.mock('@google/genai', () => ({
  Type: { STRING: 'STRING', NUMBER: 'NUMBER', INTEGER: 'INTEGER', BOOLEAN: 'BOOLEAN', ARRAY: 'ARRAY', OBJECT: 'OBJECT' },
  GoogleGenAI: vi.fn(function () {
    return { models: { generateContent } };
  }),
}));

let mongo: MongoMemoryServer;
let app: import('express').Express;
let token: string;
const tmpJpeg = path.join(process.cwd(), 'test-fixture-soil.jpg');

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  ({ app } = await import('../../index.js'));
  fs.writeFileSync(
    tmpJpeg,
    Buffer.from(
      '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAAIAAgBASIA/8QAFAABAAAAAAAAAAAAAAAAAAAAB//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8AH//Z',
      'base64',
    ),
  );
  const reg = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Soil', email: `soil-${Date.now()}@example.com`, password: 'secret123' });
  token = reg.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
  if (fs.existsSync(tmpJpeg)) fs.unlinkSync(tmpJpeg);
});

beforeEach(() => {
  generateContent.mockReset();
  generateContent.mockResolvedValue({
    text: JSON.stringify({
      soilType: 'loamy',
      fertilityLevel: 'good',
      confidence: 75,
      composition: { organicMatter: 'medium', moisture: 'adequate', texture: 'medium', color: 'brown' },
      nutrients: { nitrogen: 'adequate', phosphorus: 'deficient', potassium: 'adequate', ph: 'neutral' },
      issues: [],
      suitableCrops: [],
      recommendations: [],
      additionalNotes: '',
    }),
  });
});

describe('soil image persistence', () => {
  it('stores the image, hides it from lists, and serves it', async () => {
    const analyze = await request(app)
      .post('/api/soil/analyze')
      .set('Authorization', `Bearer ${token}`)
      .attach('soilImage', tmpJpeg);
    expect(analyze.status).toBe(200);
    const id = analyze.body.data._id;
    expect(analyze.body.data.imageUrl).toBe(`/api/soil/${id}/image`);
    expect(analyze.body.data.image).toBeUndefined();

    const list = await request(app).get('/api/soil').set('Authorization', `Bearer ${token}`);
    expect(list.body.data.every((d: { image?: unknown }) => d.image === undefined)).toBe(true);

    const img = await request(app).get(`/api/soil/${id}/image`).set('Authorization', `Bearer ${token}`);
    expect(img.status).toBe(200);
    expect(img.headers['content-type']).toContain('image/jpeg');
    expect(img.body.length).toBeGreaterThan(0);
  });

  it('returns 404 for a missing image and 401 without auth', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    expect((await request(app).get(`/api/soil/${fakeId}/image`).set('Authorization', `Bearer ${token}`)).status).toBe(404);
    expect((await request(app).get(`/api/soil/${fakeId}/image`)).status).toBe(401);
  });
});
