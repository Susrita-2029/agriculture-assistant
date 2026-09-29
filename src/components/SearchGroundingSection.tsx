import React, { useState } from 'react';
import { FarmContext, Language, SearchGroundingResponse } from '../types';
import { requestSearchGrounding } from '../services/api';
import { t } from '../services/i18nService';
import { Search, Globe, TrendingUp, ExternalLink, RefreshCw, AlertCircle, Sparkles, Building2 } from 'lucide-react';

interface SearchGroundingSectionProps {
  context: FarmContext;
  language: Language;
}

export const SearchGroundingSection: React.FC<SearchGroundingSectionProps> = ({ context, language }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchGroundingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetchMandi = async (customQuery?: string) => {
    setLoading(true);
    setError(null);
    const searchTarget = customQuery || query || `Current APMC mandi price and price trend for ${context.crop} in ${context.district}, ${context.state} and MSP`;

    try {
      const result = await requestSearchGrounding(
        searchTarget,
        context.state,
        context.district,
        context.crop,
        language
      );
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch search-grounded market data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="mandi-section" className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg sm:text-xl font-extrabold text-stone-900">
              {t('searchGroundingTitle', language)}
            </h2>
            <span className="text-[10px] bg-blue-50 text-blue-800 font-extrabold px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
              <Globe className="w-3 h-3 text-blue-600" />
              Google Search Grounded
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            {t('searchGroundingSubtitle', language)}
          </p>
        </div>

        <button
          onClick={() => handleFetchMandi()}
          disabled={loading}
          className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-800/20 transition flex items-center gap-2 cursor-pointer w-fit"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Querying Live Markets...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Fetch {context.crop} Mandi Rates</span>
            </>
          )}
        </button>
      </div>

      {/* Query Bar */}
      <div className="mt-4 flex gap-2 flex-col sm:flex-row">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`e.g. ${context.crop} rate in ${context.district} APMC today or latest government subsidy`}
            className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
        <button
          onClick={() => handleFetchMandi(query)}
          disabled={loading || !query.trim()}
          className="bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition cursor-pointer"
        >
          Search
        </button>
      </div>

      {/* Quick Filter Buttons */}
      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap text-xs text-stone-600">
        <span className="font-semibold text-stone-400">Quick Searches:</span>
        <button
          onClick={() => {
            const q = `Latest APMC Mandi modal price of ${context.crop} in ${context.district}, ${context.state}`;
            setQuery(q);
            handleFetchMandi(q);
          }}
          className="bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg text-stone-700 font-semibold border border-stone-200 transition cursor-pointer"
        >
          📈 {context.crop} Market Price
        </button>
        <button
          onClick={() => {
            const q = `PM-KISAN 17th/18th installment release date and beneficiary status guidelines`;
            setQuery(q);
            handleFetchMandi(q);
          }}
          className="bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg text-stone-700 font-semibold border border-stone-200 transition cursor-pointer"
        >
          🏛️ PM-KISAN Updates
        </button>
        <button
          onClick={() => {
            const q = `Pradhan Mantri Fasal Bima Yojana (PMFBY) crop insurance claim procedure for ${context.state}`;
            setQuery(q);
            handleFetchMandi(q);
          }}
          className="bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg text-stone-700 font-semibold border border-stone-200 transition cursor-pointer"
        >
          🛡️ PMFBY Insurance Info
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {data && (
        <div className="mt-4 space-y-3">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
            <div className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              Verified Market Intelligence Report (Gemini 3.5 Flash)
            </div>
            <div className="text-xs sm:text-sm text-stone-800 whitespace-pre-line leading-relaxed font-medium">
              {data.text}
            </div>
          </div>

          {/* Web Sources & Grounding Citations */}
          {data.groundingChunks && data.groundingChunks.length > 0 && (
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                Google Search Sources & Citations
              </span>
              <div className="flex flex-wrap gap-2">
                {data.groundingChunks.map((chunk, i) => {
                  if (!chunk.web?.uri) return null;
                  return (
                    <a
                      key={i}
                      href={chunk.web.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs bg-white hover:bg-emerald-50 text-emerald-900 border border-stone-200 hover:border-emerald-300 px-2.5 py-1 rounded-lg font-semibold shadow-2xs transition"
                    >
                      <ExternalLink className="w-3 h-3 text-emerald-600" />
                      <span className="truncate max-w-[200px]">{chunk.web.title || chunk.web.uri}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
