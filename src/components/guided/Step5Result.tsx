import React, { useState } from 'react';
import {
  Language,
  GuidedSolutionResponse,
  SavedAdvisoryRecord,
} from '../../types';
import { LiveWeatherData } from '../../services/liveWeatherService';
import { speakText, stopSpeaking } from '../../utils/speech';
import { KisanBhai } from '../KisanBhai';
import {
  AlertCircle,
  CloudRain,
  Wind,
  CheckCircle2,
  Calendar,
  ShieldAlert,
  PhoneCall,
  Volume2,
  VolumeX,
  BookmarkPlus,
  RotateCcw,
  Sparkles,
  Droplets,
  HelpCircle,
  Share2,
  Printer,
  TrendingDown,
  Info,
  Layers,
} from 'lucide-react';

interface Step5ResultProps {
  language: Language;
  solution: GuidedSolutionResponse;
  liveWeather: LiveWeatherData | null;
  crop: string;
  stage: string;
  locationStr: string;
  onStartOver: () => void;
  onSaveRecord: (record: SavedAdvisoryRecord) => void;
}

export const Step5Result: React.FC<Step5ResultProps> = ({
  language,
  solution,
  liveWeather,
  crop,
  stage,
  locationStr,
  onStartOver,
  onSaveRecord,
}) => {
  const [activeSpeechKey, setActiveSpeechKey] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleSpeakSection = (key: string, text: string) => {
    if (activeSpeechKey === key) {
      stopSpeaking();
      setActiveSpeechKey(null);
    } else {
      setActiveSpeechKey(key);
      speakText(
        text,
        language,
        () => setActiveSpeechKey(key),
        () => setActiveSpeechKey(null)
      );
    }
  };

  const handleSave = () => {
    const newRecord: SavedAdvisoryRecord = {
      id: `sol_${Date.now()}`,
      timestamp: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      crop,
      district: locationStr.split(',')[1]?.trim() || locationStr,
      state: locationStr.split(',')[2]?.trim() || 'India',
      stage,
      status:
        solution.whatIsWrong.confidence === 'High'
          ? 'Attention Needed'
          : 'Moderate',
      summary: `${solution.whatIsWrong.possibleIssue}: ${solution.whatToDoNow[0] || ''}`,
    };
    onSaveRecord(newRecord);
    setIsSaved(true);
  };

  // Full summary read text
  const fullTextToRead = `
    ${crop} diagnosis: ${solution.whatIsWrong.possibleIssue}.
    Symptoms: ${solution.whatIsWrong.visibleSymptoms.join(', ')}.
    Immediate action: ${solution.whatToDoNow.join('. ')}.
    Weather advice: ${solution.weatherImpact.sprayAdvice}.
    Consult Kisan Call Center toll-free at 1800 180 1551.
  `;

  return (
    <div className="min-h-[calc(100vh-80px)] py-6 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-6">
      {/* Top Banner & Actions */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-stone-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/60 backdrop-blur-md text-emerald-200 text-xs font-black uppercase tracking-wider border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Verified Agricultural Diagnosis
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {crop} • {solution.whatIsWrong.possibleIssue}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200 font-medium">
              📍 {locationStr} • Stage: {stage}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Read Aloud Button */}
            <button
              onClick={() => handleSpeakSection('all', fullTextToRead)}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 cursor-pointer transition shadow-sm ${
                activeSpeechKey === 'all'
                  ? 'bg-amber-400 text-stone-900 animate-pulse'
                  : 'bg-white text-stone-900 hover:bg-emerald-100'
              }`}
            >
              {activeSpeechKey === 'all' ? (
                <>
                  <VolumeX className="w-4 h-4 text-stone-900" />
                  <span>Stop Voice</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-700" />
                  <span>🔊 Read Whole Advisory</span>
                </>
              )}
            </button>

            {/* Save to History Button */}
            <button
              onClick={handleSave}
              disabled={isSaved}
              className={`px-3.5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border ${
                isSaved
                  ? 'bg-emerald-800/80 text-emerald-200 border-emerald-600'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              <BookmarkPlus className="w-4 h-4 text-emerald-300" />
              <span>{isSaved ? '✓ Saved' : 'Save Record'}</span>
            </button>

            {/* Start Over Button */}
            <button
              onClick={onStartOver}
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/20 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-amber-300" />
              <span>New Problem</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kisan Bhai Thumbs-Up Companion Card */}
      <div className="farm-card p-5 sm:p-6 bg-gradient-to-r from-[#FFF9EC] via-white to-[#E8F5E9]/50 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
        <span className="absolute top-2 right-3 text-2xl select-none opacity-30 pointer-events-none">
          🌾
        </span>
        <KisanBhai
          variant="thumbsup"
          language={language}
          customGreeting={
            language === 'gu'
              ? 'શાબાશ ખેડૂત મિત્ર! તમારા પાકનું નિદાન અને ૭ દિવસનો સમયપત્રક તૈયાર છે.'
              : language === 'hi'
              ? 'शाबाश किसान साथी! आपकी फसल का सही निदान और 7 दिन की कार्ययोजना तैयार है।'
              : 'Well done! Here is your verified crop diagnosis and 7-day field plan.'
          }
          customTip={
            language === 'gu'
              ? 'સંપૂર્ણ સલાહ સાંભળવા મને અથવા ઉપર સ્પીકર બટન દબાવો.'
              : language === 'hi'
              ? 'पूरी सलाह सुनने के लिए मुझे या ऊपर दिए गए स्पीकर बटन को दबाएं।'
              : 'Tap me or the speaker button anytime to listen to the whole guidance.'
          }
        />
      </div>

      {/* Live Weather Strip (from Open-Meteo) */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                liveWeather?.isLive ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                liveWeather?.isLive ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-stone-500">
            {liveWeather?.isLive ? 'Live Weather Station (GPS)' : 'District Baseline Weather'}
          </span>
          <span className="text-[11px] font-bold text-stone-400">
            • {liveWeather?.source}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-black text-stone-800 flex-wrap">
          <span className="flex items-center gap-1">
            🌡 {liveWeather?.temperature ?? 28}°C
          </span>
          <span className="flex items-center gap-1 text-blue-600">
            💧 {liveWeather?.humidity ?? 60}% Humidity
          </span>
          <span className="flex items-center gap-1 text-emerald-600">
            <Wind className="w-3.5 h-3.5" />
            {liveWeather?.windSpeed ?? 12} km/h
          </span>
          <span className="flex items-center gap-1 text-indigo-600">
            <CloudRain className="w-3.5 h-3.5" />
            {liveWeather?.rainProbability ?? 20}% Rain Risk
          </span>
        </div>
      </div>

      {/* CARD 1: 🦠 What is Wrong */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-black">
              🦠
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-900">
                1. What is Wrong (રોગ / સમસ્યાની ઓળખ)
              </h2>
              <span className="text-xs text-stone-500 font-bold">
                Visual & symptom diagnosis
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black border ${
                solution.whatIsWrong.confidence === 'High'
                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                  : solution.whatIsWrong.confidence === 'Medium'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-stone-100 text-stone-700 border-stone-200'
              }`}
            >
              {solution.whatIsWrong.confidence} Confidence
            </span>

            <button
              onClick={() =>
                handleSpeakSection(
                  'wrong',
                  `What is wrong: ${solution.whatIsWrong.possibleIssue}. Symptoms: ${solution.whatIsWrong.visibleSymptoms.join(', ')}`
                )
              }
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition cursor-pointer"
              title="Read aloud"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* If image/audio was unclear, display advisory banner */}
        {!solution.whatIsWrong.isInputClear && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                ⚠️ Notice: Image or audio was slightly unclear.
              </p>
              <p className="text-xs text-amber-800 mt-0.5">
                {solution.whatIsWrong.clarificationRequest ||
                  'For guaranteed accuracy, take a well-lit close-up photo of the affected leaf in daylight.'}
              </p>
            </div>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-3">
          <h3 className="text-lg font-black text-stone-900">
            {solution.whatIsWrong.possibleIssue}
          </h3>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-stone-500 block mb-1.5">
              Visible Symptoms (દેખાતા લક્ષણો):
            </span>
            <ul className="space-y-1">
              {solution.whatIsWrong.visibleSymptoms.map((sym, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs sm:text-sm font-bold text-stone-700"
                >
                  <span className="text-rose-500 font-bold">•</span>
                  <span>{sym}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CARD 2: 🌦 Weather Impact & Spray Timing */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
              🌦
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-900">
                2. Weather Impact (હવામાન અને છંટકાવનો સમય)
              </h2>
              <span className="text-xs text-stone-500 font-bold">
                Live temperature, humidity & spray window
              </span>
            </div>
          </div>

          <button
            onClick={() =>
              handleSpeakSection(
                'weather',
                `Weather impact: ${solution.weatherImpact.conditionSummary}. Spray advice: ${solution.weatherImpact.sprayAdvice}`
              )
            }
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1">
            <span className="text-xs font-black uppercase text-blue-900 block">
              Weather Influence on Disease:
            </span>
            <p className="text-xs sm:text-sm font-medium text-blue-950">
              {solution.weatherImpact.conditionSummary}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
            <span className="text-xs font-black uppercase text-amber-900 block flex items-center gap-1">
              <CloudRain className="w-3.5 h-3.5 text-amber-700" />
              Spray Timing Guidance:
            </span>
            <p className="text-xs sm:text-sm font-bold text-amber-950">
              {solution.weatherImpact.sprayAdvice}
            </p>
          </div>
        </div>
      </section>

      {/* CARD 3: ✅ What to Do Now (Numbered Steps) */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
              ✅
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-900">
                3. What To Do Now (તાત્કાલિક પગલાં)
              </h2>
              <span className="text-xs text-stone-500 font-bold">
                Simple immediate actions for today
              </span>
            </div>
          </div>

          <button
            onClick={() =>
              handleSpeakSection('now', solution.whatToDoNow.join('. '))
            }
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {solution.whatToDoNow.map((step, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-100 flex items-start gap-3"
            >
              <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="text-xs sm:text-sm font-bold text-stone-800 flex-1">
                {step}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CARD 4: 💊 Medicine Options (TWO COLUMNS: Organic vs Standard Chemical) */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-black">
              💊
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-900">
                4. Medicine & Treatment Options (દવાઓ અને સારવાર)
              </h2>
              <span className="text-xs text-stone-500 font-bold">
                Low-budget organic remedies vs Standard active ingredients
              </span>
            </div>
          </div>

          <button
            onClick={() =>
              handleSpeakSection(
                'meds',
                'Treatment options. First column: organic and low budget. Second column: standard chemical active ingredients.'
              )
            }
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Two Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Column A: Low Budget / Organic / Home Options */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 border-2 border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <span>💰</span>
                <span>Organic / Low-Budget Options</span>
              </span>
              <span className="text-[10px] font-black bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                Eco-Friendly
              </span>
            </div>

            <div className="space-y-3">
              {solution.medicineOptions.organicHomeOptions.map((opt, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white border border-emerald-100 space-y-1.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-stone-900 text-sm">
                      {opt.name || opt.activeIngredient}
                    </h4>
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {opt.costLevel}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 font-medium">
                    <strong className="text-stone-800">Purpose:</strong> {opt.purpose}
                  </p>
                  <p className="text-xs text-stone-600 font-medium">
                    <strong className="text-stone-800">Application:</strong> {opt.application}
                  </p>
                  <p className="text-[11px] text-emerald-800 font-bold bg-emerald-50/50 p-1.5 rounded-lg">
                    🛡 {opt.safetyNote}
                  </p>
                  <p className="text-[10px] text-stone-400 italic">
                    * {opt.priceNotice || 'Estimated cost level • check local shop price'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Column B: Standard Chemical Options (Active Ingredients) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/40 border-2 border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                <span>🧪</span>
                <span>Standard Chemical Options</span>
              </span>
              <span className="text-[10px] font-black bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full">
                Active Ingredient
              </span>
            </div>

            <div className="space-y-3">
              {solution.medicineOptions.chemicalOptions.map((opt, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white border border-amber-100 space-y-1.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-stone-900 text-sm">
                      {opt.activeIngredient || opt.name}
                    </h4>
                    <span className="text-xs font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {opt.costLevel}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 font-medium">
                    <strong className="text-stone-800">Purpose:</strong> {opt.purpose}
                  </p>
                  <p className="text-xs text-stone-600 font-medium">
                    <strong className="text-stone-800">Application:</strong> {opt.application}
                  </p>
                  <p className="text-[11px] text-amber-900 font-bold bg-amber-50/60 p-1.5 rounded-lg">
                    ⚠️ {opt.safetyNote}
                  </p>
                  <p className="text-[10px] text-stone-400 italic">
                    * {opt.priceNotice || 'Estimated cost level • check local shop price'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CARD 5: 🛡 Safety Precautions */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
              🛡
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-900">
                5. Safety & Protection (સુરક્ષા અને સાવચેતી)
              </h2>
              <span className="text-xs text-stone-500 font-bold">
                Health protection and harvest waiting period
              </span>
            </div>
          </div>

          <button
            onClick={() => handleSpeakSection('safety', solution.safety.join('. '))}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {solution.safety.map((safeText, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-start gap-2.5"
            >
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm font-bold text-stone-800">
                {safeText}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CARD 6: 🔁 Prevention (Next Season) */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-black">
              🔁
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-900">
                6. Prevention for Next Season (આવતા વર્ષ માટે નિવારણ)
              </h2>
              <span className="text-xs text-stone-500 font-bold">
                Seed treatment and crop rotation to stop re-occurrence
              </span>
            </div>
          </div>

          <button
            onClick={() =>
              handleSpeakSection('prevention', solution.preventionNextSeason.join('. '))
            }
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        <ul className="space-y-2">
          {solution.preventionNextSeason.map((prev, idx) => (
            <li
              key={idx}
              className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-bold text-stone-700 flex items-start gap-2"
            >
              <span className="text-teal-600 font-black">✔</span>
              <span>{prev}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* CARD 7: 📅 7-Day Plan */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-black">
              📅
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-900">
                7. 7-Day Action Plan (૭ દિવસનું સમયપત્રક)
              </h2>
              <span className="text-xs text-stone-500 font-bold">
                Day-by-day management steps
              </span>
            </div>
          </div>

          <button
            onClick={() =>
              handleSpeakSection(
                'plan',
                solution.sevenDayPlan
                  .map((p) => `${p.dayRange}: ${p.activity}`)
                  .join('. ')
              )
            }
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {solution.sevenDayPlan.map((planItem, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1"
            >
              <span className="text-xs font-black uppercase text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded-md inline-block">
                {planItem.dayRange}
              </span>
              <p className="text-xs sm:text-sm font-bold text-stone-800">
                {planItem.activity}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CARD 8: 📞 Get Expert Help & Kisan Call Centre */}
      <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-stone-50 rounded-3xl p-6 border-2 border-emerald-300 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black">
              📞
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-emerald-950">
                8. Get Expert Help (સરકારી કૃષિ સહાય)
              </h2>
              <span className="text-xs text-emerald-800 font-bold">
                Direct phone lines & Krishi Vigyan Kendra
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* KVK Box */}
          <div className="p-4 rounded-2xl bg-white border border-emerald-200 space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-900 block">
              Local Agricultural Center (KVK):
            </span>
            <p className="text-xs sm:text-sm font-medium text-stone-800">
              {solution.expertHelp.kvkAdvice}
            </p>
          </div>

          {/* Toll Free Kisan Call Centre Box with direct Call action */}
          <div className="p-4 rounded-2xl bg-white border border-emerald-200 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-900 block">
                National Kisan Call Centre (Toll-Free):
              </span>
              <p className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight mt-1">
                1800-180-1551
              </p>
              <p className="text-[11px] text-stone-500 font-bold">
                Free farmer advice in all Indian regional languages (6 AM - 10 PM)
              </p>
            </div>

            <a
              href="tel:18001801551"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm transition"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Kisan Center Free (1800-180-1551)</span>
            </a>
          </div>
        </div>
      </section>

      {/* Mandatory Disclaimer Footer */}
      <div className="p-4 rounded-2xl bg-stone-100 text-stone-500 text-xs font-medium text-center border border-stone-200">
        <p>{solution.disclaimer}</p>
      </div>

      {/* Bottom Floating Bar for New Question */}
      <div className="pt-4 flex items-center justify-center">
        <button
          onClick={onStartOver}
          className="min-h-[56px] py-4 px-8 rounded-full btn-farm-primary text-white font-black text-[18px] flex items-center gap-2 transition-all cursor-pointer shadow-lg"
        >
          <RotateCcw className="w-5 h-5 text-amber-300" />
          <span>
            {language === 'gu'
              ? 'બીજી સમસ્યા પૂછો (Ask Another Question) →'
              : language === 'hi'
              ? 'दूसरा सवाल पूछें (Ask Another Question) →'
              : 'Ask Another Crop Problem →'}
          </span>
        </button>
      </div>
    </div>
  );
};
