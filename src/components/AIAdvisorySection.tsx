import React, { useState } from 'react';
import { FarmContext, AdvisoryResponse, Language, SavedAdvisoryRecord } from '../types';
import { requestAdvisory } from '../services/api';
import { t } from '../services/i18nService';
import { Sparkles, Droplets, Sprout, CloudAlert, Bug, Zap, Calendar, AlertTriangle, ShieldCheck, RefreshCw, Bookmark, Check } from 'lucide-react';

interface AIAdvisorySectionProps {
  context: FarmContext;
  language: Language;
  onSaveAdvisory?: (record: SavedAdvisoryRecord) => void;
}

export const AIAdvisorySection: React.FC<AIAdvisorySectionProps> = ({ context, language, onSaveAdvisory }) => {
  const [loading, setLoading] = useState(false);
  const [advisory, setAdvisory] = useState<AdvisoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleFetchAdvisory = async () => {
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const data = await requestAdvisory(context);
      setAdvisory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch AI advisory');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (advisory && onSaveAdvisory) {
      const newRec: SavedAdvisoryRecord = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        crop: context.crop,
        district: context.district,
        state: context.state,
        stage: context.crop_stage,
        status: advisory.cropHealthStatus,
        summary: advisory.statusSummary,
      };
      onSaveAdvisory(newRec);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Good':
        return (
          <span className="bg-emerald-100 text-emerald-900 font-extrabold px-3 py-1 rounded-full text-xs border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            🌱 {status} Condition
          </span>
        );
      case 'Attention Needed':
        return (
          <span className="bg-rose-100 text-rose-900 font-extrabold px-3 py-1 rounded-full text-xs border border-rose-300 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            ⚠ {status}
          </span>
        );
      default:
        return (
          <span className="bg-amber-100 text-amber-900 font-extrabold px-3 py-1 rounded-full text-xs border border-amber-300 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
            ⚡ {status}
          </span>
        );
    }
  };

  return (
    <div id="advisory-section" className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌾</span>
            <h2 className="text-lg sm:text-xl font-extrabold text-stone-900">
              {context.crop} AI Farm Advisory
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Synthesized for {context.district}, {context.state} • Stage: {context.crop_stage} • Soil: {context.soil.type}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {advisory && onSaveAdvisory && (
            <button
              onClick={handleSave}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                saved
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
              }`}
            >
              {saved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{saved ? 'Saved to History' : 'Save Advisory'}</span>
            </button>
          )}

          <button
            onClick={handleFetchAdvisory}
            disabled={loading}
            className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-emerald-800/20 transition flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>{t('generating', language)}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>{t('generateAdvisory', language)}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs sm:text-sm flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Advisory Request Error:</strong> {error}
            <p className="text-xs text-rose-700 mt-1">
              Please verify your network connection and server status.
            </p>
          </div>
        </div>
      )}

      {advisory && (
        <div className="mt-5 space-y-4">
          {/* Status & Summary Header Card */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <span className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
                Current Crop Status Evaluation
              </span>
              {getStatusBadge(advisory.cropHealthStatus)}
            </div>
            <p className="text-xs sm:text-sm font-semibold text-stone-800 leading-relaxed">
              {advisory.statusSummary}
            </p>
          </div>

          {/* Grid of Core Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Irrigation */}
            <div className="p-4 bg-stone-50/70 border border-stone-200 rounded-2xl">
              <div className="text-sm font-extrabold text-stone-900 flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                  <Droplets className="w-4 h-4" />
                </div>
                Irrigation & Moisture Management
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
                {advisory.irrigationAdvice}
              </p>
            </div>

            {/* Soil & Nutrients */}
            <div className="p-4 bg-stone-50/70 border border-stone-200 rounded-2xl">
              <div className="text-sm font-extrabold text-stone-900 flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <Sprout className="w-4 h-4" />
                </div>
                Soil Health & NPK Nutrition
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
                {advisory.soilAndNutrientAdvice}
              </p>
            </div>
          </div>

          {/* Weather Risks & Pest Precautions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl">
              <div className="text-sm font-extrabold text-amber-950 flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                  <CloudAlert className="w-4 h-4" />
                </div>
                Weather Risk Mitigation
              </div>
              <ul className="list-disc list-inside text-xs sm:text-sm text-amber-950 space-y-1.5 font-medium">
                {advisory.weatherRisks.map((risk, idx) => (
                  <li key={idx}>{risk}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl">
              <div className="text-sm font-extrabold text-purple-950 flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-purple-100 text-purple-800">
                  <Bug className="w-4 h-4" />
                </div>
                Pest & Disease Precautions
              </div>
              <ul className="list-disc list-inside text-xs sm:text-sm text-purple-950 space-y-1.5 font-medium">
                {advisory.pestDiseasePrecautions.map((pest, idx) => (
                  <li key={idx}>{pest}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Immediate Actions & Regenerative Spotlight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50/50 border border-red-200 rounded-2xl">
              <div className="text-sm font-extrabold text-red-950 flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-red-100 text-red-800">
                  <Zap className="w-4 h-4" />
                </div>
                Immediate Action Items (Next 24-48 Hours)
              </div>
              <ul className="space-y-2">
                {advisory.immediateActions.map((act, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-stone-900 flex items-start gap-2 font-medium">
                    <span className="text-red-600 font-extrabold text-sm shrink-0">✓</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl">
              <div className="text-sm font-extrabold text-teal-950 flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-teal-100 text-teal-800">
                  <Sprout className="w-4 h-4" />
                </div>
                Regenerative Practice Spotlight
              </div>
              <p className="text-xs sm:text-sm text-teal-950 leading-relaxed font-medium">
                {advisory.regenerativeRecommendation}
              </p>
            </div>
          </div>

          {/* 7-Day Farm Activity Plan */}
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
            <h4 className="text-sm font-extrabold text-stone-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              7-Day Staged Farm Work Plan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {advisory.sevenDayPlan.map((item, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
                  <span className="text-xs font-extrabold text-emerald-800 block mb-1">
                    {item.dayRange}
                  </span>
                  <p className="text-xs text-stone-700 leading-snug font-medium">
                    {item.activity}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Warnings & Caution list */}
          {advisory.warnings && advisory.warnings.length > 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                Critical Farming Cautions:
              </span>
              <ul className="list-disc list-inside text-xs text-amber-900 space-y-1 font-medium">
                {advisory.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Mandatory Verification Disclaimer */}
          <div className="p-3 bg-stone-100 rounded-xl text-center text-xs text-stone-600 font-semibold border border-stone-300 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{advisory.disclaimer}</span>
          </div>
        </div>
      )}
    </div>
  );
};
