import React from 'react';
import { SatelliteData, Language } from '../types';
import { t } from '../services/i18nService';
import { Satellite, Activity, ShieldAlert, Cpu } from 'lucide-react';

interface SatelliteCardProps {
  satellite: SatelliteData;
  crop: string;
  language: Language;
}

export const SatelliteCard: React.FC<SatelliteCardProps> = ({ satellite, crop, language }) => {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛰</span>
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                Satellite Canopy & NDVI ({crop})
              </h3>
              <p className="text-[11px] text-stone-500 font-medium">Earth Observation Remote Sensing</p>
            </div>
          </div>
          <span className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-medium border border-stone-300">
            {t('satelliteBadge', language)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs font-semibold">NDVI Index</span>
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl font-extrabold text-emerald-700">{satellite.ndvi}</div>
            <p className="text-[11px] text-stone-500 mt-0.5">Vegetation density (0 to 1.0)</p>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs font-semibold">Canopy Health</span>
              <span className={`w-2.5 h-2.5 rounded-full ${
                satellite.vegetation_health === 'Optimal' ? 'bg-emerald-500' :
                satellite.vegetation_health === 'Normal' ? 'bg-green-500' : 'bg-amber-500'
              }`} />
            </div>
            <div className="text-base font-bold text-stone-900">{satellite.vegetation_health}</div>
            <p className="text-[11px] text-stone-500 mt-0.5">Multi-band reflectance</p>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs font-semibold">Crop Stress Index</span>
              <ShieldAlert className="w-3.5 h-3.5 text-stone-400" />
            </div>
            <div className="text-base font-bold text-stone-900">{satellite.crop_stress}</div>
            <p className="text-[11px] text-stone-400 mt-0.5">{satellite.last_pass}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-stone-100 flex items-center gap-1.5 text-[11px] text-stone-500">
        <Cpu className="w-3.5 h-3.5 text-stone-400 shrink-0" />
        <span>Plug-in architecture ready for Google Earth Engine Sentinel-2 Copernicus API pipelines.</span>
      </div>
    </div>
  );
};
