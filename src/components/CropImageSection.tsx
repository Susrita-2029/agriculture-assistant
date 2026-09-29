import React, { useState } from 'react';
import { FarmContext, ImageAnalysisResponse, Language } from '../types';
import { requestImageAnalysis } from '../services/api';
import { t } from '../services/i18nService';
import { Microscope, Upload, Image as ImageIcon, Sparkles, AlertTriangle, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';

interface CropImageSectionProps {
  context: FarmContext;
  language: Language;
}

export const CropImageSection: React.FC<CropImageSectionProps> = ({ context, language }) => {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ImageAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Please upload an image file in JPG, PNG, or WEBP format.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds the 5MB limit.');
        return;
      }
      setError(null);
      setAnalysis(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoadSampleImage = () => {
    // Generate a high-contrast synthetic groundnut leaf image with distinct cercospora tikka spots
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 400, 400);

      // Draw leaf shape
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(200, 40);
      ctx.bezierCurveTo(320, 100, 340, 260, 200, 360);
      ctx.bezierCurveTo(60, 260, 80, 100, 200, 40);
      ctx.fillStyle = '#4ade80';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#15803d';
      ctx.stroke();

      // Main central vein
      ctx.beginPath();
      ctx.moveTo(200, 40);
      ctx.lineTo(200, 360);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#166534';
      ctx.stroke();

      // Lateral veins
      const veins = [
        [200, 110, 270, 130],
        [200, 170, 130, 190],
        [200, 230, 260, 250],
        [200, 280, 140, 300],
      ];
      ctx.lineWidth = 2;
      veins.forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      // Necrotic / Blight Spots with yellow haloes (Tikka disease pattern)
      const spots = [
        { x: 170, y: 150, r: 16 },
        { x: 235, y: 200, r: 20 },
        { x: 215, y: 270, r: 14 },
        { x: 160, y: 230, r: 12 },
        { x: 250, y: 140, r: 10 },
      ];

      spots.forEach(({ x, y, r }) => {
        // Yellow halo
        ctx.beginPath();
        ctx.arc(x, y, r + 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fde047';
        ctx.fill();

        // Dark brown necrotic center
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = '#78350f';
        ctx.fill();
      });

      ctx.restore();

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setImageBase64(dataUrl);
      setDescription('Groundnut leaves with small circular dark brown spots and distinct yellow haloes');
      setAnalysis(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!imageBase64) {
      setError('Please choose or load an image first.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const result = await requestImageAnalysis({
        imageBase64,
        crop: context.crop,
        stage: context.crop_stage,
        state: context.state,
        district: context.district,
        soilType: context.soil.type,
        description: description || 'Visual crop inspection',
        language,
      });
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Vision diagnosis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="image-section" className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Microscope className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg sm:text-xl font-extrabold text-stone-900">
              Check Your Crop (Gemini Multimodal Vision)
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Upload clear foliage, stem, or fruit images for leaf spot, fungal blight, or pest symptom recognition.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadSampleImage}
          className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold px-3 py-1.5 rounded-xl border border-stone-300 transition flex items-center gap-1.5 cursor-pointer w-fit"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          {t('loadSampleImage', language)}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
        {/* Upload Column */}
        <div className="space-y-3">
          <label className="block border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer transition bg-stone-50/60">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            {imageBase64 ? (
              <div className="relative group">
                <img
                  src={imageBase64}
                  alt="Crop Preview"
                  className="max-h-56 mx-auto rounded-xl object-contain border border-stone-200 shadow-2xs bg-white"
                />
                <p className="text-xs text-stone-500 font-medium mt-2 flex items-center justify-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  Click to replace image
                </p>
              </div>
            ) : (
              <div className="py-8 space-y-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div className="text-xs sm:text-sm font-bold text-stone-800">
                  {t('uploadPrompt', language)}
                </div>
                <p className="text-[11px] text-stone-400">JPG, PNG, or WEBP up to 5MB</p>
              </div>
            )}
          </label>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Observed Symptoms (Optional context)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Dark spots with yellow ring on lower leaves"
              className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !imageBase64}
            className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-800/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>{t('analyzingImage', language)}</span>
              </>
            ) : (
              <>
                <Microscope className="w-4 h-4 text-emerald-200" />
                <span>{t('analyzeImage', language)}</span>
              </>
            )}
          </button>
        </div>

        {/* Results Column */}
        <div>
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs mb-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!analysis && !loading && (
            <div className="h-full min-h-[220px] flex flex-col items-center justify-center border border-stone-200 rounded-2xl p-6 text-center text-stone-400 bg-stone-50/50">
              <Microscope className="w-10 h-10 text-stone-300 mb-2" />
              <p className="text-xs font-semibold text-stone-600">No image analyzed yet</p>
              <p className="text-[11px] text-stone-400 mt-1 max-w-xs">
                Upload a plant photo or test with our sample blight leaf image to receive structured visual diagnosis.
              </p>
            </div>
          )}

          {analysis && (
            <div className="space-y-3">
              {!analysis.isCropIdentifiable ? (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950">
                  <strong className="block mb-1 font-bold">Image Unclear / Not Agricultural:</strong>
                  The submitted image could not be reliably verified as plant tissue or a recognizable crop. Please capture a clear, well-lit close-up photograph of the affected foliage or stem.
                </div>
              ) : (
                <>
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-wider block">
                        Recognized Plant Element
                      </span>
                      <span className="text-sm font-bold text-stone-900">{analysis.identifiedCropOrPart}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider block">
                        Confidence
                      </span>
                      <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                        analysis.confidence === 'High' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                        analysis.confidence === 'Medium' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        'bg-stone-100 text-stone-900 border border-stone-300'
                      }`}>
                        {analysis.confidence}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
                    <span className="text-xs font-bold text-stone-900 block mb-1">
                      Identified Potential Issue: <span className="text-rose-700 font-extrabold">{analysis.possibleIssue}</span>
                    </span>
                    <div className="mt-2">
                      <span className="text-[11px] font-bold text-stone-700">Observable Visual Symptoms:</span>
                      <ul className="list-disc list-inside text-xs text-stone-600 mt-1 space-y-0.5">
                        {analysis.visibleSymptoms.map((symp, i) => (
                          <li key={i}>{symp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl">
                    <span className="text-xs font-bold text-blue-950 block mb-1">Recommended Remedial Steps:</span>
                    <ul className="list-disc list-inside text-xs text-blue-950 space-y-1 font-medium">
                      {analysis.recommendedActions.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700">
                    <strong className="text-stone-900">Long-term Prevention:</strong> {analysis.prevention.join(', ')}
                  </div>

                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-950 font-medium">
                    {analysis.expertVerificationNote}
                  </div>

                  <div className="p-2 bg-stone-100 rounded-lg text-center text-[11px] text-stone-500 font-semibold flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{analysis.disclaimer}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
