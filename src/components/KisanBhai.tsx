import React, { useState } from 'react';
import { Language } from '../types';
import { speakText, stopSpeaking } from '../utils/speech';
import { SUPPORTED_LANGUAGES, getLanguageMeta } from '../utils/translations';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

export type MascotVariant = 'large' | 'avatar' | 'thumbsup';

interface KisanBhaiProps {
  variant?: MascotVariant;
  language?: Language;
  showAllGreetings?: boolean;
  customGreeting?: string;
  customTip?: string;
  onClick?: () => void;
  className?: string;
  hideSpeechBubble?: boolean;
}

export const KisanBhai: React.FC<KisanBhaiProps> = ({
  variant = 'large',
  language = 'en',
  showAllGreetings = false,
  customGreeting,
  customTip,
  onClick,
  className = '',
  hideSpeechBubble = false,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Greetings mapped from supported languages
  const activeMeta = getLanguageMeta(language);
  const activeGreeting = customGreeting || activeMeta.mascotGreeting;

  const handleSpeak = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onClick) {
      onClick();
      return;
    }

    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const textToRead = customTip ? `${activeGreeting}. ${customTip}` : activeGreeting;

    setIsSpeaking(true);
    speakText(
      textToRead,
      language,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  // Avatar Variant (Header small round badge)
  if (variant === 'avatar') {
    return (
      <button
        type="button"
        onClick={handleSpeak}
        title="Kisan Bhai - Tap to listen"
        className={`group relative flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none ${className}`}
        aria-label="Kisan Bhai Avatar"
      >
        <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full p-0.5 bg-gradient-to-tr from-[#2E7D32] via-[#F9A825] to-[#66BB6A] shadow-md">
          <div className="w-full h-full rounded-full bg-[#FFF9EC] overflow-hidden flex items-center justify-center border-2 border-white">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full transform translate-y-1 scale-110"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Turban (Pagdi) */}
              <ellipse cx="50" cy="30" rx="34" ry="20" fill="#F57C00" />
              <path
                d="M18 34 C25 18, 75 18, 82 34 C78 44, 22 44, 18 34 Z"
                fill="#FF9800"
              />
              <path
                d="M32 20 C42 12, 58 12, 68 20 C62 26, 38 26, 32 20 Z"
                fill="#FFA726"
              />
              <circle cx="50" cy="24" r="5" fill="#E65100" />
              {/* Ears */}
              <circle cx="23" cy="52" r="6" fill="#C6865B" />
              <circle cx="77" cy="52" r="6" fill="#C6865B" />
              {/* Face */}
              <ellipse cx="50" cy="53" rx="27" ry="24" fill="#C6865B" />
              {/* Cheeks */}
              <circle cx="34" cy="56" r="4.5" fill="#FFA726" opacity="0.4" />
              <circle cx="66" cy="56" r="4.5" fill="#FFA726" opacity="0.4" />
              {/* Eyes */}
              <ellipse cx="38" cy="46" rx="3.5" ry="4" fill="#212121" />
              <ellipse cx="62" cy="46" rx="3.5" ry="4" fill="#212121" />
              <circle cx="39" cy="44.5" r="1.3" fill="#FFFFFF" />
              <circle cx="63" cy="44.5" r="1.3" fill="#FFFFFF" />
              {/* Eyebrows */}
              <path
                d="M33 40 Q38 37 43 40"
                stroke="#4E342E"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M57 40 Q62 37 67 40"
                stroke="#4E342E"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              {/* Nose */}
              <path
                d="M50 47 Q52 52 48 53"
                stroke="#945934"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              {/* Friendly Thick Moustache */}
              <path
                d="M50 56 C44 52, 30 54, 28 62 C34 62, 44 60, 50 58 C56 60, 66 62, 72 62 C70 54, 56 52, 50 56 Z"
                fill="#2E1C14"
              />
              {/* Warm Smile under Moustache */}
              <path
                d="M42 63 Q50 70 58 63"
                stroke="#C2185B"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="#FFFFFF"
              />
              {/* Green Kurta collar */}
              <path d="M26 77 Q50 84 74 77 L80 100 L20 100 Z" fill="#2E7D32" />
            </svg>
          </div>
        </div>
        {/* Pulsing indicator if speaking */}
        {isSpeaking && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-white" />
          </span>
        )}
      </button>
    );
  }

  // Large & Thumbsup Variant (Step 1 or Result Screen)
  const isThumbsUp = variant === 'thumbsup';

  return (
    <div
      className={`flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 ${className}`}
    >
      {/* Cartoon Farmer SVG Illustration */}
      <div
        onClick={handleSpeak}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSpeak();
          }
        }}
        title="Tap Kisan Bhai to hear greeting!"
        className="relative group cursor-pointer select-none focus:outline-none transform transition-transform hover:scale-102 active:scale-98"
        aria-label="Kisan Bhai mascot - tap to listen"
      >
        <div className="relative w-44 h-48 sm:w-56 sm:h-60 filter drop-shadow-xl">
          <svg
            viewBox="0 0 200 220"
            className="w-full h-full kisan-idle-bob"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Golden gradient for wheat */}
              <linearGradient id="wheatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF176" />
                <stop offset="50%" stopColor="#FBC02D" />
                <stop offset="100%" stopColor="#F57F17" />
              </linearGradient>
              {/* Saffron Turban Gradient */}
              <linearGradient id="turbanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFA726" />
                <stop offset="40%" stopColor="#FB8C00" />
                <stop offset="100%" stopColor="#E65100" />
              </linearGradient>
              {/* Kurta Gradient */}
              <linearGradient id="kurtaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#43A047" />
                <stop offset="100%" stopColor="#2E7D32" />
              </linearGradient>
            </defs>

            {/* --- BODY (Kurta) --- */}
            <path
              d="M50 148 C50 136, 68 132, 100 132 C132 132, 150 136, 150 148 L160 216 C160 218, 40 218, 40 216 Z"
              fill="url(#kurtaGrad)"
            />
            {/* Kurta Collar placket */}
            <path d="M96 132 L96 172 L104 172 L104 132 Z" fill="#1B5E20" />
            <circle cx="100" cy="144" r="2" fill="#E8F5E9" />
            <circle cx="100" cy="154" r="2" fill="#E8F5E9" />
            <circle cx="100" cy="164" r="2" fill="#E8F5E9" />

            {/* Left Arm holding Wheat Stalk */}
            <g className="kisan-left-arm">
              {/* Left Sleeve */}
              <path
                d="M54 142 Q36 158 38 178 Q48 184 56 168 Z"
                fill="#388E3C"
              />
              {/* Left Hand */}
              <circle cx="38" cy="178" r="8" fill="#C6865B" />
              {/* Wheat Stalk */}
              <g className="kisan-wheat-stalk" transform="translate(14, 110)">
                {/* Stem */}
                <path
                  d="M26 76 Q20 40 18 10"
                  stroke="#8D6E63"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Wheat Grains / Ear */}
                <ellipse cx="16" cy="14" rx="4.5" ry="8" transform="rotate(-18 16 14)" fill="url(#wheatGrad)" stroke="#F57F17" strokeWidth="0.8" />
                <ellipse cx="22" cy="18" rx="4.5" ry="8" transform="rotate(22 22 18)" fill="url(#wheatGrad)" stroke="#F57F17" strokeWidth="0.8" />
                <ellipse cx="15" cy="28" rx="4.5" ry="8" transform="rotate(-20 15 28)" fill="url(#wheatGrad)" stroke="#F57F17" strokeWidth="0.8" />
                <ellipse cx="23" cy="32" rx="4.5" ry="8" transform="rotate(24 23 32)" fill="url(#wheatGrad)" stroke="#F57F17" strokeWidth="0.8" />
                <ellipse cx="16" cy="42" rx="4.5" ry="8" transform="rotate(-18 16 42)" fill="url(#wheatGrad)" stroke="#F57F17" strokeWidth="0.8" />
                <ellipse cx="24" cy="46" rx="4.5" ry="8" transform="rotate(20 24 46)" fill="url(#wheatGrad)" stroke="#F57F17" strokeWidth="0.8" />
                {/* Awns / Whiskers */}
                <path d="M16 10 L10 2 M22 14 L28 4 M14 24 L6 16 M24 28 L32 20" stroke="#F9A825" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            </g>

            {/* Right Arm: Waving (Large) OR Thumbs-Up (Thumbsup variant) */}
            {isThumbsUp ? (
              <g className="kisan-thumbs-up">
                {/* Right Sleeve */}
                <path
                  d="M146 142 Q164 154 162 170 Q152 176 144 162 Z"
                  fill="#388E3C"
                />
                {/* Hand with Thumbs-up */}
                <circle cx="162" cy="168" r="8.5" fill="#C6865B" />
                {/* Thumb sticking up */}
                <path
                  d="M162 165 C162 153, 168 152, 170 156 C171 161, 166 166, 165 170 Z"
                  fill="#C6865B"
                  stroke="#945934"
                  strokeWidth="1.2"
                />
                {/* Sparkle near thumb */}
                <path
                  d="M174 148 L176 142 L178 148 L184 150 L178 152 L176 158 L174 152 L168 150 Z"
                  fill="#FBC02D"
                />
              </g>
            ) : (
              <g className="kisan-waving-arm" style={{ transformOrigin: '146px 142px' }}>
                {/* Right Sleeve raised up waving */}
                <path
                  d="M144 142 Q164 132 172 118 Q178 128 156 150 Z"
                  fill="#388E3C"
                />
                {/* Waving Hand */}
                <circle cx="174" cy="114" r="8.5" fill="#C6865B" />
                {/* Open fingers */}
                <path
                  d="M172 108 L172 102 M176 109 L178 103 M180 112 L185 107 M168 111 L165 106"
                  stroke="#C6865B"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              </g>
            )}

            {/* --- NECK --- */}
            <rect x="88" y="118" width="24" height="20" rx="6" fill="#B2734C" />

            {/* --- EARS --- */}
            <circle cx="56" cy="90" r="10" fill="#C6865B" />
            <circle cx="56" cy="90" r="5" fill="#B2734C" />
            <circle cx="144" cy="90" r="10" fill="#C6865B" />
            <circle cx="144" cy="90" r="5" fill="#B2734C" />

            {/* --- HEAD / FACE --- */}
            <ellipse cx="100" cy="92" rx="44" ry="40" fill="#C6865B" />

            {/* Rosy Cheeks */}
            <ellipse cx="72" cy="98" rx="8" ry="6" fill="#FF8A65" opacity="0.4" />
            <ellipse cx="128" cy="98" rx="8" ry="6" fill="#FF8A65" opacity="0.4" />

            {/* Eyes (With CSS Blinking) */}
            <g className="kisan-eyes" style={{ transformOrigin: '100px 82px' }}>
              {/* Left Eye */}
              <ellipse cx="80" cy="82" rx="6" ry="6.5" fill="#212121" />
              <circle cx="82" cy="79.5" r="2.2" fill="#FFFFFF" />
              <circle cx="78" cy="84" r="1" fill="#FFFFFF" />
              {/* Right Eye */}
              <ellipse cx="120" cy="82" rx="6" ry="6.5" fill="#212121" />
              <circle cx="122" cy="79.5" r="2.2" fill="#FFFFFF" />
              <circle cx="118" cy="84" r="1" fill="#FFFFFF" />
            </g>

            {/* Eyebrows */}
            <path
              d="M71 72 Q80 67 89 72"
              stroke="#3E2723"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M111 72 Q120 67 129 72"
              stroke="#3E2723"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Friendly Nose */}
            <path
              d="M100 82 Q105 91 97 93 Q94 93 93 90"
              stroke="#945934"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />

            {/* --- INDIAN FARMER MOUSTACHE (Iconic Pagdi + Moustache) --- */}
            <path
              d="M100 98 C90 92, 66 94, 62 108 C72 109, 88 105, 100 102 C112 105, 128 109, 138 108 C134 94, 110 92, 100 98 Z"
              fill="#261712"
            />

            {/* Big Warm Smile */}
            <path
              d="M86 108 Q100 120 114 108"
              stroke="#B71C1C"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="#FFFFFF"
            />

            {/* --- SAFFRON TURBAN (PAGDI) with neat traditional folds --- */}
            {/* Base lower wrap */}
            <path
              d="M48 64 C50 36, 150 36, 152 64 C148 78, 52 78, 48 64 Z"
              fill="url(#turbanGrad)"
            />
            {/* Top Swirl / Bulbous crown of pagdi */}
            <path
              d="M60 48 C66 22, 134 22, 140 48 C130 60, 70 60, 60 48 Z"
              fill="#FF9800"
            />
            {/* Folds lines */}
            <path
              d="M52 62 Q100 74 148 62"
              stroke="#E65100"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M64 48 Q100 60 136 48"
              stroke="#E65100"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M74 34 Q100 44 126 34"
              stroke="#EF6C00"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Saffron Fan / Plume (Turra / Kalgi) on top-left of pagdi */}
            <path
              d="M68 28 C64 10, 84 12, 86 28 Z"
              fill="#FFA726"
              stroke="#E65100"
              strokeWidth="1"
            />
            {/* Jewel / Medallion in center */}
            <circle cx="100" cy="54" r="6" fill="#FDD835" stroke="#F57F17" strokeWidth="1.5" />
            <circle cx="100" cy="54" r="2.5" fill="#D84315" />
          </svg>

          {/* Sound button badge on mascot corner */}
          <button
            type="button"
            onClick={handleSpeak}
            className={`absolute bottom-2 right-2 p-2.5 rounded-full border-2 border-white shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
              isSpeaking
                ? 'bg-amber-400 text-stone-900 animate-pulse'
                : 'bg-[#2E7D32] hover:bg-[#1B5E20] text-white'
            }`}
            title={isSpeaking ? 'Stop voice' : 'Listen to Kisan Bhai'}
            aria-label={isSpeaking ? 'Stop voice' : 'Listen to Kisan Bhai'}
          >
            {isSpeaking ? (
              <VolumeX className="w-5 h-5 text-stone-900" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Mascot Name Badge */}
        <div className="mt-2 flex items-center justify-center gap-1.5 bg-[#FFF9EC] text-[#2E7D32] px-3.5 py-1 rounded-full border border-[#2E7D32]/30 shadow-xs font-black text-sm tracking-wide mx-auto w-max">
          <Sparkles className="w-4 h-4 text-[#F9A825]" />
          <span>Kisan Bhai (किसान भाई / કિસાન ભાઈ)</span>
        </div>
      </div>

      {/* Speech Bubble beside him */}
      {!hideSpeechBubble && (
        <div className="relative max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-md border-2 border-[#66BB6A]/40 text-stone-800">
          {/* Triangular Tail pointing to Mascot */}
          <div className="hidden md:block absolute -left-3.5 top-10 w-0 h-0 border-t-[10px] border-t-transparent border-r-[14px] border-r-white border-b-[10px] border-b-transparent filter drop-shadow-[-2px_0_1px_rgba(102,187,106,0.4)]" />
          <div className="md:hidden absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[12px] border-b-white filter drop-shadow-[0_-2px_1px_rgba(102,187,106,0.4)]" />

          {/* Speech Content */}
          <div className="space-y-3 text-left">
            {showAllGreetings ? (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xl">🌾</span>
                  <p className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                    {activeMeta.mascotGreeting}
                  </p>
                </div>
                <div className="flex items-start gap-2 pt-1 border-t border-stone-100">
                  <span className="text-xl">🇮🇳</span>
                  <p className="text-xs sm:text-sm font-semibold text-stone-600 leading-snug">
                    12+ Indian Languages • हिंदी, ગુજરાતી, ਪੰਜਾਬੀ, বাংলা, తెలుగు, தமிழ், ಕನ್ನಡ, മലയാളം, मराठी, ଓଡ଼ିଆ, राजस्थानी
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-lg sm:text-xl font-black text-stone-900 leading-relaxed">
                  "{activeGreeting}"
                </p>
                {customTip && (
                  <p className="text-sm font-semibold text-[#2E7D32] mt-2 bg-[#FFF9EC] p-2.5 rounded-xl border border-[#2E7D32]/20">
                    💡 {customTip}
                  </p>
                )}
              </div>
            )}

            <div className="pt-2 flex items-center justify-between text-xs text-stone-500 font-bold border-t border-stone-100">
              <span className="flex items-center gap-1 text-[#2E7D32]">
                <Volume2 className="w-3.5 h-3.5 text-[#F9A825]" />
                Tap Kisan Bhai to hear voice guidance
              </span>
              <button
                type="button"
                onClick={handleSpeak}
                className="text-xs font-black text-[#2E7D32] hover:underline cursor-pointer"
              >
                {isSpeaking ? 'Stop ⏹' : 'Listen 🔊'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
