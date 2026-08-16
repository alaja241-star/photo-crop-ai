import { describe, it, expect } from 'vitest';
import { AppError } from '../AppError.js';

describe('AppError', () => {
  it('carries a message and status code', () => {
    const err = new AppError('not found', 404);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err.message).toBe('not found');
    expect(err.statusCode).toBe(404);
  });

  it('accepts an optional code', () => {
    const err = new AppError('bad', 400, 'BAD_INPUT');
    expect(err.code).toBe('BAD_INPUT');
  });
});
