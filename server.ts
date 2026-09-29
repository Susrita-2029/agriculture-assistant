import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Type, Modality } from '@google/genai';

dotenv.config();

const app = express();
const server = http.createServer(app);
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Robust model caller with automatic fallback if primary model experiences high demand or quota limits
async function generateContentWithFallback(params: {
  contents: any;
  config?: any;
  preferredModel?: string;
}) {
  // Use gemini-3.1-flash-lite first (healthy, high quota limit, fast)
  const models = [
    params.preferredModel || GEMINI_MODEL,
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
  ].filter((v, i, a) => a.indexOf(v) === i);

  let lastError: any = null;
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return response;
    } catch (err: any) {
      console.warn(`Model ${model} unavailable (${err?.status || err?.message || 'error'}), attempting alternate model...`);
      lastError = err;
    }
  }
  throw lastError;
}

const MANDATORY_FOOTER = "AI-generated guidance should be verified for significant farming decisions.";

const SYSTEM_INSTRUCTION = `
You are AgriSetu AI (कृषि सेतु), an expert, empathetic, localized agricultural advisory AI assisting Indian farmers.
Follow these rules strictly:
1. Base your advisory strictly on the provided farm context (state, district, crop, growth stage, soil parameters, weather conditions, satellite cues).
2. Never invent measurements or certainty. If information is missing or unclear, state "information unavailable" or request more details.
3. Provide prudent, practical guidance rather than guaranteed outcomes. Avoid dangerous or reckless chemical pesticide recommendations; emphasize Integrated Pest Management (IPM), bio-control, and organic amendments where practical.
4. Always produce all output in the requested language (English, Hindi, or Gujarati). Use natural, respectful farmer-friendly language, while keeping technical, pest, and disease names accurate.
5. Every advice payload must strictly comply with the requested JSON schema.
6. The disclaimer field must end with or equal: "AI-generated guidance should be verified for significant farming decisions."
`;

// Schema Definitions
const advisoryResponseSchema = {
  type: Type.OBJECT,
  properties: {
    cropHealthStatus: {
      type: Type.STRING,
      enum: ["Good", "Moderate", "Attention Needed"],
      description: "Overall evaluated crop condition",
    },
    statusSummary: { type: Type.STRING, description: "Brief plain-language summary of status" },
    irrigationAdvice: { type: Type.STRING, description: "Actionable irrigation advice based on soil and weather" },
    soilAndNutrientAdvice: { type: Type.STRING, description: "Specific NPK and organic amendment advice" },
    weatherRisks: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Identified weather-related risks in the district",
    },
    pestDiseasePrecautions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Preventive precautions for typical pests at this growth stage",
    },
    regenerativeRecommendation: { type: Type.STRING, description: "One specific regenerative farming recommendation" },
    immediateActions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Up to 3 high-priority actions for the next 24-48 hours",
    },
    sevenDayPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dayRange: { type: Type.STRING, description: "e.g., Days 1-2, Days 3-4, Days 5-7" },
          activity: { type: Type.STRING, description: "Recommended farm action" },
        },
        required: ["dayRange", "activity"],
      },
    },
    warnings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Crucial cautions (e.g. spray hazards, water logging warnings)",
    },
    disclaimer: { type: Type.STRING, description: "Mandatory verification disclaimer" },
  },
  required: [
    "cropHealthStatus",
    "statusSummary",
    "irrigationAdvice",
    "soilAndNutrientAdvice",
    "weatherRisks",
    "pestDiseasePrecautions",
    "regenerativeRecommendation",
    "immediateActions",
    "sevenDayPlan",
    "warnings",
    "disclaimer",
  ],
};

const askResponseSchema = {
  type: Type.OBJECT,
  properties: {
    answer: { type: Type.STRING, description: "Direct response to the farmer's question" },
    likelyCauses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Potential causes for what the farmer is experiencing",
    },
    whatToCheck: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Specific leaves, soil spots, or signs the farmer should inspect physically",
    },
    nextSteps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Sequential practical steps to resolve the issue",
    },
    warningSigns: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Red flags indicating worsening condition",
    },
    whenToConsultExpert: { type: Type.STRING, description: "Clear threshold on when to visit local KVK / agronomist" },
    disclaimer: { type: Type.STRING, description: "Mandatory verification disclaimer" },
  },
  required: ["answer", "likelyCauses", "whatToCheck", "nextSteps", "warningSigns", "whenToConsultExpert", "disclaimer"],
};

const imageAnalysisResponseSchema = {
  type: Type.OBJECT,
  properties: {
    isCropIdentifiable: { type: Type.BOOLEAN, description: "False if image is blurry or not agricultural" },
    identifiedCropOrPart: { type: Type.STRING, description: "Plant, leaf, stem, or fruit recognized" },
    possibleIssue: { type: Type.STRING, description: "Name of disease, deficiency, pest, or Healthy" },
    confidence: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
    visibleSymptoms: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of observable spots, discoloration, necrosis, or curl",
    },
    possibleCauses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Pathogen, fungus, nutrient shortage, or environmental stressor",
    },
    recommendedActions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Safe remedies, biological sprays, or cultural practices",
    },
    prevention: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Longer-term prevention measures",
    },
    expertVerificationNote: { type: Type.STRING, description: "KVK or officer contact instruction" },
    disclaimer: { type: Type.STRING, description: "Mandatory disclaimer" },
  },
  required: [
    "isCropIdentifiable",
    "identifiedCropOrPart",
    "possibleIssue",
    "confidence",
    "visibleSymptoms",
    "possibleCauses",
    "recommendedActions",
    "prevention",
    "expertVerificationNote",
    "disclaimer",
  ],
};

const guidedSolutionSchema = {
  type: Type.OBJECT,
  properties: {
    whatIsWrong: {
      type: Type.OBJECT,
      properties: {
        isInputClear: { type: Type.BOOLEAN, description: "False if image/audio is too blurry, dark or unrecognizable" },
        possibleIssue: { type: Type.STRING, description: "Name of disease, pest, nutrient deficiency, or Healthy" },
        issueName: { type: Type.STRING, description: "Name of disease, pest, nutrient deficiency, or Healthy" },
        confidence: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
        visibleSymptoms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Visible signs on leaves, stems or roots" },
        simpleExplanation: { type: Type.STRING, description: "Short explanation in simple farmer terms" },
        clarificationRequest: { type: Type.STRING, description: "Short request if image or audio is unclear" },
      },
      required: ["isInputClear", "possibleIssue", "confidence", "visibleSymptoms", "simpleExplanation"],
    },
    weatherImpact: {
      type: Type.OBJECT,
      properties: {
        conditionSummary: { type: Type.STRING, description: "How temperature, humidity, rain risk affect this issue" },
        sprayAdvice: { type: Type.STRING, description: "Spray or irrigation timing guidance based on rain/wind" },
        riskLevel: { type: Type.STRING, description: "Low / Moderate / High weather risk" },
      },
      required: ["conditionSummary", "sprayAdvice", "riskLevel"],
    },
    whatToDoNow: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Immediate simple numbered action steps for the farmer",
    },
    medicineOptions: {
      type: Type.OBJECT,
      properties: {
        organicHomeOptions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "e.g. Neem oil spray 1500ppm, Dashparni ark, Trichoderma viride" },
              purpose: { type: Type.STRING, description: "What it treats or repels" },
              application: { type: Type.STRING, description: "How and when to apply (follow package label directions)" },
              costLevel: { type: Type.STRING, enum: ["₹", "₹₹", "₹₹₹"] },
              safetyNote: { type: Type.STRING, description: "Handling caution" },
              priceNotice: { type: Type.STRING, description: "Estimated approximate cost level - check local shop price" },
            },
            required: ["name", "purpose", "application", "costLevel", "safetyNote", "priceNotice"],
          },
        },
        chemicalOptions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              activeIngredient: { type: Type.STRING, description: "Generic chemical active ingredient name (e.g. Mancozeb 75% WP, Chlorpyrifos)" },
              purpose: { type: Type.STRING, description: "What it treats" },
              application: { type: Type.STRING, description: "How and when to apply (strictly follow manufacturer label dose)" },
              costLevel: { type: Type.STRING, enum: ["₹", "₹₹", "₹₹₹"] },
              safetyNote: { type: Type.STRING, description: "Protective equipment, drift warning" },
              priceNotice: { type: Type.STRING, description: "Estimated approximate cost level - check local shop price" },
            },
            required: ["activeIngredient", "purpose", "application", "costLevel", "safetyNote", "priceNotice"],
          },
        },
      },
      required: ["organicHomeOptions", "chemicalOptions"],
    },
    safety: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "PPE, children safety, harvest waiting period, wind/rain spray precautions",
    },
    preventionNextSeason: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Seed treatment, crop rotation, field hygiene",
    },
    sevenDayPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dayRange: { type: Type.STRING, description: "e.g. Day 1, Day 2-3, Day 4-5, Day 6-7" },
          activity: { type: Type.STRING, description: "Action to take" },
        },
        required: ["dayRange", "activity"],
      },
    },
    expertHelp: {
      type: Type.OBJECT,
      properties: {
        kvkAdvice: { type: Type.STRING, description: "Nearest Krishi Vigyan Kendra or Agriculture Officer consult advice" },
        kisanCallCentre: { type: Type.STRING, description: "Toll-free Kisan Call Centre: 1800-180-1551" },
      },
      required: ["kvkAdvice", "kisanCallCentre"],
    },
    disclaimer: { type: Type.STRING, description: "Mandatory verification disclaimer" },
  },
  required: [
    "whatIsWrong",
    "weatherImpact",
    "whatToDoNow",
    "medicineOptions",
    "safety",
    "preventionNextSeason",
    "sevenDayPlan",
    "expertHelp",
    "disclaimer",
  ],
};

const regenerativeResponseSchema = {
  type: Type.OBJECT,
  properties: {
    practices: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Practice name (e.g. Crop Residue Mulching, Green Manuring)" },
          category: { type: Type.STRING, description: "Soil Biodiversity | Water Efficiency | Cover Crops | Minimal Tillage" },
          suitabilityReason: { type: Type.STRING, description: "Explicit reason why this fits their specific crop, soil, and district" },
          howToImplement: { type: Type.STRING, description: "Step-by-step practical guide" },
          expectedBenefit: { type: Type.STRING, description: "Tangible benefit to yield, cost reduction, or water retention" },
        },
        required: ["title", "category", "suitabilityReason", "howToImplement", "expectedBenefit"],
      },
    },
    soilBuildingTip: { type: Type.STRING, description: "Quick organic carbon improvement tip" },
    disclaimer: { type: Type.STRING, description: "Mandatory disclaimer" },
  },
  required: ["practices", "soilBuildingTip", "disclaimer"],
};

// 1. AI Farm Advisory Endpoint (gemini-3.8-flash)
app.post('/api/gemini/advisory', async (req: Request, res: Response) => {
  try {
    const { context, language } = req.body;
    if (!context || !context.crop || !context.state) {
      return res.status(400).json({ error: "Missing required farm profile context." });
    }

    const prompt = `
Generate a comprehensive, actionable agricultural advisory for the following farm profile.
Respond entirely in the requested language: ${language || 'en'}.

FARM CONTEXT:
- Location: ${context.district}, ${context.state}, India
- Crop: ${context.crop} (Growth Stage: ${context.crop_stage})
- Farm Size: ${context.farm_size} Acres
- Soil Profile: Type=${context.soil?.type}, pH=${context.soil?.ph}, Nitrogen=${context.soil?.nitrogen}, Phosphorus=${context.soil?.phosphorus}, Potassium=${context.soil?.potassium}
- Weather: Temp=${context.weather?.temperature}°C, Humidity=${context.weather?.humidity}%, Rain=${context.weather?.rainfall}mm, Condition=${context.weather?.condition}, Rain Risk=${context.weather?.rain_probability}%
- Satellite Indicators: NDVI=${context.satellite?.ndvi}, Vegetation Health=${context.satellite?.vegetation_health}, Crop Stress=${context.satellite?.crop_stress}

Set the disclaimer field to: "${MANDATORY_FOOTER}"
`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: advisoryResponseSchema,
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating advisory:', error);
    return res.status(500).json({ error: error.message || "Failed to generate agricultural advisory." });
  }
});

// 2. Ask AgriSetu Q&A Endpoint (gemini-3.8-flash)
app.post('/api/gemini/ask', async (req: Request, res: Response) => {
  try {
    const { question, context, language } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Question cannot be empty." });
    }

    const prompt = `
The farmer asks: "${question}"

FARM CONTEXT:
- State: ${context?.state || 'Unknown'}, District: ${context?.district || 'Unknown'}
- Crop: ${context?.crop || 'General'}, Stage: ${context?.crop_stage || 'Unknown'}
- Soil: ${context?.soil?.type || 'Unknown'}, pH: ${context?.soil?.ph || 'Unknown'}, NPK: ${context?.soil?.nitrogen}/${context?.soil?.phosphorus}/${context?.soil?.potassium}
- Current Weather: Temp ${context?.weather?.temperature}°C, Rain ${context?.weather?.rainfall}mm, Condition: ${context?.weather?.condition}
- Satellite NDVI: ${context?.satellite?.ndvi || 'N/A'}

Provide an accurate, empathetic, and clear answer in language: ${language || 'en'}.
Set disclaimer field to: "${MANDATORY_FOOTER}"
`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: askResponseSchema,
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error answering question:', error);
    return res.status(500).json({ error: error.message || "Failed to process farmer question." });
  }
});

// 3. Multimodal Crop Image Analysis Endpoint (gemini-3.8-flash)
app.post('/api/gemini/image-analysis', async (req: Request, res: Response) => {
  try {
    const { imageBase64, crop, stage, state, district, soilType, description, language } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "No image data received." });
    }

    let mimeType = 'image/jpeg';
    let rawBase64 = imageBase64;
    const match = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (match) {
      mimeType = match[1];
      rawBase64 = match[2];
    }

    const prompt = `
Examine this crop leaf/plant photo closely and diagnose any pests, fungal/bacterial diseases, nutrient deficiency, or physiological disorder.
If the image does not clearly depict a plant, crop leaf, fruit, or stem, set isCropIdentifiable: false and explain that the image is unclear or not agricultural.
Respond in language: ${language || 'en'}.

PROVIDED CONTEXT:
- Expected Crop: ${crop || 'Not specified'}
- Growth Stage: ${stage || 'Not specified'}
- Location: ${district || 'Unknown'}, ${state || 'India'}
- Soil Type: ${soilType || 'Unknown'}
- Farmer's Observation Note: "${description || 'None provided'}"

Set disclaimer to: "${MANDATORY_FOOTER}"
`;

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: rawBase64,
      },
    };

    const textPart = {
      text: prompt,
    };

    const response = await generateContentWithFallback({
      contents: [imagePart, textPart],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: imageAnalysisResponseSchema,
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing crop image:', error);
    return res.status(500).json({ error: error.message || "Failed to analyze crop image." });
  }
});

// 4. Regenerative Agriculture Endpoint (gemini-3.8-flash)
app.post('/api/gemini/regenerative', async (req: Request, res: Response) => {
  try {
    const { context, language } = req.body;
    const prompt = `
Recommend 3-4 tailored regenerative agricultural practices specifically suited for:
- Crop: ${context.crop}
- Soil: ${context.soil?.type} (pH ${context.soil?.ph})
- Agro-ecological Region: ${context.district}, ${context.state}
- Weather Pattern: Temp ${context.weather?.temperature}°C, Rain ${context.weather?.rainfall}mm

Select ONLY practices that make economic and agronomic sense for this specific crop and soil combination. Explain the exact mechanism why it fits. Do not output a generic generic list.
Language: ${language || 'en'}.
Disclaimer: "${MANDATORY_FOOTER}"
`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: regenerativeResponseSchema,
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating regenerative guidance:', error);
    return res.status(500).json({ error: error.message || "Failed to generate regenerative practices." });
  }
});

// 5. Search Grounding Endpoint (gemini-3.5-flash with googleSearch)
app.post('/api/gemini/search-grounding', async (req: Request, res: Response) => {
  try {
    const { query, state, district, crop, language } = req.body;
    const finalQuery = query || `Latest APMC mandi modal price for ${crop || 'crops'} in ${district || 'Rajkot'}, ${state || 'Gujarat'}, current price trends per quintal, and government minimum support price (MSP)`;

    const prompt = `
You are AgriSetu Real-Time Market Intelligence.
Search and deliver up-to-date, verified agricultural market and weather data.
Query: ${finalQuery}
Target District/State: ${district || ''}, ${state || ''}
Target Crop: ${crop || ''}
Respond in language: ${language || 'en'} in clear bullet points with latest modal prices, arrival volume trends, and government notices.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;

    return res.json({
      text: response.text,
      groundingChunks: groundingMetadata?.groundingChunks || [],
      webSearchQueries: groundingMetadata?.webSearchQueries || [],
    });
  } catch (error: any) {
    console.error('Error with search grounding:', error);
    return res.status(500).json({ error: error.message || "Failed to retrieve search grounded data." });
  }
});

// 6. Maps Grounding Endpoint (gemini-3.5-flash with googleMaps)
app.post('/api/gemini/maps-grounding', async (req: Request, res: Response) => {
  try {
    const { query, state, district, language } = req.body;
    const prompt = query || `Find real certified Krishi Vigyan Kendra (KVK), agricultural research centers, soil testing laboratories, and certified seed distribution centers located in and around ${district || 'Rajkot'}, ${state || 'Gujarat'}, India.
List their exact names, locations/addresses, and available farmer support services.
Respond in language: ${language || 'en'}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;

    return res.json({
      text: response.text,
      groundingChunks: groundingMetadata?.groundingChunks || [],
    });
  } catch (error: any) {
    console.error('Error with maps grounding:', error);
    return res.status(500).json({ error: error.message || "Failed to retrieve maps grounded data." });
  }
});

// 7. Audio Transcription Endpoint (gemini-3.5-transcribe)
app.post('/api/gemini/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType, language } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: "Missing audio data." });
    }

    let cleanBase64 = audioBase64;
    let detectedMime = mimeType || 'audio/webm';
    const match = audioBase64.match(/^data:([a-zA-Z0-9\/+-]+);base64,(.+)$/);
    if (match) {
      detectedMime = match[1];
      cleanBase64 = match[2];
    }

    const audioPart = {
      inlineData: {
        mimeType: detectedMime,
        data: cleanBase64,
      },
    };

    const textPart = {
      text: `Transcribe this spoken agricultural query verbatim in the spoken language (English, Hindi, or Gujarati). Respond only with the exact transcribed text without markdown or prefixes. Preferred target language context: ${language || 'en'}.`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: [audioPart, textPart],
    });

    return res.json({
      text: response.text ? response.text.trim() : "",
    });
  } catch (error: any) {
    console.error('Error transcribing audio with gemini-3.5-transcribe:', error);
    return res.status(500).json({ error: error.message || "Audio transcription failed." });
  }
});

// 7b. Guided Farmer Solution Endpoint (Multimodal: Photo, Audio, Video, Text + Live Weather + Context)
app.post('/api/gemini/guided-solution', async (req: Request, res: Response) => {
  try {
    const { crop, stage, location, problemText, media, liveWeather, soil, language } = req.body;

    const parts: any[] = [];

    // Add any provided media parts (images, voice recordings, short videos)
    if (Array.isArray(media) && media.length > 0) {
      for (const item of media) {
        if (item && item.data) {
          let cleanBase64 = item.data;
          let mime = item.mimeType || 'image/jpeg';
          const match = item.data.match(/^data:([a-zA-Z0-9\/+-]+);base64,(.+)$/);
          if (match) {
            mime = match[1];
            cleanBase64 = match[2];
          }
          parts.push({
            inlineData: {
              mimeType: mime,
              data: cleanBase64,
            },
          });
        }
      }
    }

    const weatherInfo = liveWeather?.isLive
      ? `LIVE WEATHER (from Open-Meteo): ${liveWeather.current?.temperature}°C, Humidity ${liveWeather.current?.humidity}%, Wind ${liveWeather.current?.windSpeed} km/h, Rain forecast next 3 days: ${liveWeather.forecast?.map((f: any) => `${f.date}: ${f.rainProb}% rain risk`).join(', ')}`
      : 'Weather data: Live measurement unavailable; using district seasonal average.';

    const locationStr = [location?.village, location?.district, location?.state, 'India'].filter(Boolean).join(', ');

    const prompt = `
You are AgriSetu AI (कृषि सेतु). Analyze this farmer's problem and generate an empathetic, easy-to-understand, card-based guidance.
Respond ENTIRELY in the selected language: ${language || 'en'}.

FARMER DETAILS:
- Crop: ${crop || 'Crop'} (Stage: ${stage || 'Growing'})
- Location: ${locationStr}
- Farmer Problem Description: "${problemText || 'Farmer requested visual and contextual crop diagnosis.'}"
- ${weatherInfo}
- Soil: ${soil?.type ? `Soil Type: ${soil.type}, pH: ${soil.ph || 'N/A'}` : 'Information unavailable'}

CRITICAL GUIDANCE RULES:
1. Low-literacy friendly: Use plain, simple farmer words and short sentences.
2. In whatIsWrong: If the image, audio, or description is blurry, dark, unclear, or non-agricultural, set isInputClear: false, and gently ask for a clearer photo or description.
3. In weatherImpact: Specifically analyze how current humidity, temperature, wind, and rain risk affect disease growth or spray timing (e.g., "Do not spray before rain or during heavy wind").
4. In medicineOptions: Provide TWO columns:
   - Low-budget / organic / home options first (neem seed kernel extract, trichoderma, bio-control, cultural practices)
   - Standard chemical options second (use generic chemical active ingredient names, e.g. Mancozeb, Imidacloprid, not proprietary brands).
   - For all options, specify how and when to apply (state: "strictly follow product container label instructions; do not overdose"), and an approximate cost tier (₹, ₹₹, or ₹₹₹).
   - Label every price notice: "Cost is rough estimate • check local shop price".
5. Safety: emphasize gloves/mask, keeping chemicals away from children, and harvest waiting period (PHI).
6. Expert Help: recommend the local Krishi Vigyan Kendra (KVK) and national Kisan Call Centre toll-free 1800-180-1551.
7. Disclaimer: Must end with "${MANDATORY_FOOTER}".
`;

    parts.push({ text: prompt });

    const response = await generateContentWithFallback({
      contents: parts,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: guidedSolutionSchema,
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.whatIsWrong) {
      parsed.whatIsWrong.possibleIssue =
        parsed.whatIsWrong.possibleIssue ||
        parsed.whatIsWrong.issueName ||
        'Crop Condition Advisory';
      parsed.whatIsWrong.issueName = parsed.whatIsWrong.possibleIssue;
    }
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating guided farmer solution:', error);
    return res.status(500).json({ error: error.message || "Failed to generate solution." });
  }
});

// 7c. Guided Follow-Up Q&A Endpoint
app.post('/api/gemini/guided-followup', async (req: Request, res: Response) => {
  try {
    const { crop, stage, location, issueName, question, history, language } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Question cannot be empty." });
    }

    const prompt = `
You are AgriSetu AI assisting a farmer with a follow-up question.
Respond in language: ${language || 'en'}.
Keep answers concise (under 120 words), empathetic, practical, and easy to read.

FARM CONTEXT:
- Crop: ${crop} (${stage})
- Location: ${location?.district || ''}, ${location?.state || ''}
- Diagnosed Issue: ${issueName || 'Crop Health Inquiry'}

FARMER'S FOLLOW-UP QUESTION:
"${question}"

Provide practical guidance. If recommending treatments, recommend safest, cheapest options first.
End with: "${MANDATORY_FOOTER}"
`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
      },
    });

    return res.json({
      answer: response.text ? response.text.trim() : "",
    });
  } catch (error: any) {
    console.error('Error handling guided follow-up question:', error);
    return res.status(500).json({ error: error.message || "Failed to process follow-up question." });
  }
});

// 8. WebSocket Server for Real-Time Voice Conversations (gemini-3.8-live)
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('🎙️ New client connected to Gemini Live voice bridge');

  try {
    const session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
          },
        },
        systemInstruction: `You are AgriSetu Live Voice Agronomist (कृषि सेतु). Speak in natural, farmer-friendly terms. Provide concise, clear, and reassuring agricultural advice for Indian farmers. Always advise expert verification before major chemical or financial decisions.`,
      },
      callbacks: {
        onmessage: (message: any) => {
          const parts = message.serverContent?.modelTurn?.parts || [];
          for (const part of parts) {
            if (part.inlineData?.data) {
              // Send raw PCM audio chunk to browser
              clientWs.send(JSON.stringify({
                type: 'audio',
                data: part.inlineData.data,
              }));
            }
            if (part.text) {
              clientWs.send(JSON.stringify({
                type: 'text',
                text: part.text,
              }));
            }
          }
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ type: 'interrupted' }));
          }
          if (message.serverContent?.turnComplete) {
            clientWs.send(JSON.stringify({ type: 'turnComplete' }));
          }
        },
        onclose: () => {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'sessionClosed' }));
            clientWs.close();
          }
        },
      },
    });

    clientWs.on('message', (raw: Buffer) => {
      try {
        const payload = JSON.parse(raw.toString());
        if (payload.type === 'audio' && payload.data) {
          // Real-time PCM audio input from browser mic (16kHz mono)
          session.sendRealtimeInput({
            audio: { data: payload.data, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (payload.type === 'text' && payload.text) {
          (session as any).send({
            realtimeInput: {
              parts: [{ text: payload.text }],
            },
          });
        }
      } catch (err) {
        console.error('Error handling WebSocket message to Live session:', err);
      }
    });

    clientWs.on('close', () => {
      console.log('Gemini Live voice client disconnected');
      try {
        session.close();
      } catch {
        // session already closed
      }
    });
  } catch (liveErr: any) {
    console.error('Failed to initialize Gemini 3.8 Live session:', liveErr);
    clientWs.send(JSON.stringify({
      type: 'error',
      message: liveErr.message || 'Failed to start Gemini Live voice session.',
    }));
    clientWs.close();
  }
});

// Upgrade HTTP server to WebSocket for /live-voice
server.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url || '', `http://${request.headers.host}`);
  if (pathname === '/live-voice') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Mount Vite middleware in development or serve static assets in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`🌾 AgriSetu AI Server listening on port ${port} (http://localhost:${port})`);
  });
}

startServer();
