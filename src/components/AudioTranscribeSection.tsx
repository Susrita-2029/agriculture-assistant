import React, { useState, useRef } from 'react';
import { Language } from '../types';
import { requestAudioTranscription } from '../services/api';
import { t } from '../services/i18nService';
import { Mic, Square, Play, RotateCcw, Copy, Check, Sparkles, AlertCircle, FileText, ArrowRight } from 'lucide-react';

interface AudioTranscribeSectionProps {
  language: Language;
  onSendToAsk: (transcription: string) => void;
}

export const AudioTranscribeSection: React.FC<AudioTranscribeSectionProps> = ({ language, onSendToAsk }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMime, setAudioMime] = useState<string>('audio/webm');
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const startRecording = async () => {
    try {
      setError(null);
      setTranscribedText('');
      setAudioUrl(null);
      setAudioBase64(null);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      setAudioMime(mimeType);

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          setAudioBase64(res);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setError('Microphone access denied or not available. Please allow mic permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleTranscribe = async () => {
    if (!audioBase64) {
      setError('Please record an audio query first.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await requestAudioTranscription(audioBase64, audioMime, language);
      setTranscribedText(res.text || 'No speech detected.');
    } catch (err: any) {
      setError(err.message || 'Audio transcription with gemini-3.5-transcribe failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (transcribedText) {
      navigator.clipboard.writeText(transcribedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div id="transcribe-section" className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
      <div className="pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-emerald-700" />
          <h2 className="text-lg sm:text-xl font-extrabold text-stone-900">
            {t('transcribeTitle', language)}
          </h2>
          <span className="text-[10px] bg-purple-50 text-purple-800 font-extrabold px-2 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-600" />
            gemini-3.5-transcribe
          </span>
        </div>
        <p className="text-xs text-stone-500 mt-0.5">
          {t('transcribeSubtitle', language)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
        {/* Record Panel */}
        <div className="p-5 bg-stone-50/80 border border-stone-200 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">
              Voice Input (Microphone)
            </span>
            <p className="text-xs text-stone-500 leading-relaxed">
              Record spoken questions in Gujarati, Hindi, or English. Gemini 3.5 Transcribe accurately parses vernacular regional accents.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-4 space-y-3">
            {isRecording ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="relative">
                  <span className="w-16 h-16 rounded-full bg-rose-500/20 absolute -inset-0 animate-ping" />
                  <button
                    onClick={stopRecording}
                    className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transition relative z-10 cursor-pointer"
                  >
                    <Square className="w-6 h-6" />
                  </button>
                </div>
                <div className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                  Recording... {recordingSeconds}s (Click square to stop)
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <button
                  onClick={startRecording}
                  className="w-16 h-16 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shadow-md shadow-emerald-800/20 transition cursor-pointer"
                >
                  <Mic className="w-7 h-7" />
                </button>
                <span className="text-xs font-bold text-stone-700">Click to Start Recording</span>
              </div>
            )}

            {/* Audio Preview */}
            {audioUrl && !isRecording && (
              <div className="w-full pt-2">
                <audio controls src={audioUrl} className="w-full h-9 rounded-lg" />
              </div>
            )}
          </div>

          <button
            onClick={handleTranscribe}
            disabled={!audioBase64 || isRecording || loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-800/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Transcribing with Gemini 3.5...</span>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Transcribe Recorded Audio</span>
              </>
            )}
          </button>
        </div>

        {/* Output Panel */}
        <div className="p-5 bg-white border border-stone-200 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Verbatim Transcription Result
              </span>
              {transcribedText && (
                <button
                  onClick={handleCopy}
                  className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="bg-stone-50 rounded-xl p-4 min-h-[140px] text-xs sm:text-sm text-stone-800 leading-relaxed font-medium border border-stone-200 flex flex-col justify-center">
              {transcribedText ? (
                <span>"{transcribedText}"</span>
              ) : (
                <span className="text-stone-400 italic text-center">
                  Spoken text transcribed by gemini-3.5-transcribe will appear here.
                </span>
              )}
            </div>
          </div>

          {transcribedText && (
            <button
              onClick={() => onSendToAsk(transcribedText)}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Use as Query in Ask AgriSetu</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
