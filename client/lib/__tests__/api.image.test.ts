import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('js-cookie', () => ({ default: { get: vi.fn(() => undefined) } }));

describe('fetchImageObjectUrl', () => {
  beforeEach(() => vi.resetModules());

  it('requests the image as a blob (stripping the /api prefix) and returns an object URL', async () => {
    const get = vi.fn().mockResolvedValue({ data: new Blob(['x'], { type: 'image/jpeg' }) });
    vi.doMock('axios', () => ({
      default: { create: () => ({ get, interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } }) },
    }));
    (globalThis.URL.createObjectURL as unknown) = vi.fn(() => 'blob:mock-url');

    const { fetchImageObjectUrl } = await import('../api');
    const url = await fetchImageObjectUrl('/api/disease/abc123/image');

    expect(get).toHaveBeenCalledWith('/disease/abc123/image', { responseType: 'blob' });
    expect(url).toBe('blob:mock-url');
  });
});
