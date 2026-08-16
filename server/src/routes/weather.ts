import express from 'express';
import {
  getCurrentWeather,
  getWeatherForecast,
  getAgriculturalWeather,
  getCropRecommendations,
  getLocationWeather,
} from '../controllers/weather.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/weather/current
router.get('/current', optionalAuth, getCurrentWeather);

// @route   GET /api/weather/forecast
router.get('/forecast', optionalAuth, getWeatherForecast);

// @route   GET /api/weather/agricultural
router.get('/agricultural', optionalAuth, getAgriculturalWeather);

// @route   GET /api/weather/location/:location
router.get('/location/:location', optionalAuth, getLocationWeather);

// @route   POST /api/weather/crop-recommendations
router.post('/crop-recommendations', protect, getCropRecommendations);

export default router;
