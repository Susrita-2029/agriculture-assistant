import React from 'react';
import { WeatherData, Language } from '../types';
import { t } from '../services/i18nService';
import { CloudRain, Wind, Droplets, Thermometer, Info } from 'lucide-react';

interface WeatherCardProps {
  weather: WeatherData;
  district: string;
  state: string;
  language: Language;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather, district, state, language }) => {
  return (
    <div className="bg-gradient-to-br from-sky-50 via-white to-emerald-50/40 border border-sky-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌦</span>
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                {district}, {state}
              </h3>
              <p className="text-[11px] text-stone-500 font-medium">District Micro-Meteorology</p>
            </div>
          </div>
          <span className="text-[11px] bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-semibold border border-amber-300">
            {t('demoBadge', language)}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
          <div className="bg-white/90 p-3 rounded-xl border border-sky-100 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs font-semibold">Condition</span>
              <CloudRain className="w-3.5 h-3.5 text-sky-600" />
            </div>
            <div className="text-sm font-bold text-stone-900">{weather.condition}</div>
            <div className="text-[11px] font-semibold text-sky-700 mt-0.5">{weather.rain_probability}% Rain Risk</div>
          </div>

          <div className="bg-white/90 p-3 rounded-xl border border-sky-100 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs font-semibold">Temperature</span>
              <Thermometer className="w-3.5 h-3.5 text-orange-500" />
            </div>
            <div className="text-lg font-bold text-stone-900">{weather.temperature}°C</div>
            <div className="text-[11px] text-stone-500">Daytime peak</div>
          </div>

          <div className="bg-white/90 p-3 rounded-xl border border-sky-100 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs font-semibold">Humidity</span>
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-lg font-bold text-stone-900">{weather.humidity}%</div>
            <div className="text-[11px] text-stone-500">Relative humidity</div>
          </div>

          <div className="bg-white/90 p-3 rounded-xl border border-sky-100 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs font-semibold">Rain / Wind</span>
              <Wind className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <div className="text-sm font-bold text-stone-900">{weather.rainfall} mm</div>
            <div className="text-[11px] text-stone-500">{weather.wind_speed} km/h wind</div>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-sky-100/60 flex items-center gap-1.5 text-[11px] text-stone-500">
        <Info className="w-3.5 h-3.5 text-sky-600 shrink-0" />
        <span>Synthesized automatically into the Gemini AI advisory and irrigation plan.</span>
      </div>
    </div>
  );
};
