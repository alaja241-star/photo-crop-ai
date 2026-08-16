import axios from 'axios';
import config from '../config/index.js';

export interface CurrentWeather {
  temperature: { current: number; feelsLike: number; min: number; max: number };
  humidity: number;
  pressure: number;
  visibility: number;
  uvIndex: number | null;
  weather: { main: string; description: string; icon: string };
  wind: { speed: number; direction: number; gust: number | null };
  clouds: number;
  rain: number;
  snow: number;
  sunrise: Date;
  sunset: Date;
  timestamp: Date;
}

export interface ForecastDay {
  date: Date;
  temperature: { min: number; max: number; avg: number };
  humidity: { avg: number };
  weather: { main: string; description: string; icon: string };
  rain: number;
  wind: { avg: number };
}

export interface Coordinates {
  lat: number;
  lon: number;
  name: string;
  country: string;
  state?: string;
}

export interface AgriculturalMetrics {
  avgTemperature: number;
  temperatureRange: { min: number; max: number };
  totalRainfall: number;
  avgHumidity: number;
  growingDegreeDays: number;
  frostRisk: 'low' | 'medium' | 'high';
  droughtRisk: 'low' | 'medium' | 'high';
  optimalPlantingConditions: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface AgriculturalWeatherData {
  current: CurrentWeather;
  forecast: ForecastDay[];
  agricultural: AgriculturalMetrics;
}

class WeatherService {
  private apiKey = config.weatherApiKey;
  private baseUrl = config.weatherApiUrl;
  private geoUrl = 'https://api.openweathermap.org/geo/1.0';

  async getCurrentWeather(lat: number, lon: number): Promise<CurrentWeather> {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: { lat, lon, appid: this.apiKey, units: 'metric' },
      });
      return this.formatCurrentWeather(response.data);
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw new Error('Failed to fetch current weather data');
    }
  }

  async getWeatherForecast(lat: number, lon: number, days = 5): Promise<ForecastDay[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: { lat, lon, appid: this.apiKey, units: 'metric', cnt: days * 8 },
      });
      return this.formatForecast(response.data);
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      throw new Error('Failed to fetch weather forecast data');
    }
  }

  async getCoordinates(cityName: string, stateCode = '', countryCode = ''): Promise<Coordinates> {
    try {
      const query = `${cityName}${stateCode ? `,${stateCode}` : ''}${countryCode ? `,${countryCode}` : ''}`;
      const response = await axios.get(`${this.geoUrl}/direct`, {
        params: { q: query, limit: 1, appid: this.apiKey },
      });

      if (response.data.length === 0) {
        throw new Error('Location not found');
      }

      const location = response.data[0];
      return {
        lat: location.lat,
        lon: location.lon,
        name: location.name,
        country: location.country,
        state: location.state,
      };
    } catch (error) {
      console.error('Error getting coordinates:', error);
      throw new Error('Failed to get location coordinates');
    }
  }

  async getLocationName(
    lat: number,
    lon: number
  ): Promise<{ name: string; country: string; state?: string }> {
    try {
      const response = await axios.get(`${this.geoUrl}/reverse`, {
        params: { lat, lon, limit: 1, appid: this.apiKey },
      });

      if (response.data.length === 0) {
        throw new Error('Location not found');
      }

      const location = response.data[0];
      return { name: location.name, country: location.country, state: location.state };
    } catch (error) {
      console.error('Error getting location name:', error);
      throw new Error('Failed to get location name');
    }
  }

  async getAgriculturalWeatherData(lat: number, lon: number): Promise<AgriculturalWeatherData> {
    try {
      const [current, forecast] = await Promise.all([
        this.getCurrentWeather(lat, lon),
        this.getWeatherForecast(lat, lon, 7),
      ]);

      return {
        current,
        forecast,
        agricultural: this.calculateAgriculturalMetrics(current, forecast),
      };
    } catch (error) {
      console.error('Error fetching agricultural weather data:', error);
      throw new Error('Failed to fetch agricultural weather data');
    }
  }

  formatCurrentWeather(data: any): CurrentWeather {
    return {
      temperature: {
        current: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        min: Math.round(data.main.temp_min),
        max: Math.round(data.main.temp_max),
      },
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      visibility: data.visibility / 1000,
      uvIndex: data.uvi || null,
      weather: {
        main: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
      },
      wind: {
        speed: data.wind.speed,
        direction: data.wind.deg,
        gust: data.wind.gust || null,
      },
      clouds: data.clouds.all,
      rain: data.rain ? data.rain['1h'] || data.rain['3h'] : 0,
      snow: data.snow ? data.snow['1h'] || data.snow['3h'] : 0,
      sunrise: new Date(data.sys.sunrise * 1000),
      sunset: new Date(data.sys.sunset * 1000),
      timestamp: new Date(data.dt * 1000),
    };
  }

  formatForecast(data: any): ForecastDay[] {
    const dailyForecasts: Record<
      string,
      {
        date: Date;
        temperatures: number[];
        humidity: number[];
        weather: Array<{ main: string; description: string; icon: string }>;
        rain: number;
        wind: number[];
      }
    > = {};

    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toDateString();

      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date: new Date(item.dt * 1000),
          temperatures: [],
          humidity: [],
          weather: [],
          rain: 0,
          wind: [],
        };
      }

      dailyForecasts[date].temperatures.push(item.main.temp);
      dailyForecasts[date].humidity.push(item.main.humidity);
      dailyForecasts[date].weather.push({
        main: item.weather[0].main,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
      });
      dailyForecasts[date].rain += item.rain ? item.rain['3h'] || 0 : 0;
      dailyForecasts[date].wind.push(item.wind.speed);
    });

    return Object.values(dailyForecasts).map((day) => ({
      date: day.date,
      temperature: {
        min: Math.round(Math.min(...day.temperatures)),
        max: Math.round(Math.max(...day.temperatures)),
        avg: Math.round(day.temperatures.reduce((a, b) => a + b, 0) / day.temperatures.length),
      },
      humidity: {
        avg: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      },
      weather: day.weather[0],
      rain: Math.round(day.rain * 10) / 10,
      wind: {
        avg: Math.round((day.wind.reduce((a, b) => a + b, 0) / day.wind.length) * 10) / 10,
      },
    }));
  }

  calculateAgriculturalMetrics(
    current: CurrentWeather,
    forecast: ForecastDay[]
  ): AgriculturalMetrics {
    const temperatures = forecast.map((day) => day.temperature.avg);
    const rainfall = forecast.reduce((sum, day) => sum + day.rain, 0);
    const avgHumidity =
      forecast.reduce((sum, day) => sum + day.humidity.avg, 0) / forecast.length;

    return {
      avgTemperature: Math.round(temperatures.reduce((a, b) => a + b, 0) / temperatures.length),
      temperatureRange: {
        min: Math.min(...forecast.map((day) => day.temperature.min)),
        max: Math.max(...forecast.map((day) => day.temperature.max)),
      },
      totalRainfall: Math.round(rainfall * 10) / 10,
      avgHumidity: Math.round(avgHumidity),
      growingDegreeDays: this.calculateGrowingDegreeDays(forecast),
      frostRisk: this.assessFrostRisk(forecast),
      droughtRisk: this.assessDroughtRisk(forecast),
      optimalPlantingConditions: this.assessPlantingConditions(current, forecast),
    };
  }

  calculateGrowingDegreeDays(forecast: ForecastDay[], baseTemp = 10): number {
    return forecast.reduce((gdd, day) => {
      const avgTemp = day.temperature.avg;
      return gdd + Math.max(0, avgTemp - baseTemp);
    }, 0);
  }

  assessFrostRisk(forecast: ForecastDay[]): 'low' | 'medium' | 'high' {
    const frostDays = forecast.filter((day) => day.temperature.min <= 0).length;
    if (frostDays === 0) return 'low';
    if (frostDays <= 2) return 'medium';
    return 'high';
  }

  assessDroughtRisk(forecast: ForecastDay[]): 'low' | 'medium' | 'high' {
    const totalRain = forecast.reduce((sum, day) => sum + day.rain, 0);
    if (totalRain >= 25) return 'low';
    if (totalRain >= 10) return 'medium';
    return 'high';
  }

  assessPlantingConditions(
    _current: CurrentWeather,
    forecast: ForecastDay[]
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    const avgTemp = forecast.reduce((sum, day) => sum + day.temperature.avg, 0) / forecast.length;
    const totalRain = forecast.reduce((sum, day) => sum + day.rain, 0);
    const frostRisk = this.assessFrostRisk(forecast);

    let score = 0;

    // Temperature score
    if (avgTemp >= 15 && avgTemp <= 25) score += 3;
    else if (avgTemp >= 10 && avgTemp <= 30) score += 2;
    else score += 1;

    // Rainfall score
    if (totalRain >= 15 && totalRain <= 40) score += 3;
    else if (totalRain >= 5 && totalRain <= 60) score += 2;
    else score += 1;

    // Frost risk score
    if (frostRisk === 'low') score += 3;
    else if (frostRisk === 'medium') score += 2;
    else score += 1;

    if (score >= 8) return 'excellent';
    if (score >= 6) return 'good';
    if (score >= 4) return 'fair';
    return 'poor';
  }
}

export default new WeatherService();
