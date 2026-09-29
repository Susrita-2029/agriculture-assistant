import React from 'react';
import agriData from '../data/agriData.json';
import { Language } from '../types';
import { t } from '../services/i18nService';
import { Network, BarChart3, CloudLightning, ShieldAlert, Sparkles } from 'lucide-react';

interface MultiStateDashboardProps {
  language: Language;
}

export const MultiStateDashboard: React.FC<MultiStateDashboardProps> = ({ language }) => {
  const states = Object.entries(agriData.states);

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
      <div className="pb-3 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg sm:text-xl font-extrabold text-stone-900">
              {t('networkTitle', language)}
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">{t('networkSubtitle', language)}</p>
        </div>
        <span className="text-xs bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full border border-amber-300 w-fit">
          Demonstration statistics
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {states.map(([stateName, info]: any) => (
          <div
            key={stateName}
            className="p-4 bg-stone-50/70 border border-stone-200 rounded-2xl hover:border-emerald-300 transition shadow-2xs"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                {stateName}
              </h3>
              <span className="text-[11px] text-stone-500 font-semibold bg-white px-2 py-0.5 rounded border border-stone-200">
                {info.districts.join(', ')}
              </span>
            </div>

            <div className="space-y-2 text-xs text-stone-700 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-stone-500 font-medium">Key Crops:</span>
                <span className="font-bold text-stone-800">{info.crops.slice(0, 2).join(', ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500 font-medium flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                  Advisories Issued:
                </span>
                <span className="font-extrabold text-emerald-800">
                  {info.networkStats.advisoryRequests.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500 font-medium flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Disease Scans:
                </span>
                <span className="font-extrabold text-purple-800">
                  {info.networkStats.diseaseAnalyses.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500 font-medium flex items-center gap-1">
                  <CloudLightning className="w-3.5 h-3.5 text-amber-600" />
                  Weather Alerts:
                </span>
                <span className="font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {info.networkStats.weatherAlertsActive} active
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
