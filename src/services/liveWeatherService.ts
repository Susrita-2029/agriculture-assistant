export interface LiveWeatherData {
  isLive: boolean;
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  condition: string;
  source: string;
  forecast: Array<{
    date: string;
    dayLabel: string;
    rainProb: number;
    maxTemp: number;
    minTemp: number;
  }>;
}

export async function fetchLiveWeather(lat: number, lon: number): Promise<LiveWeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m,weather_code&daily=precipitation_probability_max,temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Open-Meteo returned status ${res.status}`);
    }
    const data = await res.json();

    const current = data.current || {};
    const daily = data.daily || {};

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const forecast = (daily.time || []).slice(0, 3).map((tStr: string, idx: number) => {
      const d = new Date(tStr);
      const dayLabel = idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : days[d.getDay()];
      return {
        date: tStr,
        dayLabel,
        rainProb: daily.precipitation_probability_max?.[idx] ?? 0,
        maxTemp: Math.round(daily.temperature_2m_max?.[idx] ?? 30),
        minTemp: Math.round(daily.temperature_2m_min?.[idx] ?? 20),
      };
    });

    const rainProbToday = daily.precipitation_probability_max?.[0] ?? 0;
    const temp = Math.round(current.temperature_2m ?? 28);
    const humidity = Math.round(current.relative_humidity_2m ?? 60);
    const windSpeed = Math.round(current.wind_speed_10m ?? 12);

    let condition = 'Partly Cloudy';
    if (rainProbToday > 60 || (current.rain && current.rain > 0.5)) {
      condition = 'Rainy / Shower';
    } else if (temp > 35) {
      condition = 'Hot & Sunny';
    } else if (humidity > 80) {
      condition = 'Humid & Overcast';
    }

    return {
      isLive: true,
      temperature: temp,
      humidity,
      windSpeed,
      rainProbability: rainProbToday,
      condition,
      source: 'Open-Meteo (Live GPS Station)',
      forecast,
    };
  } catch (err) {
    console.warn('Live weather fetch failed, proceeding with fallback:', err);
    return {
      isLive: false,
      temperature: 28,
      humidity: 60,
      windSpeed: 12,
      rainProbability: 20,
      condition: 'Typical Seasonal Average',
      source: 'District Seasonal Baseline (Live station unavailable)',
      forecast: [
        { date: 'Day 1', dayLabel: 'Day 1', rainProb: 20, maxTemp: 31, minTemp: 22 },
        { date: 'Day 2', dayLabel: 'Day 2', rainProb: 15, maxTemp: 32, minTemp: 22 },
        { date: 'Day 3', dayLabel: 'Day 3', rainProb: 10, maxTemp: 32, minTemp: 23 },
      ],
    };
  }
}
