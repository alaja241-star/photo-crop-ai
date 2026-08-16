import { describe, it, expect } from 'vitest';
import { requireEnv } from '../index.js';

describe('requireEnv', () => {
  it('returns the value when the env var is set', () => {
    process.env.__TEST_VAR = 'hello';
    expect(requireEnv('__TEST_VAR')).toBe('hello');
  });

  it('throws a descriptive error when the env var is missing', () => {
    delete process.env.__MISSING_VAR;
    expect(() => requireEnv('__MISSING_VAR')).toThrowError(/__MISSING_VAR/);
  });
});
