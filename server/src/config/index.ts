import dotenv from 'dotenv';

dotenv.config();

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, fallback: string): string {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

const config = {
  port: parseInt(optionalEnv('PORT', '5000'), 10),
  nodeEnv: optionalEnv('NODE_ENV', 'development'),
  clientUrl: optionalEnv('CLIENT_URL', 'http://localhost:3000'),
  mongoUri: optionalEnv('MONGODB_URI', 'mongodb://localhost:27017/agricultural-ai'),
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpire: optionalEnv('JWT_EXPIRE', '7d'),
  jwtCookieExpire: parseInt(optionalEnv('JWT_COOKIE_EXPIRE', '7'), 10),
  googleAiApiKey: requireEnv('GOOGLE_AI_API_KEY'),
  geminiModel: optionalEnv('GEMINI_MODEL', 'gemma-4-26b-a4b-it'),
  weatherApiKey: requireEnv('WEATHER_API_KEY'),
  weatherApiUrl: optionalEnv('WEATHER_API_URL', 'https://api.openweathermap.org/data/2.5'),
  maxFileSize: parseInt(optionalEnv('MAX_FILE_SIZE', String(10 * 1024 * 1024)), 10),
};

export default config;
