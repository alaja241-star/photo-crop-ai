import type { Request, Response, NextFunction } from 'express';
import weatherService from '../services/weatherService.js';
import aiService from '../services/aiService.js';
import CropRecommendation from '../models/CropRecommendation.js';

/**
 * @desc    Get current weather by coordinates
 * @route   GET /api/weather/current?lat=&lon=
 * @access  Public
 */
export const getCurrentWeather = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      res.status(400).json({ success: false, error: 'Latitude and longitude are required' });
      return;
    }

    const weather = await weatherService.getCurrentWeather(
      parseFloat(lat as string),
      parseFloat(lon as string)
    );

    res.status(200).json({ success: true, data: weather });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get weather forecast by coordinates
 * @route   GET /api/weather/forecast?lat=&lon=&days=
 * @access  Public
 */
export const getWeatherForecast = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { lat, lon, days = 5 } = req.query;

    if (!lat || !lon) {
      res.status(400).json({ success: false, error: 'Latitude and longitude are required' });
      return;
    }

    const forecast = await weatherService.getWeatherForecast(
      parseFloat(lat as string),
      parseFloat(lon as string),
      parseInt(days as string)
    );

    res.status(200).json({ success: true, data: forecast });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get comprehensive agricultural weather data
 * @route   GET /api/weather/agricultural?lat=&lon=
 * @access  Public
 */
export const getAgriculturalWeather = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      res.status(400).json({ success: false, error: 'Latitude and longitude are required' });
      return;
    }

    const weatherData = await weatherService.getAgriculturalWeatherData(
      parseFloat(lat as string),
      parseFloat(lon as string)
    );

    res.status(200).json({ success: true, data: weatherData });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get weather data by location name
 * @route   GET /api/weather/location/:location
 * @access  Public
 */
export const getLocationWeather = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const location = req.params.location as string;

    if (!location) {
      res.status(400).json({ success: false, error: 'Location is required' });
      return;
    }

    // Get coordinates from location name
    const coordinates = await weatherService.getCoordinates(location);

    // Get weather data
    const weatherData = await weatherService.getAgriculturalWeatherData(
      coordinates.lat,
      coordinates.lon
    );

    res.status(200).json({
      success: true,
      data: { location: coordinates, weather: weatherData },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get crop recommendations based on weather and soil data
 * @route   POST /api/weather/crop-recommendations
 * @access  Private
 */
export const getCropRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const startTime = Date.now();

  try {
    const { lat, lon, soilData, location } = req.body;

    if (!lat || !lon) {
      res.status(400).json({ success: false, error: 'Latitude and longitude are required' });
      return;
    }

    // Get weather data
    const weatherData = await weatherService.getAgriculturalWeatherData(
      parseFloat(lat),
      parseFloat(lon)
    );

    // Get AI recommendations first - only save to DB if successful
    const aiResult = await aiService.getCropRecommendations(weatherData, soilData, location);

    // Create recommendation record with AI results - only save if AI was successful
    const recommendation = new CropRecommendation({
      user: req.user!.id,
      weatherData,
      soilData: soilData || null,
      location: location || null,
      // Structured output (responseSchema) guarantees valid enum values,
      // so AI results are stored directly without post-hoc coercion.
      recommendations: aiResult.recommendations,
      seasonalAdvice: aiResult.seasonalAdvice || {
        currentSeason: 'Current season recommendations based on weather analysis',
        nextSeason: 'Next season recommendations based on weather analysis',
        yearRound: 'Year-round recommendations based on weather analysis',
      },
      riskFactors: aiResult.riskFactors,
      additionalNotes: aiResult.additionalNotes,
      status: 'completed',
      metadata: { analysisTime: Date.now() - startTime },
    });

    // Save to database only after successful AI analysis
    await recommendation.save();

    res.status(200).json({ success: true, data: recommendation });
  } catch (error) {
    next(error);
  }
};
