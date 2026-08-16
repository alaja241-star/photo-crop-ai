import { describe, it, expect, vi, beforeEach } from 'vitest';
import Cookies from 'js-cookie';
import api from '../api';

describe('api client', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('attaches a bearer token from cookies to requests', () => {
    vi.spyOn(Cookies, 'get').mockReturnValue('tok123' as unknown as ReturnType<typeof Cookies.get>);
    const config = { headers: {} as Record<string, string> };
    // Exercise the request interceptor's fulfilled handler.
    const handler = (
      api.interceptors.request as unknown as {
        handlers: Array<{ fulfilled: (c: unknown) => unknown }>;
      }
    ).handlers[0].fulfilled;
    const result = handler(config) as { headers: Record<string, string> };
    expect(result.headers.Authorization).toBe('Bearer tok123');
  });

  it('does not attach an Authorization header when no token is present', () => {
    vi.spyOn(Cookies, 'get').mockReturnValue(undefined as unknown as ReturnType<typeof Cookies.get>);
    const config = { headers: {} as Record<string, string> };
    const handler = (
      api.interceptors.request as unknown as {
        handlers: Array<{ fulfilled: (c: unknown) => unknown }>;
      }
    ).handlers[0].fulfilled;
    const result = handler(config) as { headers: Record<string, string> };
    expect(result.headers.Authorization).toBeUndefined();
  });
});
