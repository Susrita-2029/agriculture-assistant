# AgriSetu AI (कृषि सेतु / કૃષિ સેતુ)
> **AI-Powered Agricultural Intelligence for India's Farmers**

AgriSetu AI is an end-to-end, multilingual agricultural advisory platform connecting soil test indicators, district micro-climates, satellite canopy health metrics, real-time APMC Mandi rates, and visual plant pathology using **Google Gemini 3.8 & 3.5 Models**.

---

## 1. Core Architecture & Gemini Models

| Capability | Model | Integration Details |
| :--- | :--- | :--- |
| **Comprehensive Farm Advisory** | `gemini-3.8-flash` | Strict JSON schema output for health status, irrigation, soil NPK, and 7-day plan |
| **Conversational Q&A** | `gemini-3.8-flash` | Deep agricultural reasoning based on crop, stage, soil, and weather context |
| **Multimodal Crop Vision** | `gemini-3.8-flash` | Photographic symptom recognition with non-crop rejection and confidence scoring |
| **Live Voice Assistant** | `gemini-3.8-live` | Real-time bidirectional voice streaming over WebSockets with 16kHz PCM audio |
| **Live Mandi Rates & Agro-News** | `gemini-3.5-flash` | Real-time Search Grounding via `googleSearch` tool for APMC prices and MSP updates |
| **Nearby KVKs & Soil Labs** | `gemini-3.5-flash` | Real-world Maps Grounding via `googleMaps` tool for physical agricultural centers |
| **Vernacular Audio Transcriber** | `gemini-3.5-transcribe`| High-accuracy speech-to-text for Hindi, Gujarati, and English regional dialects |
| **Targeted Regenerative Farming** | `gemini-3.8-flash` | Specialized agronomic practices tailored only to the farm's crop and soil profile |

---

## 2. Key Features

- **Unified Farm Profile Context:** Combines state, district, crop, stage, acreage, and soil chemistry into an end-to-end context object passed to all Gemini endpoints.
- **Demo Mode Instant Loaders:** One-click prefill presets for:
  - **Gujarat (Rajkot):** Groundnut, Vegetative, Sandy Loam, pH 6.8, Medium N, Medium P, High K.
  - **Punjab (Ludhiana):** Wheat, Tillering, Alluvial Loam, pH 7.4, High N, Medium P, Medium K.
  - **Maharashtra (Nashik):** Onion, Bulb Initiation, Deep Black Clay, pH 7.1, Low N, Medium P, High K.
  - **Karnataka (Dharwad):** Maize, Knee High (V6), Black Cotton, pH 6.9, Medium N, High P, Medium K.
- **AI Advisory with 7-Day Action Plan:** Generates evaluated crop condition (`Good`, `Moderate`, `Attention Needed`), irrigation timing, soil nutrition, weather mitigation, pest precautions, 24–48h immediate actions, and daily staged work plans.
- **Live Voice Agent (Gemini 3.8 Live):** Low-latency spoken dialogue directly with the Live API.
- **Search-Grounded Mandi Intelligence:** Live modal prices per quintal and arrival volumes across Indian APMCs with verified source links.
- **Maps-Grounded Center Locator:** Identifies certified Krishi Vigyan Kendras, ICAR research centers, and soil testing labs in the district.
- **Audio Transcriber (Gemini 3.5 Transcribe):** Record microphone speech in any Indian accent and transcribe directly into the question assistant.
- **Multimodal Visual Diagnosis:** Upload foliage or pest photos (<5MB, JPG/PNG/WEBP) or test with the built-in synthetic Tikka/Cercospora blight sample.
- **Saved Advisories & History:** LocalStorage persistence enabling farmers to bookmark, review, and organize past advisories.
- **Multi-State Network Dashboard:** Visualizes state-level telemetry counters for advisory requests, disease analyses, and active weather alerts.

---

## 3. Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run the fullstack server (Express backend + Vite dev middleware on port 3000)
npm run dev

# 3. Open in browser:
# http://localhost:3000
```
