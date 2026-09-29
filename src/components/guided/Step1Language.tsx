import React, { useState } from 'react';
import { Language } from '../../types';
import { speakText } from '../../utils/speech';
import { KisanBhai } from '../KisanBhai';
import { SUPPORTED_LANGUAGES, getLanguageMeta } from '../../utils/translations';
import { Volume2, Sparkles, Check, Globe2, Search } from 'lucide-react';

interface Step1LanguageProps {
  selectedLanguage: Language;
  onSelect: (lang: Language) => void;
}

export const Step1Language: React.FC<Step1LanguageProps> = ({
  selectedLanguage,
  onSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState<'all' | 'popular' | 'south' | 'north_west' | 'east'>('all');

  const filteredLanguages = SUPPORTED_LANGUAGES.filter((item) => {
    const matchesSearch =
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.region.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (regionFilter === 'all') return true;
    if (regionFilter === 'popular') return ['hi', 'en', 'gu', 'pa', 'te', 'ta'].includes(item.code);
    if (regionFilter === 'south') return ['te', 'ta', 'kn', 'ml'].includes(item.code);
    if (regionFilter === 'north_west') return ['hi', 'gu', 'pa', 'raj', 'mr'].includes(item.code);
    if (regionFilter === 'east') return ['bn', 'or'].includes(item.code);
    return true;
  });

  const activeMeta = getLanguageMeta(selectedLanguage);

  return (
    <div className="min-h-[calc(100vh-90px)] flex flex-col items-center justify-center py-6 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-6">
      {/* Kisan Bhai Welcome Mascot */}
      <div className="w-full flex justify-center">
        <KisanBhai
          variant="large"
          language={selectedLanguage}
          showAllGreetings={true}
          className="w-full"
        />
      </div>

      {/* Screen Title & Prompt */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F5E9] text-[#1B5E20] text-sm font-black uppercase tracking-wider border border-[#2E7D32]/30">
          <Sparkles className="w-4 h-4 text-[#F9A825]" />
          <span>Step 1 • પગલું ૧ • कदम १ • ਕਦਮ ੧ • దశ 1 • படி 1</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
          Choose Your Language
        </h1>
        <p className="text-[17px] sm:text-xl font-bold text-[#2E7D32]">
          अपनी भाषा चुनें • તમારી ભાષા પસંદ કરો • ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ • మీ భాషను ఎంచుకోండి
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="w-full space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          {/* Quick Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: 'All (12)' },
              { id: 'popular', label: '⭐ Popular' },
              { id: 'north_west', label: 'North & West' },
              { id: 'south', label: 'South (దక్షిణ)' },
              { id: 'east', label: 'East (পূর্ব)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRegionFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black shrink-0 transition-all cursor-pointer ${
                  regionFilter === tab.id
                    ? 'bg-[#2E7D32] text-white shadow-xs'
                    : 'bg-white text-stone-700 hover:bg-emerald-50 border border-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search language / भाषा खोजें..."
              className="w-full pl-9 pr-3 py-2 bg-white rounded-full border border-stone-200 text-sm font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            />
          </div>
        </div>

        {/* Selected Language Indicator Banner */}
        <div className="bg-[#FFF9EC] border border-[#F9A825]/40 rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{activeMeta.cropIcon}</span>
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Currently Selected • વર્તમાન પસંદગી
              </p>
              <p className="text-base sm:text-lg font-black text-stone-900">
                {activeMeta.nativeName} ({activeMeta.label}) — <span className="text-[#2E7D32] font-extrabold">{activeMeta.sublabel}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => speakText(activeMeta.readSample, activeMeta.code)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 text-[#2E7D32] border border-[#2E7D32]/30 text-xs font-black shadow-xs cursor-pointer active:scale-95"
            title="Hear sample voice"
          >
            <Volume2 className="w-4 h-4 text-[#F9A825]" />
            <span className="hidden sm:inline">Listen Sample</span>
          </button>
        </div>
      </div>

      {/* Grid of Indian Languages Cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        {filteredLanguages.map((opt) => {
          const isSelected = selectedLanguage === opt.code;
          return (
            <div
              key={opt.code}
              className={`farm-card relative rounded-2xl sm:rounded-3xl transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${
                isSelected
                  ? 'border-2 border-[#2E7D32] bg-[#E8F5E9]/50 ring-4 ring-[#2E7D32]/20'
                  : 'hover:border-[#66BB6A] hover:bg-white/95'
              }`}
            >
              {/* Corner Crop Icon */}
              <span
                className="absolute top-2.5 right-3 text-xl select-none opacity-40 pointer-events-none"
                aria-hidden="true"
              >
                {opt.cropIcon}
              </span>

              <div className="p-4 sm:p-5 flex flex-col justify-between gap-3 h-full">
                <button
                  type="button"
                  onClick={() => onSelect(opt.code)}
                  className="w-full text-left cursor-pointer flex items-start gap-3.5 focus:outline-none"
                  aria-label={`Select ${opt.nativeName} (${opt.label})`}
                >
                  <div
                    className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${opt.colorGrad} flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-sm shrink-0 border border-white`}
                  >
                    {opt.nativeName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                        {opt.nativeName}
                      </span>
                      <span className="text-xs font-bold text-stone-500">
                        ({opt.label})
                      </span>
                      <span className="text-[11px] bg-[#FFF9EC] text-[#6D4C41] font-black px-2 py-0.5 rounded-full border border-[#6D4C41]/20">
                        {opt.region}
                      </span>
                    </div>
                    <p className="text-[15px] font-extrabold text-[#2E7D32] mt-0.5">
                      {opt.sublabel}
                    </p>
                    <p className="text-xs sm:text-sm text-stone-600 font-semibold mt-0.5 line-clamp-1">
                      {opt.description}
                    </p>
                  </div>
                </button>

                {/* Bottom Action Bar */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(opt.readSample, opt.code);
                    }}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-[#FFF9EC] text-[#2E7D32] border border-[#2E7D32]/30 transition shadow-2xs cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                    title={`Listen greeting in ${opt.label}`}
                    aria-label={`Listen greeting in ${opt.label}`}
                  >
                    <Volume2 className="w-4 h-4 text-[#F9A825]" />
                    <span className="hidden sm:inline">Listen 🔊</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelect(opt.code)}
                    className={`min-h-[46px] px-5 rounded-full font-black text-sm flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'btn-farm-primary'
                        : 'bg-stone-900 hover:bg-[#2E7D32] text-white shadow-xs'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Selected</span>
                      </>
                    ) : (
                      <span>Select →</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 text-center text-xs sm:text-sm font-bold text-stone-600 flex items-center justify-center gap-2">
        <Globe2 className="w-4 h-4 text-[#2E7D32]" />
        <span>Supports 12 major Indian languages with voice read-aloud and AI translation</span>
      </div>
    </div>
  );
};
