import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../../types';
import { requestAudioTranscription } from '../../services/api';
import { speakText } from '../../utils/speech';
import {
  Camera,
  Mic,
  Video,
  Type,
  Upload,
  CheckCircle2,
  Trash2,
  Play,
  Square,
  AlertCircle,
  Sparkles,
  ArrowRight,
  FileCheck,
  RefreshCw,
  Loader2,
} from 'lucide-react';

interface Step4ProblemProps {
  language: Language;
  crop: string;
  stage: string;
  problemText: string;
  onChangeProblemText: (txt: string) => void;
  media: Array<{ data: string; mimeType: string; label: string; previewUrl?: string }>;
  onAddMedia: (item: { data: string; mimeType: string; label: string; previewUrl?: string }) => void;
  onRemoveMedia: (index: number) => void;
  onSubmit: () => void;
  isLoading: boolean;
  errorMessage?: string | null;
}

export const Step4Problem: React.FC<Step4ProblemProps> = ({
  language,
  crop,
  stage,
  problemText,
  onChangeProblemText,
  media,
  onAddMedia,
  onRemoveMedia,
  onSubmit,
  isLoading,
  errorMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'photo' | 'voice' | 'video' | 'type'>('photo');

  // Photo state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // Video state
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Quick symptom chips for Indian farmers
  const quickChips: Record<Language, Array<{ text: string; icon: string }>> = {
    en: [
      { text: 'Yellow spots with dark brown halo on leaves', icon: '🍂' },
      { text: 'Worms / caterpillars chewing on leaves & pods', icon: '🐛' },
      { text: 'Leaves curling upward with whitefly pests', icon: '🦟' },
      { text: 'Wilting and root collar rot after heavy moisture', icon: '💧' },
    ],
    hi: [
      { text: 'पत्तों पर पीले घेरे वाले भूरे-काले धब्बे (टिक्का)', icon: '🍂' },
      { text: 'इल्लियां और सुंडी पत्ते व फलियां खा रही हैं', icon: '🐛' },
      { text: 'पत्ते ऊपर की तरफ मुड़ रहे हैं व रसचूसक कीट', icon: '🦟' },
      { text: 'जड़ सड़न और पौधा अचानक सूख कर गिर रहा है', icon: '💧' },
    ],
    gu: [
      { text: 'પાંદડા પર પીળા કુંડાળા સાથે કાળા-કથ્થઈ ડાઘા (ટીક્કા)', icon: '🍂' },
      { text: 'ઈયળો પાંદડા અને ડોડવા કોરી ખાય છે', icon: '🐛' },
      { text: 'પાંદડા કોકડાઈ ગયા છે (કુકડ) અને મોલો-મશી', icon: '🦟' },
      { text: 'મૂળનો સડો અને છોડ એકાએક સુકાઈને ઢળી પડે છે', icon: '💧' },
    ],
  };

  // 1. Photo Upload Handler
  const handleImageFile = (file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please upload a JPG, PNG, or WEBP photo.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      onAddMedia({
        data: base64,
        mimeType: file.type,
        label: `Photo: ${file.name || 'Plant Leaf'}`,
        previewUrl: base64,
      });
      // Suggest problem text if empty
      if (!problemText) {
        onChangeProblemText(
          language === 'gu'
            ? `${crop} પાકના પાંદડા પર દેખાતા રોગના લક્ષણો તપાસો.`
            : language === 'hi'
            ? `${crop} फसल के पत्ते पर दिख रहे रोग के लक्षणों की जांच करें।`
            : `Please inspect these symptoms visible on ${crop} leaf.`
        );
      }
    };
    reader.readAsDataURL(file);
  };

  // Sample Photo for quick testing
  const handleLoadSamplePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Leaf background
      ctx.fillStyle = '#4d7c0f';
      ctx.fillRect(0, 0, 400, 300);

      // Veins
      ctx.strokeStyle = '#65a30d';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(200, 20);
      ctx.lineTo(200, 280);
      ctx.stroke();

      // Tikka brown necrotic spots with yellow halos
      const spots = [
        { x: 120, y: 80, r: 24 },
        { x: 270, y: 110, r: 30 },
        { x: 170, y: 190, r: 28 },
        { x: 260, y: 220, r: 20 },
      ];

      spots.forEach((s) => {
        // Yellow halo
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r + 8, 0, Math.PI * 2);
        ctx.fillStyle = '#facc15';
        ctx.fill();

        // Dark brown necrotic center
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = '#451a03';
        ctx.fill();
      });

      // Watermark
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px sans-serif';
      ctx.fillText(`Sample: ${crop} Leaf with Spot Symptoms`, 20, 280);

      const base64 = canvas.toDataURL('image/jpeg', 0.9);
      onAddMedia({
        data: base64,
        mimeType: 'image/jpeg',
        label: `Sample ${crop} Leaf (Tikka Blight)`,
        previewUrl: base64,
      });

      onChangeProblemText(
        language === 'gu'
          ? `${crop} પાકના પાંદડા પર ગોળાકાર કાળા ડાઘા અને પીળી કિનારીઓ દેખાય છે. શું આ ટીક્કા રોગ છે?`
          : language === 'hi'
          ? `${crop} के पत्तों पर भूरे-काले गोल धब्बे और पीला घेरा बना हुआ है। क्या यह टिक्का रोग है?`
          : `Circular brown spots with yellow halos observed on ${crop} leaf. Is this Tikka / Cercospora leaf spot?`
      );
    }
  };

  // 2. Audio Recording Handler
  const startRecording = async () => {
    setAudioError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone not supported on this device/browser');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;

          // Add audio to media list so Gemini receives direct vernacular voice
          onAddMedia({
            data: base64Audio,
            mimeType: 'audio/webm',
            label: `Spoken Question (${recordingSeconds}s)`,
          });

          // Also transcribe with gemini-3.5-transcribe and put transcript in prompt box!
          try {
            setIsTranscribing(true);
            const res = await requestAudioTranscription(base64Audio, 'audio/webm', language);
            if (res.text) {
              onChangeProblemText(
                problemText ? `${problemText} • ${res.text}` : res.text
              );
              speakText(
                language === 'gu'
                  ? `તમારો અવાજ લખાણમાં બદલ્યો: ${res.text}`
                  : language === 'hi'
                  ? `आपकी आवाज लिखी गई: ${res.text}`
                  : `Transcribed: ${res.text}`,
                language
              );
            }
          } catch (tErr) {
            console.warn('Transcription service notice:', tErr);
          } finally {
            setIsTranscribing(false);
          }
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mr.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((sec) => sec + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone access notice:', err?.name || err?.message || err);
      setAudioError(
        language === 'gu'
          ? 'માઇક્રોફોનની પરવાનગી નથી મળી શકી. કૃપા કરીને નીચે લખીને અથવા ફોટો પાડીને પ્રશ્ન પૂછો.'
          : language === 'hi'
          ? 'माइक्रोफ़ोन की अनुमति नहीं मिल सकी। कृपया नीचे लिखकर या फ़ोटो खींचकर पूछें।'
          : 'Microphone permission was denied or not available. Please type your query or upload a photo/video.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // 3. Short Video Upload Handler
  const handleVideoFile = (file: File) => {
    setVideoError(null);
    if (!file.type.startsWith('video/')) {
      setVideoError('Please upload a video file (MP4, WEBM).');
      return;
    }
    // Limit to 20MB / 30s
    if (file.size > 20 * 1024 * 1024) {
      setVideoError('Video clip must be under 20MB (approx 30 seconds).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      onAddMedia({
        data: base64,
        mimeType: file.type || 'video/mp4',
        label: `Video Clip: ${file.name || 'Crop Field'}`,
        previewUrl: base64,
      });

      if (!problemText) {
        onChangeProblemText(
          language === 'gu'
            ? `${crop} પાકનો વિડીયો જુઓ અને સમસ્યા જણાવો.`
            : language === 'hi'
            ? `${crop} फसल का वीडियो देखें और समस्या बताएं।`
            : `Please inspect the video clip of ${crop} crop.`
        );
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 sm:p-6 max-w-2xl mx-auto w-full">
      {/* Title */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black tracking-wide uppercase border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Step 4 • What is the problem?
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          {language === 'gu'
            ? 'પાકમાં શું સમસ્યા દેખાય છે?'
            : language === 'hi'
            ? 'फसल में क्या समस्या दिख रही है?'
            : 'What is the problem in your crop?'}
        </h2>
        <p className="text-stone-600 text-xs sm:text-sm font-medium">
          {language === 'gu'
            ? 'તમે ફોટો, અવાજ, વિડીયો અથવા લખાણ કોઈપણ રીતે પૂછી શકો છો.'
            : language === 'hi'
            ? 'आप फोटो, बोलकर, वीडियो या लिखकर किसी भी तरह बता सकते हैं।'
            : 'Combine Photo, Voice, Video, or Text for accurate diagnosis.'}
        </p>
      </div>

      <div className="w-full bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-stone-200 space-y-6">
        {/* Four Big Option Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab('photo')}
            className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer active:scale-97 ${
              activeTab === 'photo'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-700'
            }`}
          >
            <Camera className="w-6 h-6 text-emerald-600" />
            <span className="font-black text-xs sm:text-sm">
              {language === 'gu' ? '📷 ફોટો' : language === 'hi' ? '📷 फोटो' : '📷 Photo'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('voice')}
            className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer active:scale-97 ${
              activeTab === 'voice'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-700'
            }`}
          >
            <Mic className="w-6 h-6 text-purple-600" />
            <span className="font-black text-xs sm:text-sm">
              {language === 'gu' ? '🎤 બોલો' : language === 'hi' ? '🎤 बोलें' : '🎤 Speak'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer active:scale-97 ${
              activeTab === 'video'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-700'
            }`}
          >
            <Video className="w-6 h-6 text-rose-600" />
            <span className="font-black text-xs sm:text-sm">
              {language === 'gu' ? '🎥 વિડીયો' : language === 'hi' ? '🎥 वीडियो' : '🎥 Video'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('type')}
            className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer active:scale-97 ${
              activeTab === 'type'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-700'
            }`}
          >
            <Type className="w-6 h-6 text-blue-600" />
            <span className="font-black text-xs sm:text-sm">
              {language === 'gu' ? '⌨ લખો' : language === 'hi' ? '⌨ लिखें' : '⌨ Type'}
            </span>
          </button>
        </div>

        {/* Tab 1: Photo Input Area */}
        {activeTab === 'photo' && (
          <div className="p-4 sm:p-6 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleImageFile(e.target.files[0]);
                }}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleImageFile(e.target.files[0]);
                }}
              />

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="w-full sm:w-auto px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
              >
                <Camera className="w-5 h-5" />
                <span>
                  {language === 'gu'
                    ? 'કેમેરાથી ફોટો પાડો'
                    : language === 'hi'
                    ? 'कैमरे से फोटो लें'
                    : 'Take Camera Photo'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-5 py-3.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <Upload className="w-5 h-5 text-stone-600" />
                <span>
                  {language === 'gu'
                    ? 'ગેલેરીમાંથી ફોટો પસંદ કરો'
                    : language === 'hi'
                    ? 'गैलरी से फोटो चुनें'
                    : 'Upload from Gallery'}
                </span>
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleLoadSamplePhoto}
                className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-full cursor-pointer transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {language === 'gu'
                    ? 'અથવા નમૂનાનો મગફળી ટીક્કા રોગ ફોટો લોડ કરો (ટેસ્ટ)'
                    : language === 'hi'
                    ? 'या नमूना मूंगफली टिक्का रोग फोटो लोड करें (परीक्षण)'
                    : 'Or load sample groundnut Tikka disease photo (Instant test)'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Voice Input Area */}
        {activeTab === 'voice' && (
          <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 text-center space-y-4">
            <p className="text-xs sm:text-sm font-bold text-stone-600">
              {language === 'gu'
                ? 'માઇક બટન દબાવો અને તમારી ભાષામાં પાકની સમસ્યા બોલો'
                : language === 'hi'
                ? 'माइक दबाएं और अपनी भाषा में फसल की समस्या बोलें'
                : 'Tap microphone and speak in Hindi, Gujarati, or English'}
            </p>

            <div className="flex flex-col items-center justify-center">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="w-20 h-20 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 transition-transform active:scale-95 cursor-pointer"
                >
                  <Mic className="w-10 h-10" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 animate-pulse transition-transform active:scale-95 cursor-pointer"
                >
                  <Square className="w-8 h-8 fill-current" />
                </button>
              )}

              <div className="mt-3">
                {isRecording ? (
                  <span className="text-rose-600 font-black text-sm animate-pulse">
                    ● Recording: {recordingSeconds}s (Tap to finish)
                  </span>
                ) : (
                  <span className="text-stone-400 text-xs font-bold">
                    {recordedAudioUrl ? 'Audio recorded! Transcribing...' : 'Ready to record'}
                  </span>
                )}
              </div>
            </div>

            {audioError && (
              <div className="p-3 bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-xs sm:text-sm font-semibold flex items-start gap-2 text-left">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{audioError}</span>
                  <div className="mt-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('type')}
                      className="text-xs font-black text-emerald-700 underline cursor-pointer"
                    >
                      {language === 'gu'
                        ? 'લખીને પ્રશ્ન પૂછો →'
                        : language === 'hi'
                        ? 'लिखकर सवाल पूछें →'
                        : 'Switch to Type Question →'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isTranscribing && (
              <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Transcribing your speech with Gemini 3.5 Transcribe...</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Video Input Area */}
        {activeTab === 'video' && (
          <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 text-center space-y-4">
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleVideoFile(e.target.files[0]);
              }}
            />

            <p className="text-xs sm:text-sm font-bold text-stone-600">
              {language === 'gu'
                ? 'ખેતરનો ટૂંકો વિડીયો ક્લિપ અપલોડ કરો (મહત્તમ 20 MB / 30 સેકન્ડ)'
                : language === 'hi'
                ? 'खेत की छोटी वीडियो क्लिप अपलोड करें (अधिकतम 20 MB / 30 सेकंड)'
                : 'Upload a short video clip of your crop (max 20MB / 30 seconds)'}
            </p>

            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="px-6 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-sm inline-flex items-center gap-2 cursor-pointer shadow-md transition"
            >
              <Video className="w-5 h-5" />
              <span>
                {language === 'gu' ? 'વિડીયો અપલોડ કરો' : language === 'hi' ? 'वीडियो अपलोड करें' : 'Choose Video'}
              </span>
            </button>

            {videoError && (
              <p className="text-xs font-bold text-rose-600">{videoError}</p>
            )}
          </div>
        )}

        {/* Tab 4: Common Symptom Prompt Chips */}
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-wider text-stone-500">
            {language === 'gu'
              ? 'સામાન્ય લક્ષણો (ક્લિક કરીને ઉમેરો)'
              : language === 'hi'
              ? 'सामान्य लक्षण (क्लिक करके जोड़ें)'
              : 'Common Symptoms (Tap to add)'}
          </label>
          <div className="flex flex-wrap gap-2">
            {quickChips[language].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChangeProblemText(
                    problemText ? `${problemText}. ${chip.text}` : chip.text
                  );
                }}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-900 border border-stone-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <span>{chip.icon}</span>
                <span>{chip.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Attached Media Previews */}
        {media.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
              Attached Media ({media.length})
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {media.map((item, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-2xl overflow-hidden border border-stone-300 bg-stone-100 p-1.5"
                >
                  {item.mimeType.startsWith('image/') ? (
                    <img
                      src={item.previewUrl || item.data}
                      alt="Crop symptom"
                      className="w-full h-24 object-cover rounded-xl"
                    />
                  ) : item.mimeType.startsWith('video/') ? (
                    <video
                      src={item.previewUrl || item.data}
                      className="w-full h-24 object-cover rounded-xl"
                      controls
                    />
                  ) : (
                    <div className="w-full h-24 flex flex-col items-center justify-center bg-purple-100 text-purple-800 rounded-xl p-2 text-center">
                      <Mic className="w-6 h-6 mb-1 text-purple-600" />
                      <span className="text-[10px] font-bold">{item.label}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => onRemoveMedia(idx)}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-white transition cursor-pointer shadow-sm"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-[10px] font-bold text-stone-600 truncate mt-1 px-1">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Problem Description Textbox */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-stone-700">
            {language === 'gu'
              ? 'પાકની સમસ્યાનું વિગતવાર વર્ણન (લખો અથવા સુધારો):'
              : language === 'hi'
              ? 'फसल की समस्या का विवरण (लिखें या सुधारें):'
              : 'Problem Description (Typed or Voice Transcribed):'}
          </label>
          <textarea
            rows={3}
            value={problemText}
            onChange={(e) => onChangeProblemText(e.target.value)}
            placeholder={
              language === 'gu'
                ? 'દા.ત. પાંદડા પર પીળા-કાળા ડાઘા પડ્યા છે, ૪ દિવસથી વધે છે...'
                : language === 'hi'
                ? 'जैसे पत्तों पर काले-भूरे धब्बे आ रहे हैं, 4 दिन से फैल रहे हैं...'
                : 'e.g. Dark spots on groundnut leaves, spreading rapidly after rain...'
            }
            className="w-full p-3.5 rounded-2xl border border-stone-300 text-sm font-medium text-stone-900 focus:outline-emerald-600 bg-stone-50/50"
          />
        </div>

        {/* Error message banner if diagnosis failed */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-start gap-3 text-rose-900 text-sm font-bold shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{errorMessage}</span>
              <p className="text-xs text-rose-700 mt-1 font-semibold">
                {language === 'gu'
                  ? 'કૃપા કરીને નીચે "ઉકેલ મેળવો" બટન ફરીથી દબાવો.'
                  : language === 'hi'
                  ? 'कृपया नीचे दिए गए "समाधान पाएं" बटन को दोबारा दबाएं।'
                  : 'Please tap the "Get Solution" button below to retry.'}
              </p>
            </div>
          </div>
        )}

        {/* Big "Get Solution" Button */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || (!problemText.trim() && media.length === 0)}
          className={`w-full min-h-[56px] py-4 px-6 rounded-full font-black text-[18px] sm:text-xl flex items-center justify-center gap-3 shadow-xl transition-all cursor-pointer active:scale-98 ${
            isLoading
              ? 'bg-amber-500 text-white cursor-wait'
              : !problemText.trim() && media.length === 0
              ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
              : 'btn-farm-primary'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl plant-growing-anim select-none">🌱</span>
              <span className="text-base sm:text-lg font-black tracking-wide">
                {language === 'gu'
                  ? 'કિસાન ભાઈ તમારા ખેતરની તપાસ કરી રહ્યા છે...'
                  : language === 'hi'
                  ? 'किसान भाई आपके खेत की जांच कर रहे हैं...'
                  : 'Kisan Bhai is checking your field...'}
              </span>
            </div>
          ) : (
            <>
              <Sparkles className="w-6 h-6 text-amber-300" />
              <span>
                {language === 'gu'
                  ? 'ઉકેલ મેળવો (Get Solution) →'
                  : language === 'hi'
                  ? 'समाधान पाएं (Get Solution) →'
                  : 'Get Solution →'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
