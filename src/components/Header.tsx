import React from 'react';
import { Language } from '../types';
import { t } from '../services/i18nService';
import { Sprout, Globe, Sparkles, Radio, TrendingUp, MapPin, Mic, Microscope } from 'lucide-react';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigate: (sectionId: string) => void;
  activeSection?: string;
}

export const Header: React.FC<HeaderProps> = ({ language, onLanguageChange, onNavigate, activeSection }) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-800 to-green-600 flex items-center justify-center text-white shadow-md shadow-emerald-800/25">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                {t('title', language)}
              </h1>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Gemini 3.8 & 3.5
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              {t('subtitle', language)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto justify-end flex-wrap overflow-x-auto pb-1 md:pb-0">
          <nav className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => onNavigate('advisory-section')}
              className="text-xs font-bold text-stone-600 hover:text-emerald-700 px-2 py-1.5 rounded-xl hover:bg-emerald-50 transition cursor-pointer flex items-center gap-1"
            >
              <span>🌾</span> Advisory
            </button>
            <button
              onClick={() => onNavigate('image-section')}
              className="text-xs font-bold text-stone-600 hover:text-emerald-700 px-2 py-1.5 rounded-xl hover:bg-emerald-50 transition cursor-pointer flex items-center gap-1"
            >
              <Microscope className="w-3.5 h-3.5 text-emerald-700" />
              Vision
            </button>
            <button
              onClick={() => onNavigate('live-voice-section')}
              className="text-xs font-extrabold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <Radio className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              Live Voice
            </button>
            <button
              onClick={() => onNavigate('mandi-section')}
              className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1"
            >
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              Mandi Search
            </button>
            <button
              onClick={() => onNavigate('kvk-section')}
              className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              Nearby KVK
            </button>
            <button
              onClick={() => onNavigate('transcribe-section')}
              className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1"
            >
              <Mic className="w-3.5 h-3.5 text-purple-600" />
              Transcribe
            </button>
          </nav>

          <div className="flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-xl border border-stone-200 shrink-0">
            <Globe className="w-3.5 h-3.5 text-stone-600" />
            <select
              aria-label="Language Selector"
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="bg-transparent text-xs font-bold text-stone-800 focus:outline-none cursor-pointer py-0.5"
            >
              <option value="en">English (EN)</option>
              <option value="hi">हिन्दी (HI)</option>
              <option value="gu">ગુજરાતી (GU)</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
