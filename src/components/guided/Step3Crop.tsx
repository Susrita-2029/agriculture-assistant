import React, { useState } from 'react';
import { Language } from '../../types';
import { speakText } from '../../utils/speech';
import {
  Sprout,
  ArrowRight,
  CheckCircle2,
  Mic,
  Volume2,
  Sparkles,
} from 'lucide-react';

interface Step3CropProps {
  language: Language;
  selectedCrop: string;
  selectedStage: string;
  onSelectCrop: (crop: string) => void;
  onSelectStage: (stage: string) => void;
  onNext: () => void;
}

export const Step3Crop: React.FC<Step3CropProps> = ({
  language,
  selectedCrop,
  selectedStage,
  onSelectCrop,
  onSelectStage,
  onNext,
}) => {
  const [customCrop, setCustomCrop] = useState('');
  const [isOtherMode, setIsOtherMode] = useState(
    !['Groundnut', 'Wheat', 'Onion', 'Cotton', 'Maize'].includes(selectedCrop)
  );

  const crops = [
    {
      id: 'Groundnut',
      names: { en: 'Groundnut', hi: 'मूंगफली', gu: 'મગફળી' },
      emoji: '🥜',
      accent: 'border-amber-400 bg-amber-50/50',
      badge: { en: 'Oilseed', hi: 'तिलहन', gu: 'તેલીબિયાં' },
    },
    {
      id: 'Wheat',
      names: { en: 'Wheat', hi: 'गेहूं', gu: 'ઘઉં' },
      emoji: '🌾',
      accent: 'border-yellow-400 bg-yellow-50/50',
      badge: { en: 'Cereal', hi: 'अनाज', gu: 'ધાન્ય' },
    },
    {
      id: 'Onion',
      names: { en: 'Onion', hi: 'प्याज', gu: 'ડુંગળી' },
      emoji: '🧅',
      accent: 'border-rose-400 bg-rose-50/50',
      badge: { en: 'Vegetable', hi: 'सब्जी', gu: 'શાકભાજી' },
    },
    {
      id: 'Cotton',
      names: { en: 'Cotton', hi: 'कपास', gu: 'કપાસ' },
      emoji: '⚪',
      accent: 'border-stone-300 bg-stone-50/50',
      badge: { en: 'Cash Crop', hi: 'नकदी फसल', gu: 'રોકડિયો પાક' },
    },
    {
      id: 'Maize',
      names: { en: 'Maize (Corn)', hi: 'मक्का', gu: 'મકાઈ' },
      emoji: '🌽',
      accent: 'border-amber-500 bg-amber-50/50',
      badge: { en: 'Kharif/Rabi', hi: 'खरीफ/रबी', gu: 'ધાન્ય' },
    },
    {
      id: 'Other',
      names: { en: 'Other Crop', hi: 'अन्य फसल', gu: 'અન્ય પાક' },
      emoji: '➕',
      accent: 'border-emerald-400 bg-emerald-50/50',
      badge: { en: 'Custom', hi: 'कस्टम', gu: 'બીજો પાક' },
    },
  ];

  const stages = [
    {
      id: 'Sowing/Germination',
      names: { en: 'Sowing / Seedling', hi: 'बुवाई व अंकुरण', gu: 'વાવણી અને અંકુરણ' },
      desc: { en: '0 - 20 Days', hi: '0 - 20 दिन', gu: '0 - 20 દિવસ' },
      emoji: '🌱',
    },
    {
      id: 'Vegetative/Growing',
      names: { en: 'Growing / Vegetative', hi: 'विकास व बढ़वार', gu: 'વૃદ્ધિ અને વિકાસ' },
      desc: { en: 'Active Leaf & Branching', hi: 'पत्ते व शाखाएं', gu: 'પાંદડા અને ડાળીઓ' },
      emoji: '🌿',
    },
    {
      id: 'Flowering/Reproductive',
      names: { en: 'Flowering / Podding', hi: 'फूल व फल लगना', gu: 'ફૂલ અને ફળ બેસવા' },
      desc: { en: 'Bloom & Grain Filling', hi: 'दाना भराव', gu: 'દાણા ભરાવા' },
      emoji: '🌸',
    },
    {
      id: 'Maturity/Harvest',
      names: { en: 'Harvest / Maturity', hi: 'परिपक्वता व कटाई', gu: 'લણણી અને પાકવું' },
      desc: { en: 'Ripening Stage', hi: 'कटाई का समय', gu: 'કાપણી સમય' },
      emoji: '🌾',
    },
  ];

  const handleSelectCropTile = (cropId: string) => {
    if (cropId === 'Other') {
      setIsOtherMode(true);
      onSelectCrop(customCrop || 'Other Crop');
    } else {
      setIsOtherMode(false);
      onSelectCrop(cropId);
      const cropObj = crops.find((c) => c.id === cropId);
      const name = cropObj?.names[language] || cropId;
      speakText(`${name} પસંદ કર્યું`, language);
    }
  };

  const handleSelectStageTile = (stageId: string) => {
    onSelectStage(stageId);
    const stageObj = stages.find((s) => s.id === stageId);
    const name = stageObj?.names[language] || stageId;
    speakText(name, language);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 sm:p-6 max-w-2xl mx-auto w-full">
      {/* Title */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black tracking-wide uppercase border border-emerald-200">
          <Sprout className="w-3.5 h-3.5 text-emerald-600" />
          Step 3 • Crop & Stage
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          {language === 'gu'
            ? 'કયો પાક અને તબક્કો છે?'
            : language === 'hi'
            ? 'फसल और विकास अवस्था चुनें'
            : 'Select Crop & Growth Stage'}
        </h2>
        <p className="text-stone-600 text-xs sm:text-sm font-medium">
          {language === 'gu'
            ? 'તમે જે પાક વાવ્યો છે અને તેનો હાલનો તબક્કો પસંદ કરો'
            : language === 'hi'
            ? 'फसल का चुनाव करें और उसकी वर्तमान अवस्था बताएं'
            : 'Choose your crop and its growth stage for tailored advice'}
        </p>
      </div>

      <div className="farm-card relative w-full p-5 sm:p-8 space-y-6 overflow-hidden">
        {/* Corner Crop Decoration */}
        <span className="absolute top-3 right-4 text-2xl select-none opacity-30 pointer-events-none" aria-hidden="true">
          🌻
        </span>

        {/* Section 1: Crop Selection Tiles */}
        <div className="space-y-3">
          <label className="block text-sm font-black uppercase tracking-wider text-[#2E7D32]">
            {language === 'gu' ? '1. પાક પસંદ કરો' : language === 'hi' ? '1. फसल चुनें' : '1. Select Your Crop'}
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {crops.map((c) => {
              const isSelected =
                (c.id === 'Other' && isOtherMode) || (!isOtherMode && selectedCrop === c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectCropTile(c.id)}
                  className={`relative p-4 rounded-2xl border-2 text-left cursor-pointer flex flex-col justify-between min-h-[118px] transition-transform duration-200 hover:scale-105 active:scale-95 shadow-xs ${
                    isSelected
                      ? 'border-[#2E7D32] bg-[#E8F5E9] ring-2 ring-[#2E7D32]/30 shadow-md'
                      : 'border-stone-200 bg-white hover:border-[#66BB6A] hover:bg-[#FFF9EC]/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-4xl sm:text-5xl filter drop-shadow-xs">{c.emoji}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-6 h-6 text-[#2E7D32]" />
                    )}
                  </div>
                  <div className="mt-2">
                    <h3 className="font-black text-stone-900 text-[18px] sm:text-xl leading-tight">
                      {c.names[language]}
                    </h3>
                    <p className="text-xs font-bold text-stone-500 mt-0.5">
                      {c.names.en} • {c.badge[language]}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* If "Other" chosen, show text input */}
          {isOtherMode && (
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2 mt-2">
              <label className="block text-sm font-bold text-emerald-900">
                {language === 'gu'
                  ? 'અન્ય પાકનું નામ લખો (દા.ત. જીરું, વરિયાળી, કેળા, ટામેટા)'
                  : language === 'hi'
                  ? 'अन्य फसल का नाम लिखें (जैसे जीरा, सरसों, टमाटर)'
                  : 'Enter other crop name (e.g. Cumin, Mustard, Tomato)'}
              </label>
              <input
                type="text"
                value={customCrop}
                onChange={(e) => {
                  setCustomCrop(e.target.value);
                  onSelectCrop(e.target.value || 'Other Crop');
                }}
                placeholder="Type crop name..."
                className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-base font-bold text-stone-800 focus:outline-emerald-600"
              />
            </div>
          )}
        </div>

        {/* Section 2: 4-Tile Growth Stage Picker */}
        <div className="space-y-3 pt-2 border-t border-stone-100">
          <label className="block text-sm font-black uppercase tracking-wider text-[#2E7D32]">
            {language === 'gu'
              ? '2. પાકનો વિકાસ તબક્કો પસંદ કરો'
              : language === 'hi'
              ? '2. फसल की वर्तमान अवस्था चुनें'
              : '2. Select Growth Stage'}
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {stages.map((st) => {
              const isSelected = selectedStage === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleSelectStageTile(st.id)}
                  className={`p-3 rounded-2xl border-2 text-center cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-transform duration-200 hover:scale-105 active:scale-95 min-h-[105px] ${
                    isSelected
                      ? 'border-[#2E7D32] bg-[#E8F5E9] ring-2 ring-[#2E7D32]/30 shadow-xs'
                      : 'border-stone-200 bg-stone-50 hover:border-[#66BB6A] hover:bg-white'
                  }`}
                >
                  <span className="text-3xl">{st.emoji}</span>
                  <div>
                    <h4 className="font-black text-stone-900 text-sm sm:text-base leading-tight">
                      {st.names[language]}
                    </h4>
                    <span className="text-xs text-stone-500 font-bold block mt-0.5">
                      {st.desc[language]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Big Tactile Pill Continue Button (at least 56px) */}
        <button
          type="button"
          onClick={onNext}
          className="w-full min-h-[56px] py-4 px-6 rounded-full btn-farm-primary text-white font-black text-[18px] flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>
            {language === 'gu'
              ? 'આગળ: પાકની સમસ્યા જણાવો →'
              : language === 'hi'
              ? 'आगे: फसल की समस्या बताएं →'
              : 'Continue: Describe Crop Problem →'}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
