import React, { useState } from 'react';
import { Language } from '../../types';
import { t } from '../../services/i18nService';
import { reverseGeocodeCoordinates, DetectedLocation } from '../../services/reverseGeocodeService';
import { speakText } from '../../utils/speech';
import agriData from '../../data/agriData.json';
import {
  MapPin,
  CheckCircle2,
  Navigation,
  Edit2,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Volume2,
  Compass,
} from 'lucide-react';

interface Step2LocationProps {
  language: Language;
  location: {
    village: string;
    district: string;
    state: string;
    latitude?: number;
    longitude?: number;
    isDetectedLive: boolean;
  };
  onChangeLocation: (loc: {
    village: string;
    district: string;
    state: string;
    latitude?: number;
    longitude?: number;
    isDetectedLive: boolean;
  }) => void;
  onNext: () => void;
}

export const Step2Location: React.FC<Step2LocationProps> = ({
  language,
  location,
  onChangeLocation,
  onNext,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showManualPicker, setShowManualPicker] = useState(false);

  // Translations helper
  const text = {
    title: {
      en: 'Where is your farm?',
      hi: 'आपका खेत कहाँ स्थित है?',
      gu: 'તમારું ખેતર ક્યાં આવેલું છે?',
    }[language],
    subtitle: {
      en: 'We connect live weather and local soil advice to your exact location.',
      hi: 'हम आपके सटीक स्थान के अनुसार लाइव मौसम और मिट्टी की सलाह जोड़ते हैं।',
      gu: 'અમે તમારા સાચા સ્થાન મુજબ લાઈવ હવામાન અને જમીનની સલાહ જોડીએ છીએ.',
    }[language],
    btnUseLocation: {
      en: '📍 Use My Location (GPS)',
      hi: '📍 मेरा स्थान उपयोग करें (GPS)',
      gu: '📍 મારું સ્થાન મેળવો (GPS)',
    }[language],
    detecting: {
      en: 'Finding your farm coordinates with GPS...',
      hi: 'जीपीएस से आपके खेत का स्थान खोज रहे हैं...',
      gu: 'જીપીએસથી તમારા ખેતરનું સ્થાન શોધી રહ્યા છીએ...',
    }[language],
    detectedBadge: {
      en: 'Live GPS Location Verified',
      hi: 'लाइव जीपीएस स्थान सत्यापित',
      gu: 'લાઈવ જીપીએસ સ્થાન ચકાસાયેલ',
    }[language],
    changeBtn: {
      en: 'Change / Select Manually',
      hi: 'स्थान बदलें / मैन्युअल चुनें',
      gu: 'સ્થાન બદલો / જાતે પસંદ કરો',
    }[language],
    continueBtn: {
      en: 'Continue to Crop Selection →',
      hi: 'फसल चुनने के लिए आगे बढ़ें →',
      gu: 'પાક પસંદગી માટે આગળ વધો →',
    }[language],
    manualHeading: {
      en: 'Select State & District Manually',
      hi: 'राज्य और जिला मैन्युअल चुनें',
      gu: 'રાજ્ય અને જિલ્લો જાતે પસંદ કરો',
    }[language],
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage(
        language === 'gu'
          ? 'આ ઉપકરણમાં જીપીએસ ઉપલબ્ધ નથી. કૃપા કરીને નીચેથી જિલ્લો પસંદ કરો.'
          : language === 'hi'
          ? 'इस उपकरण में जीपीएस उपलब्ध नहीं है। कृपया नीचे से जिला चुनें।'
          : 'Geolocation is not supported by your browser. Please select below.'
      );
      setShowManualPicker(true);
      return;
    }

    setIsLocating(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const detected: DetectedLocation = await reverseGeocodeCoordinates(lat, lon);

          onChangeLocation({
            village: detected.village,
            district: detected.district,
            state: detected.state,
            latitude: lat,
            longitude: lon,
            isDetectedLive: true,
          });

          setIsLocating(false);
          setShowManualPicker(false);

          const announce =
            language === 'gu'
              ? `સ્થાન મળ્યું: ${detected.village}, જિલ્લો ${detected.district}.`
              : language === 'hi'
              ? `स्थान मिल गया: ${detected.village}, जिला ${detected.district}.`
              : `Farm location detected: ${detected.village}, ${detected.district}, ${detected.state}.`;
          speakText(announce, language);
        } catch (err: any) {
          console.error('Reverse geocode error:', err);
          setIsLocating(false);
          setErrorMessage(
            language === 'gu'
              ? 'સ્થાન શોધવામાં સમસ્યા થઈ. કૃપા કરીને નીચેથી જિલ્લો પસંદ કરો.'
              : language === 'hi'
              ? 'स्थान पहचानने में समस्या आई। कृपया नीचे से जिला चुनें।'
              : 'Could not resolve address. Please choose your district manually.'
          );
          setShowManualPicker(true);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
        setErrorMessage(
          language === 'gu'
            ? 'જીપીએસ પરવાનગી નકારી અથવા સમય સમાપ્ત થયો. નીચેથી જિલ્લો પસંદ કરો.'
            : language === 'hi'
            ? 'जीपीएस अनुमति नहीं मिली। कृपया नीचे दिए गए विकल्पों से जिला चुनें।'
            : 'GPS permission denied or timed out. Please choose your location below.'
        );
        setShowManualPicker(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      }
    );
  };

  const states = Object.keys(agriData.states);
  const currentDistricts = (agriData.states as any)[location.state]?.districts || ['Rajkot'];

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 sm:p-6 max-w-xl mx-auto w-full">
      {/* Title */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black tracking-wide uppercase border border-emerald-200">
          <Navigation className="w-3.5 h-3.5 text-emerald-600" />
          Step 2 • Location
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          {text.title}
        </h2>
        <p className="text-stone-600 text-xs sm:text-sm font-medium max-w-md mx-auto">
          {text.subtitle}
        </p>
      </div>

      {/* Main GPS Card */}
      <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
        {/* Big GPS Button */}
        <button
          type="button"
          onClick={handleGetLocation}
          disabled={isLocating}
          className={`w-full py-5 px-6 rounded-2xl font-black text-lg sm:text-xl flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md active:scale-98 ${
            isLocating
              ? 'bg-amber-500 text-white animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25'
          }`}
        >
          {isLocating ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>{text.detecting}</span>
            </>
          ) : (
            <>
              <Compass className="w-6 h-6 text-amber-300" />
              <span>{text.btnUseLocation}</span>
            </>
          )}
        </button>

        {/* Error notification if GPS failed */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Detected Location Status Display */}
        <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-stone-500">
              {location.isDetectedLive ? text.detectedBadge : 'Current Selection'}
            </span>
            {location.isDetectedLive && (
              <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Live GPS
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold">
              <MapPin className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-black text-stone-900 leading-tight">
                {location.village && location.village !== 'Village / Area'
                  ? `${location.village}, `
                  : ''}
                {location.district}
              </h3>
              <p className="text-xs font-bold text-stone-500">
                {location.state}, India
                {location.latitude && location.longitude && (
                  <span className="text-[10px] text-stone-400 ml-2">
                    ({location.latitude.toFixed(3)}°N, {location.longitude.toFixed(3)}°E)
                  </span>
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowManualPicker(!showManualPicker)}
              className="px-3 py-2 rounded-xl bg-stone-200/80 hover:bg-stone-300 text-stone-700 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{showManualPicker ? 'Hide' : 'Change'}</span>
            </button>
          </div>
        </div>

        {/* Manual Fallback Dropdown Form */}
        {showManualPicker && (
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900">
              {text.manualHeading}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  State / રાજ્ય / राज्य
                </label>
                <select
                  value={location.state}
                  onChange={(e) => {
                    const newState = e.target.value;
                    const districts = (agriData.states as any)[newState]?.districts || [];
                    onChangeLocation({
                      ...location,
                      state: newState,
                      district: districts[0] || 'District',
                      village: 'Local Area',
                      isDetectedLive: false,
                    });
                  }}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-bold text-stone-800 focus:outline-emerald-600 cursor-pointer"
                >
                  {states.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  District / જિલ્લો / जिला
                </label>
                <select
                  value={location.district}
                  onChange={(e) => {
                    onChangeLocation({
                      ...location,
                      district: e.target.value,
                      village: 'Local Area',
                      isDetectedLive: false,
                    });
                  }}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-bold text-stone-800 focus:outline-emerald-600 cursor-pointer"
                >
                  {currentDistricts.map((dst: string) => (
                    <option key={dst} value={dst}>
                      {dst}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Village / Town (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Jasdan, Gondal, Dhoraji..."
                value={location.village === 'Local Area' || location.village === 'Village / Area' ? '' : location.village}
                onChange={(e) =>
                  onChangeLocation({
                    ...location,
                    village: e.target.value || 'Local Area',
                  })
                }
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-medium text-stone-800 focus:outline-emerald-600"
              />
            </div>
          </div>
        )}

        {/* Big Next Button */}
        <button
          type="button"
          onClick={onNext}
          className="w-full min-h-[56px] py-4 px-6 rounded-full btn-farm-primary text-white font-black text-[18px] flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>{text.continueBtn}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
