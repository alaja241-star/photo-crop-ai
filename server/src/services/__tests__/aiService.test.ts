import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';

const generateContent = vi.fn();
vi.mock('@google/genai', () => ({
  // Minimal Type enum so aiSchemas.ts (imported transitively) resolves.
  Type: {
    STRING: 'STRING',
    NUMBER: 'NUMBER',
    INTEGER: 'INTEGER',
    BOOLEAN: 'BOOLEAN',
    ARRAY: 'ARRAY',
    OBJECT: 'OBJECT',
  },
  GoogleGenAI: vi.fn(function () {
    return { models: { generateContent } };
  }),
}));

describe('aiService.analyzeCropDisease', () => {
  beforeEach(() => {
    generateContent.mockReset();
    // Only stub reads of the fake image path; delegate everything else
    // (e.g. dotenv reading .env at import time) to the real implementation.
    const realReadFileSync = fs.readFileSync.bind(fs);
    vi.spyOn(fs, 'readFileSync').mockImplementation((path, ...rest) => {
      if (typeof path === 'string' && path.endsWith('.jpg')) {
        return Buffer.from('fake-image');
      }
      return realReadFileSync(path as never, ...(rest as []));
    });
  });

  it('parses structured JSON and requests the disease schema', async () => {
    generateContent.mockResolvedValue({
      text: JSON.stringify({
        diseaseDetected: true,
        confidence: 90,
        diseases: [],
        pests: [],
        healthStatus: 'healthy',
        recommendations: [],
        additionalNotes: '',
      }),
    });
    const { default: aiService } = await import('../aiService.js');
    const result = await aiService.analyzeCropDisease('/tmp/x.jpg', 'tomato');

    expect(result.healthStatus).toBe('healthy');
    const callArg = generateContent.mock.calls[0][0];
    expect(callArg.config.responseMimeType).toBe('application/json');
    expect(callArg.config.responseSchema).toBeDefined();
  });

  it('throws AppError on empty response', async () => {
    generateContent.mockResolvedValue({ text: '' });
    const { default: aiService } = await import('../aiService.js');
    await expect(aiService.analyzeCropDisease('/tmp/x.jpg')).rejects.toThrow(/Failed|Empty/);
  });
});
