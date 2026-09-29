import React, { useState } from 'react';
import { Language } from '../../types';
import { t } from '../../services/i18nService';
import { speakText, stopSpeaking } from '../../utils/speech';
import { KisanBhai } from '../KisanBhai';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Menu,
  Sparkles,
} from 'lucide-react';

interface StepProgressHeaderProps {
  currentStep: number;
  totalSteps: number;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onBack: () => void;
  onOpenMore: () => void;
  readAloudText: string;
}

export const StepProgressHeader: React.FC<StepProgressHeaderProps> = ({
  currentStep,
  totalSteps,
  language,
  onLanguageChange,
  onBack,
  onOpenMore,
  readAloudText,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(
        readAloudText,
        language,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  const stepLabels: Record<Language, string[]> = {
    en: ['Language', 'Location', 'Crop', 'Problem', 'Solution'],
    hi: ['भाषा', 'स्थान', 'फसल', 'समस्या', 'समाधान'],
    gu: ['ભાષા', 'સ્થાન', 'પાક', 'સમસ્યા', 'ઉકેલ'],
  };

  // Growing seedling icons representing the stages of farm growth
  const stepGrowthIcons = [
    { icon: '🌱', label: 'Seed' },
    { icon: '🌿', label: 'Sprout' },
    { icon: '🌾', label: 'Plant' },
    { icon: '🌻', label: 'Flower' },
    { icon: '🌳', label: 'Harvest' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-b from-[#FFFDF7] via-[#FFF9EC] to-[#FFF3E0] border-b border-[#2E7D32]/20 shadow-xs relative overflow-hidden">
      {/* Background Sunrise & Slow-Drifting Clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Soft Golden Sunrise Orb */}
        <div className="absolute -top-6 left-12 w-20 h-20 rounded-full bg-gradient-to-b from-[#F9A825] to-[#FFA000] opacity-40 blur-xs" />
        <div className="absolute top-2 left-16 w-8 h-8 rounded-full bg-[#FFF176] opacity-70" />

        {/* Slow-Drifting Clouds */}
        <div className="absolute top-2 left-1/3 cloud-drifting opacity-35">
          <svg width="48" height="24" viewBox="0 0 64 32" fill="#FFFFFF">
            <path d="M10 24 A12 12 0 0 1 30 14 A14 14 0 0 1 50 16 A10 10 0 0 1 54 24 Z" />
          </svg>
        </div>
        <div className="absolute top-4 right-1/4 cloud-drifting opacity-25" style={{ animationDelay: '-6s' }}>
          <svg width="36" height="18" viewBox="0 0 64 32" fill="#FFFFFF">
            <path d="M10 24 A12 12 0 0 1 30 14 A14 14 0 0 1 50 16 A10 10 0 0 1 54 24 Z" />
          </svg>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-4xl mx-auto px-4 py-2.5 sm:px-6 relative z-10">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Back Button & Mascot / Brand */}
          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-white/90 hover:bg-white text-stone-700 text-sm font-black border border-stone-200 transition shadow-xs cursor-pointer active:scale-95"
                title={t('back', language)}
              >
                <ArrowLeft className="w-4 h-4 text-[#2E7D32]" />
                <span className="hidden sm:inline">{t('back', language)}</span>
              </button>
            )}

            {/* Kisan Bhai Avatar (Visible on header when past step 1, or brand icon on step 1) */}
            {currentStep > 1 ? (
              <div className="flex items-center gap-2">
                <KisanBhai
                  variant="avatar"
                  language={language}
                  customTip={readAloudText}
                />
                <div className="hidden xs:block">
                  <div className="flex items-center gap-1">
                    <span className="font-black text-stone-900 tracking-tight text-base sm:text-lg">
                      AgriSetu <span className="text-[#2E7D32]">AI</span>
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-[#2E7D32]">Kisan Bhai Companion</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#2E7D32] to-[#66BB6A] flex items-center justify-center text-white shadow-sm">
                  <span className="text-xl">🌾</span>
                </div>
                <div>
                  <span className="font-extrabold text-stone-900 tracking-tight text-base sm:text-lg">
                    AgriSetu <span className="text-[#2E7D32] font-black">AI</span>
                  </span>
                  <span className="text-[10px] bg-[#E8F5E9] text-[#2E7D32] font-black px-1.5 py-0.5 rounded-full ml-1.5 border border-[#2E7D32]/20">
                    Kisan
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Center: Growing Seedling Progress Icons (Desktop & Tablet) */}
          {currentStep > 1 && (
            <div className="hidden md:flex items-center gap-2 bg-white/90 px-3.5 py-1.5 rounded-full border border-[#2E7D32]/25 shadow-xs">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNum) => {
                const isActive = stepNum === currentStep;
                const isPassed = stepNum < currentStep;
                const info = stepGrowthIcons[stepNum - 1] || { icon: '🌱', label: `Step ${stepNum}` };

                return (
                  <div key={stepNum} className="flex items-center gap-1.5">
                    <div
                      className={`flex items-center justify-center rounded-full transition-all duration-300 ${
                        isActive
                          ? 'w-7 h-7 bg-[#2E7D32] text-white shadow-xs scale-110'
                          : isPassed
                          ? 'w-6 h-6 bg-[#E8F5E9] text-[#2E7D32]'
                          : 'w-6 h-6 bg-stone-100 text-stone-400 opacity-60'
                      }`}
                      title={`${info.label} (${stepLabels[language]?.[stepNum - 1]})`}
                    >
                      <span className="text-xs">{info.icon}</span>
                    </div>

                    {isActive && (
                      <span className="text-xs font-black text-[#2E7D32] tracking-wide pr-1">
                        {stepLabels[language]?.[stepNum - 1]}
                      </span>
                    )}

                    {stepNum < totalSteps && (
                      <div
                        className={`w-3 h-0.5 rounded-full ${
                          isPassed ? 'bg-[#66BB6A]' : 'bg-stone-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Right Controls: Read Aloud, Language Switcher, Expert Drawer */}
          <div className="flex items-center gap-2">
            {/* Read Aloud Button */}
            <button
              type="button"
              onClick={handleToggleSpeak}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm font-black transition shadow-xs cursor-pointer border active:scale-95 ${
                isSpeaking
                  ? 'bg-amber-300 text-stone-900 border-amber-400 animate-pulse'
                  : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
              }`}
              title={isSpeaking ? t('stopAudio', language) : t('readAloud', language)}
              aria-label={isSpeaking ? t('stopAudio', language) : t('readAloud', language)}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4 text-amber-900" />
                  <span className="hidden xs:inline">{t('stopAudio', language)}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-[#2E7D32]" />
                  <span className="hidden xs:inline">{t('readAloud', language)}</span>
                </>
              )}
            </button>

            {/* Language Quick-Toggle (Visible from Step 2 onwards) */}
            {currentStep > 1 && (
              <div className="flex items-center bg-white/90 p-0.5 rounded-full border border-stone-200 text-xs font-black shadow-xs">
                <button
                  type="button"
                  onClick={() => onLanguageChange('en')}
                  className={`px-2.5 py-1.5 rounded-full transition cursor-pointer text-xs ${
                    language === 'en'
                      ? 'bg-[#2E7D32] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => onLanguageChange('hi')}
                  className={`px-2.5 py-1.5 rounded-full transition cursor-pointer text-xs ${
                    language === 'hi'
                      ? 'bg-[#2E7D32] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  हिं
                </button>
                <button
                  type="button"
                  onClick={() => onLanguageChange('gu')}
                  className={`px-2.5 py-1.5 rounded-full transition cursor-pointer text-xs ${
                    language === 'gu'
                      ? 'bg-[#2E7D32] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  ગુ
                </button>
              </div>
            )}

            {/* Expert Tools Drawer Button */}
            <button
              type="button"
              onClick={onOpenMore}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#1B5E20] text-xs sm:text-sm font-black border border-[#2E7D32]/30 transition cursor-pointer shadow-xs active:scale-95"
              title={t('moreMenu', language)}
            >
              <Menu className="w-4 h-4 text-[#2E7D32]" />
              <span className="hidden sm:inline">{t('moreMenu', language)}</span>
            </button>
          </div>
        </div>

        {/* Mobile Growth Seedling Progress Bar (Visible on mobile for step 2+) */}
        {currentStep > 1 && (
          <div className="md:hidden mt-2 pt-2 border-t border-[#2E7D32]/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-base">{stepGrowthIcons[currentStep - 1]?.icon}</span>
              <span className="font-extrabold text-[#2E7D32]">
                {t('stepOf', language).replace('{step}', String(currentStep))}: {stepLabels[language]?.[currentStep - 1]}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s === currentStep
                      ? 'w-6 bg-[#2E7D32]'
                      : s < currentStep
                      ? 'w-2.5 bg-[#66BB6A]'
                      : 'w-2 bg-stone-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rolling Green Hills Silhouette SVG at the bottom */}
      <div className="w-full leading-none overflow-hidden h-3 sm:h-4 -mb-[1px]">
        <svg
          viewBox="0 0 1200 40"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Back lighter green rolling hill */}
          <path
            d="M0 24 Q300 6, 600 20 T1200 12 L1200 40 L0 40 Z"
            fill="#81C784"
            opacity="0.35"
          />
          {/* Front dark green rolling hill */}
          <path
            d="M0 30 Q360 14, 720 28 T1200 22 L1200 40 L0 40 Z"
            fill="#2E7D32"
            opacity="0.25"
          />
        </svg>
      </div>
    </header>
  );
};
