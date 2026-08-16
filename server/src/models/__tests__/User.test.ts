import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../User.js';

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('User model', () => {
  it('hashes the password on save and matchPassword verifies it', async () => {
    const user = await User.create({ name: 'A', email: 'a@example.com', password: 'secret123' });
    const withPw = await User.findById(user._id).select('+password');
    expect(withPw!.password).not.toBe('secret123');
    expect(await withPw!.matchPassword('secret123')).toBe(true);
    expect(await withPw!.matchPassword('wrong')).toBe(false);
  });

  it('issues a signed JWT', async () => {
    process.env.JWT_SECRET = 'testsecret';
    process.env.JWT_EXPIRE = '1h';
    const user = await User.create({ name: 'B', email: 'b@example.com', password: 'secret123' });
    expect(typeof user.getSignedJwtToken()).toBe('string');
  });
});
