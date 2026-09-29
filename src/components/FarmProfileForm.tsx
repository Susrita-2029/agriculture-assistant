import React from 'react';
import agriData from '../data/agriData.json';
import { FarmContext, Language } from '../types';
import { t } from '../services/i18nService';
import { Sliders, Sparkles, CheckCircle2 } from 'lucide-react';

interface FarmProfileFormProps {
  context: FarmContext;
  onChange: (updated: FarmContext) => void;
  onLoadPreset: (
    state: string,
    district: string,
    crop: string,
    stage: string,
    soilType: string,
    ph: number,
    n: 'Low' | 'Medium' | 'High',
    p: 'Low' | 'Medium' | 'High',
    k: 'Low' | 'Medium' | 'High'
  ) => void;
}

export const FarmProfileForm: React.FC<FarmProfileFormProps> = ({ context, onChange, onLoadPreset }) => {
  const states = Object.keys(agriData.states);
  const currentStateData = (agriData.states as any)[context.state] || (agriData.states as any)['Gujarat'];
  const lang = context.language;

  const handleStateChange = (newState: string) => {
    const sData = (agriData.states as any)[newState];
    const defaultDistrict = sData.districts[0];
    const defaultCrop = sData.crops[0];
    const defaultStage = sData.growthStages[0];
    const defaultSoil = sData.soilTypes[0];
    const weather = sData.weatherPresets[defaultDistrict] || context.weather;
    const satellite = sData.satellitePresets[defaultDistrict] || context.satellite;

    onChange({
      ...context,
      state: newState,
      district: defaultDistrict,
      crop: defaultCrop,
      crop_stage: defaultStage,
      soil: { ...context.soil, type: defaultSoil },
      weather,
      satellite,
    });
  };

  const handleDistrictChange = (newDistrict: string) => {
    const weather = currentStateData.weatherPresets[newDistrict] || context.weather;
    const satellite = currentStateData.satellitePresets[newDistrict] || context.satellite;
    onChange({
      ...context,
      district: newDistrict,
      weather,
      satellite,
    });
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-stone-200 gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-700" />
            {t('profileHeading', lang)}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Real farm telemetry parameters passed directly to Gemini for hyper-localized agronomic reasoning.
          </p>
        </div>

        {/* Demo Loaders */}
        <div className="flex flex-wrap items-center gap-1.5 bg-stone-50 p-1.5 rounded-xl border border-stone-200">
          <span className="text-[11px] font-bold text-stone-600 px-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {t('loadDemo', lang)}
          </span>
          <button
            type="button"
            onClick={() => onLoadPreset('Gujarat', 'Rajkot', 'Groundnut', 'Vegetative', 'Sandy Loam', 6.8, 'Medium', 'Medium', 'High')}
            className={`text-xs px-2.5 py-1 rounded-lg font-bold transition border ${
              context.state === 'Gujarat' && context.crop === 'Groundnut'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-300'
            }`}
          >
            {t('gujaratDemo', lang)}
          </button>
          <button
            type="button"
            onClick={() => onLoadPreset('Punjab', 'Ludhiana', 'Wheat', 'Tillering', 'Alluvial Loam', 7.4, 'High', 'Medium', 'Medium')}
            className={`text-xs px-2.5 py-1 rounded-lg font-bold transition border ${
              context.state === 'Punjab' && context.crop === 'Wheat'
                ? 'bg-amber-700 text-white border-amber-700 shadow-2xs'
                : 'bg-white hover:bg-amber-50 text-amber-900 border-amber-300'
            }`}
          >
            {t('punjabDemo', lang)}
          </button>
          <button
            type="button"
            onClick={() => onLoadPreset('Maharashtra', 'Nashik', 'Onion', 'Bulb Initiation', 'Deep Black Clay', 7.1, 'Low', 'Medium', 'High')}
            className={`text-xs px-2.5 py-1 rounded-lg font-bold transition border ${
              context.state === 'Maharashtra' && context.crop === 'Onion'
                ? 'bg-purple-700 text-white border-purple-700 shadow-2xs'
                : 'bg-white hover:bg-purple-50 text-purple-900 border-purple-300'
            }`}
          >
            {t('maharashtraDemo', lang)}
          </button>
          <button
            type="button"
            onClick={() => onLoadPreset('Karnataka', 'Dharwad', 'Maize', 'Knee High (V6)', 'Black Cotton', 6.9, 'Medium', 'High', 'Medium')}
            className={`text-xs px-2.5 py-1 rounded-lg font-bold transition border ${
              context.state === 'Karnataka' && context.crop === 'Maize'
                ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                : 'bg-white hover:bg-blue-50 text-blue-900 border-blue-300'
            }`}
          >
            {t('karnatakaDemo', lang)}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {/* State */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">{t('state', lang)}</label>
          <select
            value={context.state}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
          >
            {states.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">{t('district', lang)}</label>
          <select
            value={context.district}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
          >
            {currentStateData.districts.map((dst: string) => (
              <option key={dst} value={dst}>{dst}</option>
            ))}
          </select>
        </div>

        {/* Crop */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">{t('crop', lang)}</label>
          <select
            value={context.crop}
            onChange={(e) => onChange({ ...context, crop: e.target.value })}
            className="w-full bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 text-xs sm:text-sm font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
          >
            {currentStateData.crops.map((cr: string) => (
              <option key={cr} value={cr}>{cr}</option>
            ))}
          </select>
        </div>

        {/* Growth Stage */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">{t('growthStage', lang)}</label>
          <select
            value={context.crop_stage}
            onChange={(e) => onChange({ ...context, crop_stage: e.target.value })}
            className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
          >
            {currentStateData.growthStages.map((stg: string) => (
              <option key={stg} value={stg}>{stg}</option>
            ))}
          </select>
        </div>

        {/* Farm Size */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">{t('farmSize', lang)}</label>
          <input
            type="number"
            min="0.25"
            step="0.25"
            value={context.farm_size}
            onChange={(e) => onChange({ ...context, farm_size: parseFloat(e.target.value) || 1 })}
            className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Soil Type */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">{t('soilType', lang)}</label>
          <select
            value={context.soil.type}
            onChange={(e) => onChange({ ...context, soil: { ...context.soil, type: e.target.value } })}
            className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
          >
            {currentStateData.soilTypes.map((st: string) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* Soil pH */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            {t('soilPh', lang)} <span className="font-normal text-stone-400">(4.0 - 9.0)</span>
          </label>
          <input
            type="number"
            min="4.0"
            max="9.0"
            step="0.1"
            value={context.soil.ph}
            onChange={(e) => onChange({ ...context, soil: { ...context.soil, ph: parseFloat(e.target.value) || 7.0 } })}
            className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* NPK Values */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">Soil Fertility Levels (NPK)</label>
          <div className="grid grid-cols-3 gap-1.5">
            <select
              aria-label="Nitrogen level"
              value={context.soil.nitrogen}
              onChange={(e) => onChange({ ...context, soil: { ...context.soil, nitrogen: e.target.value as any } })}
              className="bg-stone-50 border border-stone-300 rounded-lg p-2 text-xs font-bold text-stone-800 focus:outline-none"
            >
              <option value="Low">N: Low</option>
              <option value="Medium">N: Med</option>
              <option value="High">N: High</option>
            </select>
            <select
              aria-label="Phosphorus level"
              value={context.soil.phosphorus}
              onChange={(e) => onChange({ ...context, soil: { ...context.soil, phosphorus: e.target.value as any } })}
              className="bg-stone-50 border border-stone-300 rounded-lg p-2 text-xs font-bold text-stone-800 focus:outline-none"
            >
              <option value="Low">P: Low</option>
              <option value="Medium">P: Med</option>
              <option value="High">P: High</option>
            </select>
            <select
              aria-label="Potassium level"
              value={context.soil.potassium}
              onChange={(e) => onChange({ ...context, soil: { ...context.soil, potassium: e.target.value as any } })}
              className="bg-stone-50 border border-stone-300 rounded-lg p-2 text-xs font-bold text-stone-800 focus:outline-none"
            >
              <option value="Low">K: Low</option>
              <option value="Medium">K: Med</option>
              <option value="High">K: High</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
