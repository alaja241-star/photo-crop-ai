import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../index.js';

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('auth flow', () => {
  it('registers, logs in, and rejects /me without a token', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'T', email: 't@example.com', password: 'secret123' });
    expect(reg.status).toBe(201);
    expect(reg.body.token).toBeDefined();

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 't@example.com', password: 'secret123' });
    expect(login.status).toBe(200);

    const noAuth = await request(app).get('/api/auth/me');
    expect(noAuth.status).toBe(401);

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe('t@example.com');
  });
});
