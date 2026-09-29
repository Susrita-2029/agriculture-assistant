export type Language =
  | 'en' // English
  | 'hi' // Hindi
  | 'gu' // Gujarati
  | 'pa' // Punjabi
  | 'bn' // Bengali
  | 'te' // Telugu
  | 'ta' // Tamil
  | 'kn' // Kannada
  | 'ml' // Malayalam
  | 'mr' // Marathi
  | 'or' // Odia
  | 'raj'; // Rajasthani

export interface SoilProfile {
  type: string;
  ph: number;
  nitrogen: 'Low' | 'Medium' | 'High';
  phosphorus: 'Low' | 'Medium' | 'High';
  potassium: 'Low' | 'Medium' | 'High';
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
  condition: string;
  rain_probability: number;
}

export interface SatelliteData {
  ndvi: number;
  vegetation_health: 'Optimal' | 'Normal' | 'Moderate Stress' | 'High Stress';
  crop_stress: 'Low' | 'Moderate' | 'High';
  last_pass: string;
}

export interface FarmContext {
  state: string;
  district: string;
  crop: string;
  crop_stage: string;
  farm_size: number;
  soil: SoilProfile;
  weather: WeatherData;
  satellite: SatelliteData;
  language: Language;
}

export interface AdvisoryResponse {
  cropHealthStatus: 'Good' | 'Moderate' | 'Attention Needed';
  statusSummary: string;
  irrigationAdvice: string;
  soilAndNutrientAdvice: string;
  weatherRisks: string[];
  pestDiseasePrecautions: string[];
  regenerativeRecommendation: string;
  immediateActions: string[];
  sevenDayPlan: { dayRange: string; activity: string }[];
  warnings: string[];
  disclaimer: string;
}

export interface AskAgriSetuResponse {
  answer: string;
  likelyCauses: string[];
  whatToCheck: string[];
  nextSteps: string[];
  warningSigns: string[];
  whenToConsultExpert: string;
  disclaimer: string;
}

export interface ImageAnalysisResponse {
  isCropIdentifiable: boolean;
  identifiedCropOrPart: string;
  possibleIssue: string;
  confidence: 'Low' | 'Medium' | 'High';
  visibleSymptoms: string[];
  possibleCauses: string[];
  recommendedActions: string[];
  prevention: string[];
  expertVerificationNote: string;
  disclaimer: string;
}

export interface RegenerativePractice {
  title: string;
  category: string;
  suitabilityReason: string;
  howToImplement: string;
  expectedBenefit: string;
}

export interface RegenerativeResponse {
  practices: RegenerativePractice[];
  soilBuildingTip: string;
  disclaimer: string;
}

export interface SearchGroundingResponse {
  text: string;
  groundingChunks?: Array<{
    web?: {
      uri: string;
      title: string;
    };
  }>;
  webSearchQueries?: string[];
}

export interface MapsGroundingResponse {
  text: string;
  groundingChunks?: Array<{
    maps?: {
      title?: string;
      address?: string;
      placeId?: string;
      uri?: string;
    };
  }>;
}

export interface SavedAdvisoryRecord {
  id: string;
  timestamp: string;
  crop: string;
  district: string;
  state: string;
  stage: string;
  status: 'Good' | 'Moderate' | 'Attention Needed';
  summary: string;
}

export interface WhatIsWrong {
  isInputClear: boolean;
  possibleIssue: string;
  confidence: 'Low' | 'Medium' | 'High';
  visibleSymptoms: string[];
  clarificationRequest?: string;
}

export interface WeatherImpact {
  conditionSummary: string;
  sprayAdvice: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | string;
}

export interface MedicineOptionItem {
  name?: string;
  activeIngredient?: string;
  purpose: string;
  application: string;
  costLevel: '₹' | '₹₹' | '₹₹₹' | string;
  safetyNote: string;
  priceNotice: string;
}

export interface MedicineOptions {
  organicHomeOptions: MedicineOptionItem[];
  chemicalOptions: MedicineOptionItem[];
}

export interface GuidedSolutionResponse {
  whatIsWrong: WhatIsWrong;
  weatherImpact: WeatherImpact;
  whatToDoNow: string[];
  medicineOptions: MedicineOptions;
  safety: string[];
  preventionNextSeason: string[];
  sevenDayPlan: { dayRange: string; activity: string }[];
  expertHelp: {
    kvkAdvice: string;
    kisanCallCentre: string;
  };
  disclaimer: string;
}

