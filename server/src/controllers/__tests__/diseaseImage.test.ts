import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';

// Mock Gemini so analyze doesn't hit the network.
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

// A tiny valid JPEG written to a temp path used as the upload fixture.
const tmpJpeg = path.join(process.cwd(), 'test-fixture.jpg');

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
    .send({ name: 'Img', email: `img-${Date.now()}@example.com`, password: 'secret123' });
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
      diseaseDetected: false,
      confidence: 80,
      diseases: [],
      pests: [],
      healthStatus: 'healthy',
      recommendations: [],
      additionalNotes: '',
    }),
  });
});

describe('disease image persistence', () => {
  it('stores the image, keeps it out of list responses, and serves it via the image endpoint', async () => {
    const analyze = await request(app)
      .post('/api/disease/analyze')
      .set('Authorization', `Bearer ${token}`)
      .attach('cropImage', tmpJpeg)
      .field('cropType', 'tomato');
    expect(analyze.status).toBe(200);
    const id = analyze.body.data._id;
    expect(analyze.body.data.imageUrl).toBe(`/api/disease/${id}/image`);
    // The analyze response must NOT include the raw image bytes.
    expect(analyze.body.data.image).toBeUndefined();

    // List endpoint must not leak the image field.
    const list = await request(app).get('/api/disease').set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.data.every((d: { image?: unknown }) => d.image === undefined)).toBe(true);

    // Image endpoint returns the bytes with the right content type.
    const img = await request(app).get(`/api/disease/${id}/image`).set('Authorization', `Bearer ${token}`);
    expect(img.status).toBe(200);
    expect(img.headers['content-type']).toContain('image/jpeg');
    expect(img.body.length).toBeGreaterThan(0);
  });

  it('returns 404 for a non-existent analysis image', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/disease/${fakeId}/image`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('rejects the image request without auth', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/disease/${fakeId}/image`);
    expect(res.status).toBe(401);
  });
});
