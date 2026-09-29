import React, { useState } from 'react';
import { FarmContext, RegenerativeResponse, Language } from '../types';
import { requestRegenerative } from '../services/api';
import { t } from '../services/i18nService';
import { RefreshCw, Leaf, Sparkles, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';

interface RegenerativeSectionProps {
  context: FarmContext;
  language: Language;
}

export const RegenerativeSection: React.FC<RegenerativeSectionProps> = ({ context, language }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RegenerativeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetchRegenerative = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestRegenerative(context);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch regenerative recommendations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg sm:text-xl font-extrabold text-stone-900">
              {t('regenTitle', language)}
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Tailored specifically for {context.crop} in {context.soil.type} (pH {context.soil.ph}) in {context.district}.
          </p>
        </div>

        <button
          onClick={handleFetchRegenerative}
          disabled={loading}
          className="bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-900/20 transition flex items-center gap-2 cursor-pointer w-fit"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Analyzing Agro-Ecology...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Get Tailored Practices</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {data && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data.practices.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-gradient-to-br from-emerald-50/70 to-stone-50 border border-emerald-200 rounded-2xl flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <span className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-wider bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-full inline-block">
                    {item.category}
                  </span>
                  <h4 className="text-sm font-extrabold text-stone-900 mt-2">{item.title}</h4>
                  <p className="text-xs text-emerald-950 font-medium mt-1 italic">
                    "{item.suitabilityReason}"
                  </p>
                  <div className="mt-2.5 text-xs text-stone-700">
                    <strong className="text-stone-900">How to Apply:</strong> {item.howToImplement}
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-emerald-200/80 text-[11px] text-emerald-950 font-bold">
                  <strong>Expected Impact:</strong> {item.expectedBenefit}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-950 font-medium">
            <strong className="text-teal-900 font-bold">Soil Organic Carbon Tip:</strong> {data.soilBuildingTip}
          </div>

          <div className="p-2.5 bg-stone-100 rounded-lg text-center text-[11px] text-stone-500 font-semibold flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>{data.disclaimer}</span>
          </div>
        </div>
      )}
    </div>
  );
};
