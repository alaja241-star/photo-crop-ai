import { describe, it, expect } from 'vitest';
import weatherService from '../weatherService.js';

const forecast = (temps: Array<{ min: number; max: number; avg: number }>, rains: number[]) =>
  temps.map((t, i) => ({
    date: new Date(),
    temperature: t,
    humidity: { avg: 50 },
    weather: { main: 'Clear', description: 'clear', icon: '01d' },
    rain: rains[i] ?? 0,
    wind: { avg: 3 },
  }));

describe('weatherService agricultural math', () => {
  it('calculates growing degree days above base temp 10', () => {
    const f = forecast([{ min: 5, max: 25, avg: 15 }, { min: 8, max: 22, avg: 12 }], [0, 0]);
    // (15-10) + (12-10) = 7
    expect(weatherService.calculateGrowingDegreeDays(f)).toBe(7);
  });

  it('flags high frost risk when 3+ days hit freezing', () => {
    const f = forecast(
      [{ min: 0, max: 5, avg: 2 }, { min: -1, max: 4, avg: 1 }, { min: 0, max: 3, avg: 1 }],
      [0, 0, 0]
    );
    expect(weatherService.assessFrostRisk(f)).toBe('high');
  });

  it('flags high drought risk when total rain under 10mm', () => {
    const f = forecast([{ min: 10, max: 20, avg: 15 }], [2]);
    expect(weatherService.assessDroughtRisk(f)).toBe('high');
  });
});
