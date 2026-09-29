import React, { useState, useEffect } from 'react';
import agriData from './data/agriData.json';
import {
  FarmContext,
  Language,
  SavedAdvisoryRecord,
  GuidedSolutionResponse,
} from './types';
import { StepProgressHeader } from './components/guided/StepProgressHeader';
import { Step1Language } from './components/guided/Step1Language';
import { Step2Location } from './components/guided/Step2Location';
import { Step3Crop } from './components/guided/Step3Crop';
import { Step4Problem } from './components/guided/Step4Problem';
import { Step5Result } from './components/guided/Step5Result';
import { MoreToolsDrawer } from './components/guided/MoreToolsDrawer';
import { fetchLiveWeather, LiveWeatherData } from './services/liveWeatherService';
import { requestGuidedSolution } from './services/api';
import { speakText, stopSpeaking } from './utils/speech';

const LOCAL_STORAGE_KEY = 'agrisetu_saved_advisories';
const LANGUAGE_STORAGE_KEY = 'agrisetu_language_pref';

export default function App() {
  // Step State (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [language, setLanguage] = useState<Language>('en');

  // Farm Location State
  const [location, setLocation] = useState<{
    village: string;
    district: string;
    state: string;
    latitude?: number;
    longitude?: number;
    isDetectedLive: boolean;
  }>({
    village: 'Local Village',
    district: 'Rajkot',
    state: 'Gujarat',
    latitude: 22.3039,
    longitude: 70.8022,
    isDetectedLive: false,
  });

  // Crop & Stage Selection
  const [selectedCrop, setSelectedCrop] = useState<string>('Groundnut');
  const [selectedStage, setSelectedStage] = useState<string>('Vegetative/Growing');

  // Problem input & attached media
  const [problemText, setProblemText] = useState<string>('');
  const [media, setMedia] = useState<
    Array<{ data: string; mimeType: string; label: string; previewUrl?: string }>
  >([]);

  // Live Weather & Gemini Diagnosis Solution
  const [liveWeather, setLiveWeather] = useState<LiveWeatherData | null>(null);
  const [solution, setSolution] = useState<GuidedSolutionResponse | null>(null);
  const [isLoadingSolution, setIsLoadingSolution] = useState<boolean>(false);
  const [solutionError, setSolutionError] = useState<string | null>(null);

  // Drawer & Saved Records
  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
  const [savedRecords, setSavedRecords] = useState<SavedAdvisoryRecord[]>([]);

  // Background Full Farm Context for advanced expert tools
  const [context, setContext] = useState<FarmContext>({
    state: 'Gujarat',
    district: 'Rajkot',
    crop: 'Groundnut',
    crop_stage: 'Vegetative',
    farm_size: 4.5,
    soil: {
      type: 'Sandy Loam',
      ph: 6.8,
      nitrogen: 'Medium',
      phosphorus: 'Medium',
      potassium: 'High',
    },
    weather: (agriData.states as any)['Gujarat'].weatherPresets['Rajkot'],
    satellite: (agriData.states as any)['Gujarat'].satellitePresets['Rajkot'],
    language: 'en',
  });

  // Load language & saved records on start
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
      if (savedLang && ['en', 'hi', 'gu'].includes(savedLang)) {
        setLanguage(savedLang);
        setContext((c) => ({ ...c, language: savedLang }));
      }
      const records = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (records) {
        setSavedRecords(JSON.parse(records));
      }
    } catch (e) {
      console.error('Initialization error:', e);
    }
  }, []);

  // Update background context whenever location or crop changes
  useEffect(() => {
    const sData = (agriData.states as any)[location.state];
    const wPreset = sData?.weatherPresets?.[location.district] || context.weather;
    const sPreset = sData?.satellitePresets?.[location.district] || context.satellite;

    setContext((prev) => ({
      ...prev,
      state: location.state,
      district: location.district,
      crop: selectedCrop,
      crop_stage: selectedStage,
      weather: wPreset,
      satellite: sPreset,
      language,
    }));
  }, [location, selectedCrop, selectedStage, language]);

  // Handle Language Selection (Step 1)
  const handleSelectLanguage = (newLang: Language) => {
    setLanguage(newLang);
    setContext((c) => ({ ...c, language: newLang }));
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    } catch (e) {
      console.warn('Storage warning', e);
    }
    // Advance to Step 2
    setCurrentStep(2);
  };

  // Handle Location Next
  const handleLocationNext = () => {
    setCurrentStep(3);
  };

  // Handle Crop Next
  const handleCropNext = () => {
    setCurrentStep(4);
  };

  // Media Handlers
  const handleAddMedia = (item: {
    data: string;
    mimeType: string;
    label: string;
    previewUrl?: string;
  }) => {
    setMedia((prev) => [...prev, item]);
  };

  const handleRemoveMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Problem Submission -> Step 5 Solution
  const handleSubmitProblem = async () => {
    setIsLoadingSolution(true);
    setSolutionError(null);

    try {
      // 1. Fetch Live Weather from Open-Meteo
      let weatherReport: LiveWeatherData | null = null;
      if (location.latitude && location.longitude) {
        weatherReport = await fetchLiveWeather(location.latitude, location.longitude);
      } else {
        // Fallback coordinates for Rajkot
        weatherReport = await fetchLiveWeather(22.3039, 70.8022);
      }
      setLiveWeather(weatherReport);

      // 2. Call Gemini Guided Solution Endpoint
      const result = await requestGuidedSolution({
        crop: selectedCrop,
        stage: selectedStage,
        location: {
          village: location.village,
          district: location.district,
          state: location.state,
        },
        problemText,
        media: media.map((m) => ({ data: m.data, mimeType: m.mimeType })),
        liveWeather: weatherReport,
        soil: context.soil,
        language,
      });

      setSolution(result);
      setCurrentStep(5);

      // Announce arrival of result
      const announce =
        language === 'gu'
          ? `નિદાન તૈયાર છે: ${result.whatIsWrong.possibleIssue}`
          : language === 'hi'
          ? `निदान तैयार है: ${result.whatIsWrong.possibleIssue}`
          : `Diagnosis ready: ${result.whatIsWrong.possibleIssue}`;
      speakText(announce, language);
    } catch (err: any) {
      console.warn('Diagnosis error notice:', err?.message || err);
      setSolutionError(
        language === 'gu'
          ? 'નિદાન પ્રક્રિયામાં ક્ષતિ આવી. કૃપા કરીને ઇન્ટરનેટ તપાસી ફરી પ્રયાસ કરો.'
          : language === 'hi'
          ? 'निदान प्रक्रिया में समस्या आई। कृपया इंटरनेट जांचकर पुनः प्रयास करें।'
          : (err.message || 'Failed to complete crop diagnosis. Please retry.')
      );
    } finally {
      setIsLoadingSolution(false);
    }
  };

  // Start Over handler
  const handleStartOver = () => {
    stopSpeaking();
    setProblemText('');
    setMedia([]);
    setSolution(null);
    setCurrentStep(4); // Keep verified crop and location, start fresh problem
  };

  // Back Button Navigation
  const handleBack = () => {
    stopSpeaking();
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  // Preset loader for More Drawer
  const handleLoadPreset = (
    state: string,
    district: string,
    crop: string,
    stage: string,
    soilType: string,
    ph: number,
    n: 'Low' | 'Medium' | 'High',
    p: 'Low' | 'Medium' | 'High',
    k: 'Low' | 'Medium' | 'High'
  ) => {
    const sData = (agriData.states as any)[state];
    setLocation({
      village: 'Demo Farm Area',
      district,
      state,
      isDetectedLive: false,
    });
    setSelectedCrop(crop);
    setSelectedStage(stage);
    setContext({
      state,
      district,
      crop,
      crop_stage: stage,
      farm_size: context.farm_size,
      soil: {
        type: soilType,
        ph,
        nitrogen: n,
        phosphorus: p,
        potassium: k,
      },
      weather: sData.weatherPresets[district],
      satellite: sData.satellitePresets[district],
      language,
    });
  };

  // Saved records handlers
  const handleSaveAdvisoryRecord = (newRecord: SavedAdvisoryRecord) => {
    setSavedRecords((prev) => {
      const updated = [newRecord, ...prev];
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Save error', e);
      }
      return updated;
    });
  };

  const handleRemoveRecord = (id: string) => {
    setSavedRecords((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Delete error', e);
      }
      return updated;
    });
  };

  const handleClearRecords = () => {
    setSavedRecords([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error('Clear error', e);
    }
  };

  // Determine header read-aloud prompt text per step
  const getStepReadAloudText = (): string => {
    switch (currentStep) {
      case 1:
        return language === 'gu'
          ? 'કૃષિ સેતુ AI માં આપનું સ્વાગત છે. તમારી ભાષા પસંદ કરો.'
          : language === 'hi'
          ? 'कृषि सेतु AI में आपका स्वागत है। अपनी भाषा चुनें।'
          : 'Welcome to AgriSetu AI. Please choose your preferred language.';
      case 2:
        return language === 'gu'
          ? 'તમારું ખેતર ક્યાં આવેલું છે? સાચું હવામાન મેળવવા મારું સ્થાન બટન દબાવો.'
          : language === 'hi'
          ? 'आपका खेत कहाँ है? लाइव मौसम के लिए मेरा स्थान बटन दबाएं।'
          : 'Where is your farm? Tap Use My Location to connect live GPS weather.';
      case 3:
        return language === 'gu'
          ? `તમે કયો પાક વાવ્યો છે અને તેનો હાલનો વિકાસ તબક્કો પસંદ કરો.`
          : language === 'hi'
          ? `फसल चुनें और उसकी वर्तमान विकास अवस्था का चयन करें।`
          : `Select your crop and its growth stage to receive accurate treatment.`;
      case 4:
        return language === 'gu'
          ? `પાકમાં શું સમસ્યા છે? તમે ફોટો પાડી શકો છો, બોલી શકો છો, અથવા લખી શકો છો.`
          : language === 'hi'
          ? `फसल में क्या समस्या है? आप फोटो ले सकते हैं, बोल सकते हैं, या लिख सकते हैं।`
          : `Describe your crop problem using photo, voice, video, or text.`;
      case 5:
        return solution
          ? `${selectedCrop} નિદાન: ${solution.whatIsWrong.possibleIssue}. ${solution.whatToDoNow[0] || ''}`
          : 'Crop diagnosis result.';
      default:
        return 'AgriSetu AI Farmer Assistant.';
    }
  };

  const locationSummary = [location.village, location.district, location.state]
    .filter((v) => v && v !== 'Local Village')
    .join(', ');

  return (
    <div className="min-h-screen bg-[#FFF9EC] text-stone-900 flex flex-col font-['Nunito','Poppins','Noto_Sans_Devanagari','Noto_Sans_Gujarati',sans-serif] selection:bg-emerald-200 relative overflow-x-hidden">
      {/* Background scattered low-opacity agricultural icons (approx 10% opacity, non-distracting) */}
      <div className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0 opacity-10">
        <span className="absolute top-16 left-6 text-5xl">🌾</span>
        <span className="absolute top-24 right-8 text-5xl">🌻</span>
        <span className="absolute top-1/3 left-4 text-4xl">🍅</span>
        <span className="absolute top-1/3 right-6 text-4xl">🌶️</span>
        <span className="absolute top-1/2 left-8 text-4xl">🥜</span>
        <span className="absolute top-1/2 right-10 text-4xl">🌽</span>
        <span className="absolute bottom-32 left-6 text-5xl">🧅</span>
        <span className="absolute bottom-36 right-8 text-5xl">🥭</span>
        <span className="absolute bottom-10 left-16 text-4xl">🍌</span>
        <span className="absolute bottom-12 right-20 text-4xl">🌿</span>
      </div>

      {/* Top Guided Progress Header */}
      <StepProgressHeader
        currentStep={currentStep}
        totalSteps={5}
        language={language}
        onLanguageChange={setLanguage}
        onBack={handleBack}
        onOpenMore={() => setIsMoreOpen(true)}
        readAloudText={getStepReadAloudText()}
      />

      {/* Main Guided Screen Area */}
      <main className="flex-1 flex flex-col items-center justify-center w-full">
        {currentStep === 1 && (
          <Step1Language
            selectedLanguage={language}
            onSelect={handleSelectLanguage}
          />
        )}

        {currentStep === 2 && (
          <Step2Location
            language={language}
            location={location}
            onChangeLocation={setLocation}
            onNext={handleLocationNext}
          />
        )}

        {currentStep === 3 && (
          <Step3Crop
            language={language}
            selectedCrop={selectedCrop}
            selectedStage={selectedStage}
            onSelectCrop={setSelectedCrop}
            onSelectStage={setSelectedStage}
            onNext={handleCropNext}
          />
        )}

        {currentStep === 4 && (
          <Step4Problem
            language={language}
            crop={selectedCrop}
            stage={selectedStage}
            problemText={problemText}
            onChangeProblemText={setProblemText}
            media={media}
            onAddMedia={handleAddMedia}
            onRemoveMedia={handleRemoveMedia}
            onSubmit={handleSubmitProblem}
            isLoading={isLoadingSolution}
            errorMessage={solutionError}
          />
        )}

        {currentStep === 5 && solution && (
          <Step5Result
            language={language}
            solution={solution}
            liveWeather={liveWeather}
            crop={selectedCrop}
            stage={selectedStage}
            locationStr={locationSummary || `${location.district}, ${location.state}`}
            onStartOver={handleStartOver}
            onSaveRecord={handleSaveAdvisoryRecord}
          />
        )}
      </main>

      {/* Slide-Over Drawer for Expert & Power Tools (Farm Profile, Live Voice, Mandi, KVK, Multi-State) */}
      <MoreToolsDrawer
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        language={language}
        context={context}
        onContextChange={setContext}
        onLoadPreset={handleLoadPreset}
        savedRecords={savedRecords}
        onRemoveRecord={handleRemoveRecord}
        onClearRecords={handleClearRecords}
      />
    </div>
  );
}
