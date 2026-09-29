import agriData from '../data/agriData.json';
import { WeatherData } from '../types';

export interface WeatherProvider {
  getWeather(state: string, district: string): Promise<WeatherData>;
}

export class DemoWeatherProvider implements WeatherProvider {
  async getWeather(state: string, district: string): Promise<WeatherData> {
    const stateInfo = (agriData.states as any)[state];
    if (stateInfo && stateInfo.weatherPresets && stateInfo.weatherPresets[district]) {
      return stateInfo.weatherPresets[district];
    }
    return {
      temperature: 30,
      humidity: 65,
      rainfall: 0,
      wind_speed: 12,
      condition: "Partly Cloudy",
      rain_probability: 20
    };
  }
}

export const weatherService = new DemoWeatherProvider();
