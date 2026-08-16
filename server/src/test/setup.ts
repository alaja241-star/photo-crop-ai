// Pre-set required env vars so `config` (which validates them at import) never
// throws during tests. Uses ??= so a real .env value still wins when present.
process.env.JWT_SECRET ??= 'test-jwt-secret';
process.env.JWT_EXPIRE ??= '1h';
process.env.GOOGLE_AI_API_KEY ??= 'test-google-key';
process.env.WEATHER_API_KEY ??= 'test-weather-key';
process.env.NODE_ENV = 'test';
