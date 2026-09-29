export interface LiveWeatherResult {
  success: boolean;
  isLive: boolean;
  current?: {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    weatherCode: number;
    conditionText: string;
  };
  forecast?: Array<{
    date: string;
    dayName: string;
    maxTemp: number;
    minTemp: number;
    rainProb: number;
  }>;
  error?: string;
}

const WMO_CODE_MAP: Record<number, string> = {
  0: 'Clear Sky ☀️',
  1: 'Mainly Clear 🌤️',
  2: 'Partly Cloudy ⛅',
  3: 'Overcast ☁️',
  45: 'Foggy 🌫️',
  51: 'Light Drizzle 🌦️',
  53: 'Moderate Drizzle 🌦️',
  61: 'Slight Rain 🌧️',
  63: 'Moderate Rain 🌧️',
  65: 'Heavy Rain ⛈️',
  80: 'Rain Showers 🌧️',
  95: 'Thunderstorm ⛈️',
};

export async function fetchOpenMeteoWeather(lat: number, lon: number): Promise<LiveWeatherResult> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) {
      throw new Error(`Open-Meteo returned status ${res.status}`);
    }
    const data = await res.json();

    const code = data.current?.weather_code ?? 0;
    const condition = WMO_CODE_MAP[code] || 'Partly Cloudy ⛅';

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const forecast = (data.daily?.time || []).slice(0, 3).map((dStr: string, idx: number) => {
      const dateObj = new Date(dStr);
      const dayName = days[dateObj.getDay()] || dStr;
      return {
        date: dStr,
        dayName,
        maxTemp: Math.round(data.daily?.temperature_2m_max?.[idx] ?? 30),
        minTemp: Math.round(data.daily?.temperature_2m_min?.[idx] ?? 22),
        rainProb: Math.round(data.daily?.precipitation_probability_max?.[idx] ?? 10),
      };
    });

    return {
      success: true,
      isLive: true,
      current: {
        temperature: Math.round(data.current?.temperature_2m ?? 30),
        humidity: Math.round(data.current?.relative_humidity_2m ?? 60),
        precipitation: data.current?.precipitation ?? 0,
        windSpeed: Math.round(data.current?.wind_speed_10m ?? 12),
        weatherCode: code,
        conditionText: condition,
      },
      forecast,
    };
  } catch (err: any) {
    console.warn('Live weather fetch failed:', err);
    return {
      success: false,
      isLive: false,
      error: 'Live weather service could not be reached. Continuing without live weather.',
    };
  }
}
