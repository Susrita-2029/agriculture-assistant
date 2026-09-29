import React, { useState } from 'react';
import { FarmContext, Language, MapsGroundingResponse } from '../types';
import { requestMapsGrounding } from '../services/api';
import { t } from '../services/i18nService';
import { MapPin, Building, TestTube2, Sprout, ExternalLink, RefreshCw, AlertCircle, Compass } from 'lucide-react';

interface MapsGroundingSectionProps {
  context: FarmContext;
  language: Language;
}

export const MapsGroundingSection: React.FC<MapsGroundingSectionProps> = ({ context, language }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MapsGroundingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facilityType, setFacilityType] = useState('All');

  const handleFetchPlaces = async (typeFilter = facilityType) => {
    setLoading(true);
    setError(null);
    let promptText = '';
    if (typeFilter === 'KVK') {
      promptText = `Find real Krishi Vigyan Kendra (KVK) centers and ICAR research stations located in and near ${context.district}, ${context.state}, India. Provide their names, exact location/address, and farmer training services.`;
    } else if (typeFilter === 'SoilLab') {
      promptText = `Find certified soil testing laboratories, agriculture university soil test facilities, and fertilizer quality centers in and near ${context.district}, ${context.state}, India. Provide names, location/address, and sample testing parameters.`;
    } else if (typeFilter === 'Seed') {
      promptText = `Find certified government seed distribution agencies, NSC (National Seeds Corporation) outlets, and agriculture cooperative societies in ${context.district}, ${context.state}, India.`;
    } else {
      promptText = `Find certified Krishi Vigyan Kendra (KVK), agricultural research stations, government soil testing laboratories, and APMC market yards in and near ${context.district}, ${context.state}, India. Provide their exact names, locations/addresses, and facilities.`;
    }

    try {
      const result = await requestMapsGrounding(promptText, context.state, context.district, language);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch maps-grounded location data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="kvk-section" className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg sm:text-xl font-extrabold text-stone-900">
              {t('mapsGroundingTitle', language)}
            </h2>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <Compass className="w-3 h-3 text-emerald-600" />
              Google Maps Grounded
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            {t('mapsGroundingSubtitle', language)}
          </p>
        </div>

        <button
          onClick={() => handleFetchPlaces()}
          disabled={loading}
          className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-800/20 transition flex items-center gap-2 cursor-pointer w-fit"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Locating Facilities...</span>
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              <span>Find Centers in {context.district}</span>
            </>
          )}
        </button>
      </div>

      {/* Facility Filter Pills */}
      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-stone-500">Filter Facilities:</span>
        <button
          onClick={() => {
            setFacilityType('All');
            handleFetchPlaces('All');
          }}
          className={`text-xs px-3 py-1.5 rounded-xl font-bold transition border cursor-pointer ${
            facilityType === 'All'
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
          }`}
        >
          All Centers
        </button>
        <button
          onClick={() => {
            setFacilityType('KVK');
            handleFetchPlaces('KVK');
          }}
          className={`text-xs px-3 py-1.5 rounded-xl font-bold transition border cursor-pointer flex items-center gap-1 ${
            facilityType === 'KVK'
              ? 'bg-emerald-700 text-white border-emerald-700'
              : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          Krishi Vigyan Kendras (KVK)
        </button>
        <button
          onClick={() => {
            setFacilityType('SoilLab');
            handleFetchPlaces('SoilLab');
          }}
          className={`text-xs px-3 py-1.5 rounded-xl font-bold transition border cursor-pointer flex items-center gap-1 ${
            facilityType === 'SoilLab'
              ? 'bg-blue-700 text-white border-blue-700'
              : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
          }`}
        >
          <TestTube2 className="w-3.5 h-3.5" />
          Soil Testing Laboratories
        </button>
        <button
          onClick={() => {
            setFacilityType('Seed');
            handleFetchPlaces('Seed');
          }}
          className={`text-xs px-3 py-1.5 rounded-xl font-bold transition border cursor-pointer flex items-center gap-1 ${
            facilityType === 'Seed'
              ? 'bg-amber-700 text-white border-amber-700'
              : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
          }`}
        >
          <Sprout className="w-3.5 h-3.5" />
          Seed Depots & Cooperatives
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
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              Verified Agricultural Centers in {context.district}, {context.state}
            </div>
            <div className="text-xs sm:text-sm text-stone-800 whitespace-pre-line leading-relaxed font-medium">
              {data.text}
            </div>
          </div>

          {/* Maps Grounding Places */}
          {data.groundingChunks && data.groundingChunks.length > 0 && (
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                Google Maps Verified Place References
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.groundingChunks.map((chunk, i) => {
                  if (!chunk.maps?.title && !chunk.maps?.uri) return null;
                  return (
                    <div
                      key={i}
                      className="p-2.5 bg-white border border-stone-200 rounded-xl text-xs flex items-start justify-between gap-2 shadow-2xs"
                    >
                      <div>
                        <div className="font-bold text-stone-900">{chunk.maps?.title || 'Agricultural Center'}</div>
                        {chunk.maps?.address && (
                          <div className="text-[11px] text-stone-500 mt-0.5">{chunk.maps.address}</div>
                        )}
                      </div>
                      {chunk.maps?.uri && (
                        <a
                          href={chunk.maps.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:text-emerald-800 shrink-0 p-1 hover:bg-emerald-50 rounded"
                          title="Open in Google Maps"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
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
