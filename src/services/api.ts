import {
  FarmContext,
  AdvisoryResponse,
  AskAgriSetuResponse,
  ImageAnalysisResponse,
  RegenerativeResponse,
  SearchGroundingResponse,
  MapsGroundingResponse,
  GuidedSolutionResponse,
} from '../types';

export async function requestAdvisory(context: FarmContext): Promise<AdvisoryResponse> {
  const res = await fetch('/api/gemini/advisory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ context, language: context.language }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Advisory generation failed: ${res.statusText}`);
  }
  return res.json();
}

export async function requestAskAgriSetu(question: string, context: FarmContext): Promise<AskAgriSetuResponse> {
  const res = await fetch('/api/gemini/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, context, language: context.language }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `AgriSetu Q&A failed: ${res.statusText}`);
  }
  return res.json();
}

export async function requestImageAnalysis(payload: {
  imageBase64: string;
  crop: string;
  stage: string;
  state: string;
  district: string;
  soilType: string;
  description: string;
  language: string;
}): Promise<ImageAnalysisResponse> {
  const res = await fetch('/api/gemini/image-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Crop image analysis failed: ${res.statusText}`);
  }
  return res.json();
}

export async function requestRegenerative(context: FarmContext): Promise<RegenerativeResponse> {
  const res = await fetch('/api/gemini/regenerative', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ context, language: context.language }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Regenerative advisory failed: ${res.statusText}`);
  }
  return res.json();
}

// Google Search Grounding with gemini-3.5-flash
export async function requestSearchGrounding(
  query: string,
  state: string,
  district: string,
  crop: string,
  language: string
): Promise<SearchGroundingResponse> {
  const res = await fetch('/api/gemini/search-grounding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, state, district, crop, language }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Search grounding failed: ${res.statusText}`);
  }
  return res.json();
}

// Google Maps Grounding with gemini-3.5-flash
export async function requestMapsGrounding(
  query: string,
  state: string,
  district: string,
  language: string
): Promise<MapsGroundingResponse> {
  const res = await fetch('/api/gemini/maps-grounding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, state, district, language }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Maps grounding failed: ${res.statusText}`);
  }
  return res.json();
}

// Audio Transcription with gemini-3.5-transcribe
export async function requestAudioTranscription(
  audioBase64: string,
  mimeType: string,
  language: string
): Promise<{ text: string }> {
  const res = await fetch('/api/gemini/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64, mimeType, language }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Audio transcription failed: ${res.statusText}`);
  }
  return res.json();
}

// Guided Farmer Solution (Multimodal Photo, Audio, Video, Text + Live Weather + Context)
export async function requestGuidedSolution(payload: {
  crop: string;
  stage: string;
  location: { village?: string; district: string; state: string };
  problemText: string;
  media?: Array<{ data: string; mimeType: string }>;
  liveWeather?: any;
  soil?: any;
  language: string;
}): Promise<GuidedSolutionResponse> {
  const res = await fetch('/api/gemini/guided-solution', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Solution analysis failed: ${res.statusText}`);
  }
  return res.json();
}

