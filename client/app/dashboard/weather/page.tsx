"use client";

import { useState, useEffect } from "react";
import { weatherAPI } from "@/lib/api";
import {
  WeatherCurrent,
  WeatherForecast,
  AgriculturalMetrics,
  CropRecommendation,
} from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import LocationSearch from "@/components/LocationSearch";
import {
  formatTemperature,
  formatWindSpeed,
  getWeatherIcon,
  formatDate,
  capitalizeFirst,
  getApiErrorMessage,
} from "@/lib/utils";
import { CloudIcon, SunIcon, MapPinIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface WeatherData {
  current: WeatherCurrent;
  forecast: WeatherForecast[];
  agricultural: AgriculturalMetrics;
}

interface LocationWeatherResponse {
  location: {
    lat: number;
    lon: number;
    name: string;
    country: string;
  };
  weather: WeatherData;
}

interface LocationCoordinates {
  lat: number;
  lon: number;
  address: string;
}

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [cropRecommendation, setCropRecommendation] =
    useState<CropRecommendation | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [currentCoordinates, setCurrentCoordinates] =
    useState<LocationCoordinates | null>(null);

  useEffect(() => {
    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await weatherAPI.getAgriculturalWeather(
              latitude,
              longitude,
            );
            setWeatherData(response.data.data);
            setCurrentLocation(
              `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
            );
            setCurrentCoordinates({
              lat: latitude,
              lon: longitude,
              address: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
            });
          } catch (error) {
            console.error("Failed to get weather for current location:", error);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
        },
      );
    }
  }, []);

  const handleLocationSelect = (location: string) => {
    setCurrentLocation(location);
  };

  const handleGetWeather = async () => {
    if (!currentLocation) {
      toast.error("Please select a location first");
      return;
    }

    setIsLoadingWeather(true);
    try {
      const response = await weatherAPI.getLocationWeather(currentLocation);
      const weatherResponse = response.data.data as LocationWeatherResponse;

      setWeatherData(weatherResponse.weather);
      setCurrentCoordinates({
        lat: weatherResponse.location.lat,
        lon: weatherResponse.location.lon,
        address: `${weatherResponse.location.name}, ${weatherResponse.location.country}`,
      });
      setCurrentLocation(
        `${weatherResponse.location.name}, ${weatherResponse.location.country}`,
      );

      setCropRecommendation(null); // Clear previous recommendations
      toast.success("Weather data loaded successfully!");
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Failed to get weather data");
      toast.error(message);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const getCropRecommendations = async () => {
    if (!weatherData) {
      toast.error("Please load weather data first");
      return;
    }

    if (!currentCoordinates) {
      toast.error(
        "Location coordinates not available. Please search for a location first.",
      );
      return;
    }

    setIsLoadingRecommendations(true);
    try {
      const response = await weatherAPI.getCropRecommendations({
        lat: currentCoordinates.lat,
        lon: currentCoordinates.lon,
        location: { address: currentCoordinates.address },
      });
      setCropRecommendation(response.data.data);
      toast.success("Crop recommendations generated!");
    } catch (error: unknown) {
      const message = getApiErrorMessage(
        error,
        "Failed to get crop recommendations",
      );
      toast.error(message);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-800 bg-green-200 border border-green-300";
      case "medium":
        return "text-yellow-800 bg-yellow-200 border border-yellow-300";
      case "high":
        return "text-red-800 bg-red-200 border border-red-300";
      default:
        return "text-gray-800 bg-gray-200 border border-gray-300";
    }
  };

  const getConditionsColor = (conditions: string) => {
    switch (conditions) {
      case "excellent":
        return "text-green-800 bg-green-200 border border-green-300";
      case "good":
        return "text-blue-800 bg-blue-200 border border-blue-300";
      case "fair":
        return "text-yellow-800 bg-yellow-200 border border-yellow-300";
      case "poor":
        return "text-red-800 bg-red-200 border border-red-300";
      default:
        return "text-gray-800 bg-gray-200 border border-gray-300";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Weather & Crop Recommendations
        </h1>
        <p className="mt-2 text-gray-700">
          Get weather insights and AI-powered crop recommendations for your
          location
        </p>
      </div>

      {/* Location Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Location
            </label>
            <LocationSearch
              onLocationSelect={handleLocationSelect}
              placeholder="Enter city, state, or coordinates"
              disabled={isLoadingWeather}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGetWeather}
              disabled={isLoadingWeather || !currentLocation}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingWeather ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Loading...
                </>
              ) : (
                <>
                  <CloudIcon className="h-4 w-4 mr-2" />
                  Get Weather
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {weatherData && (
        <>
          {/* Current Weather */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Current Weather
              </h2>
              <div className="flex items-center text-sm text-gray-700">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {currentLocation}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-2">
                  {getWeatherIcon(weatherData.current.weather.description)}
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatTemperature(weatherData.current.temperature.current)}
                </div>
                <p className="text-sm text-gray-700 capitalize">
                  {weatherData.current.weather.description}
                </p>
                <p className="text-xs text-gray-600">
                  Feels like{" "}
                  {formatTemperature(weatherData.current.temperature.feelsLike)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 font-medium">
                    Humidity:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {weatherData.current.humidity}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 font-medium">
                    Pressure:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {weatherData.current.pressure} hPa
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 font-medium">
                    Visibility:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {weatherData.current.visibility} km
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 font-medium">
                    Clouds:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {weatherData.current.clouds}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 font-medium">
                    Wind Speed:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatWindSpeed(weatherData.current.wind.speed)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 font-medium">
                    Wind Direction:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {weatherData.current.wind.direction}°
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 font-medium">
                    Rain:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {weatherData.current.rain} mm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 font-medium">
                    Snow:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {weatherData.current.snow} mm
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 font-medium">
                    High:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatTemperature(weatherData.current.temperature.max)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 font-medium">
                    Low:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatTemperature(weatherData.current.temperature.min)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 font-medium">
                    Sunrise:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {new Date(weatherData.current.sunrise).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 font-medium">
                    Sunset:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {new Date(weatherData.current.sunset).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Agricultural Metrics */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Agricultural Insights
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatTemperature(weatherData.agricultural.avgTemperature)}
                </div>
                <p className="text-sm text-gray-700 font-medium">
                  Avg Temperature
                </p>
                <p className="text-xs text-gray-600">
                  {formatTemperature(
                    weatherData.agricultural.temperatureRange.min,
                  )}{" "}
                  -{" "}
                  {formatTemperature(
                    weatherData.agricultural.temperatureRange.max,
                  )}
                </p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {weatherData.agricultural.totalRainfall} mm
                </div>
                <p className="text-sm text-gray-700 font-medium">
                  Total Rainfall
                </p>
                <p className="text-xs text-gray-600">7-day forecast</p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {weatherData.agricultural.growingDegreeDays}
                </div>
                <p className="text-sm text-gray-700 font-medium">
                  Growing Degree Days
                </p>
                <p className="text-xs text-gray-600">Base 10°C</p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {weatherData.agricultural.avgHumidity}%
                </div>
                <p className="text-sm text-gray-700 font-medium">
                  Avg Humidity
                </p>
                <p className="text-xs text-gray-600">7-day forecast</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(
                    weatherData.agricultural.frostRisk,
                  )}`}
                >
                  {capitalizeFirst(weatherData.agricultural.frostRisk)} Frost
                  Risk
                </div>
              </div>
              <div className="text-center">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(
                    weatherData.agricultural.droughtRisk,
                  )}`}
                >
                  {capitalizeFirst(weatherData.agricultural.droughtRisk)}{" "}
                  Drought Risk
                </div>
              </div>
              <div className="text-center">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConditionsColor(
                    weatherData.agricultural.optimalPlantingConditions,
                  )}`}
                >
                  {capitalizeFirst(
                    weatherData.agricultural.optimalPlantingConditions,
                  )}{" "}
                  Planting Conditions
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Forecast */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              7-Day Forecast
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {weatherData.forecast.slice(0, 7).map((day, index) => (
                <div key={index} className="text-center p-3 border rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    {index === 0 ? "Today" : formatDate(day.date).split(",")[0]}
                  </p>
                  <div className="text-2xl my-2">
                    {getWeatherIcon(day.weather.description)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {formatTemperature(day.temperature.max)}
                    </p>
                    <p className="text-xs text-gray-700">
                      {formatTemperature(day.temperature.min)}
                    </p>
                    <p className="text-xs text-gray-700">
                      {day.rain > 0 ? `${day.rain}mm` : "No rain"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Crop Recommendations Button */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Get Crop Recommendations
              </h2>
              <p className="text-gray-700 mb-6">
                Get AI-powered crop recommendations based on current weather
                conditions
              </p>
              <button
                onClick={getCropRecommendations}
                disabled={isLoadingRecommendations}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingRecommendations ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Generating Recommendations...
                  </>
                ) : (
                  <>
                    <SunIcon className="h-5 w-5 mr-2" />
                    Get Crop Recommendations
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Crop Recommendations */}
      {cropRecommendation && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Crop Recommendations
            </h2>

            {cropRecommendation.recommendations.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cropRecommendation.recommendations.map((crop, index) => (
                  <div
                    key={index}
                    className="border border-green-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">
                        {crop.cropName}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getConditionsColor(
                          crop.suitability,
                        )}`}
                      >
                        {crop.suitability.toUpperCase()}
                      </span>
                    </div>

                    {crop.variety && (
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Variety:</strong> {crop.variety}
                      </p>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700 font-medium">
                          Planting:
                        </span>
                        <span className="text-gray-900 font-semibold">
                          {crop.plantingWindow.start} -{" "}
                          {crop.plantingWindow.end}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 font-medium">
                          Duration:
                        </span>
                        <span className="text-gray-900 font-semibold">
                          {crop.growthDuration}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 font-medium">
                          Water Need:
                        </span>
                        <span className="capitalize text-gray-900 font-semibold">
                          {crop.waterRequirement}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 font-medium">
                          Market Value:
                        </span>
                        <span className="capitalize text-gray-900 font-semibold">
                          {crop.marketValue}
                        </span>
                      </div>
                    </div>

                    {crop.reasons.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-800 mb-1">
                          Why this crop:
                        </p>
                        <ul className="text-xs text-gray-700 list-disc list-inside">
                          {crop.reasons.slice(0, 2).map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seasonal Advice */}
          {cropRecommendation.seasonalAdvice && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Seasonal Advice
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Current Season
                  </h4>
                  <p className="text-sm text-gray-700">
                    {cropRecommendation.seasonalAdvice.currentSeason}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Next Season
                  </h4>
                  <p className="text-sm text-gray-700">
                    {cropRecommendation.seasonalAdvice.nextSeason}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Year Round</h4>
                  <p className="text-sm text-gray-700">
                    {cropRecommendation.seasonalAdvice.yearRound}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Risk Factors */}
          {cropRecommendation.riskFactors.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Risk Factors
              </h3>
              <div className="space-y-4">
                {cropRecommendation.riskFactors.map((risk, index) => (
                  <div
                    key={index}
                    className="border border-yellow-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {risk.factor}
                      </h4>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getRiskColor(
                          risk.severity,
                        )}`}
                      >
                        {risk.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{risk.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
