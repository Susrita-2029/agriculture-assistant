import React, { useState, useEffect } from 'react';
import { FarmContext, AskAgriSetuResponse, Language } from '../types';
import { requestAskAgriSetu } from '../services/api';
import { t } from '../services/i18nService';
import { MessageSquare, Mic, MicOff, Send, HelpCircle, AlertTriangle, ShieldCheck, Search, ListChecks, CheckCircle2 } from 'lucide-react';

interface AskAgriSetuSectionProps {
  context: FarmContext;
  language: Language;
  externalQuestion?: string;
}

export const AskAgriSetuSection: React.FC<AskAgriSetuSectionProps> = ({ context, language, externalQuestion }) => {
  const [question, setQuestion] = useState(externalQuestion || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (externalQuestion) {
      setQuestion(externalQuestion);
    }
  }, [externalQuestion]);
  const [response, setResponse] = useState<AskAgriSetuResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setSpeechSupported(false);
    }
  }, []);

  const handleStartVoice = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert(t('voiceUnsupported', language));
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = false;

      // Match locale code to selected language
      if (language === 'hi') recognition.lang = 'hi-IN';
      else if (language === 'gu') recognition.lang = 'gu-IN';
      else recognition.lang = 'en-IN';

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuestion(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setError('Please type or speak your agricultural question.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await requestAskAgriSetu(question, context);
      setResponse(data);
    } catch (err: any) {
      setError(err.message || 'Failed to get answer from AgriSetu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ask-section" className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
      <div className="pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-700" />
          <h2 className="text-lg sm:text-xl font-extrabold text-stone-900">
            Ask AgriSetu (Voice & Text Agronomist)
          </h2>
        </div>
        <p className="text-xs text-stone-500 mt-0.5">
          Ask questions in English, Hindi, or Gujarati. Grounded in your {context.crop} crop ({context.crop_stage} stage) in {context.district}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <textarea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t('askPlaceholder', language)}
            className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {speechSupported ? (
              <button
                type="button"
                onClick={handleStartVoice}
                disabled={isListening || loading}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                  isListening
                    ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                }`}
              >
                {isListening ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>{t('listening', language)}</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-stone-600" />
                    <span>{t('startVoice', language)}</span>
                  </>
                )}
              </button>
            ) : (
              <span className="text-xs text-stone-400 italic flex items-center gap-1">
                <MicOff className="w-3.5 h-3.5" />
                {t('voiceUnsupported', language)}
              </span>
            )}

            {/* Quick Sample Queries */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-500 font-medium">
              <span>Try:</span>
              <button
                type="button"
                onClick={() => setQuestion('Leaves are turning yellow with brown spots. What should I spray?')}
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-0.5 rounded-lg border border-stone-200 cursor-pointer"
              >
                Yellow leaves
              </button>
              <button
                type="button"
                onClick={() => setQuestion('Should I irrigate today given current humidity and rain forecast?')}
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-0.5 rounded-lg border border-stone-200 cursor-pointer"
              >
                Irrigation check
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-bold px-5 py-2 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-800/20 transition flex items-center gap-1.5 cursor-pointer ml-auto"
          >
            {loading ? (
              <span>Consulting Gemini...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>{t('askButton', language)}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {response && (
        <div className="mt-5 space-y-4">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
            <h3 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              AgriSetu Assessment
            </h3>
            <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-semibold">
              {response.answer}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
              <h4 className="text-xs font-extrabold text-stone-900 mb-1.5 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-stone-600" />
                Likely Causes
              </h4>
              <ul className="list-disc list-inside text-xs text-stone-700 space-y-1 font-medium">
                {response.likelyCauses.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
              <h4 className="text-xs font-extrabold text-stone-900 mb-1.5 flex items-center gap-1.5">
                <ListChecks className="w-3.5 h-3.5 text-stone-600" />
                What to Physically Inspect
              </h4>
              <ul className="list-disc list-inside text-xs text-stone-700 space-y-1 font-medium">
                {response.whatToCheck.map((chk, i) => (
                  <li key={i}>{chk}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl">
              <h4 className="text-xs font-extrabold text-blue-950 mb-1.5 flex items-center gap-1.5">
                <ListChecks className="w-3.5 h-3.5 text-blue-700" />
                Recommended Next Steps
              </h4>
              <ol className="list-decimal list-inside text-xs text-blue-950 space-y-1 font-medium">
                {response.nextSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>

            <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-xl">
              <h4 className="text-xs font-extrabold text-rose-950 mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                Critical Warning Signs
              </h4>
              <ul className="list-disc list-inside text-xs text-rose-950 space-y-1 font-medium">
                {response.warningSigns.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 font-medium">
            <strong className="font-bold text-amber-900">When to consult local agronomist:</strong> {response.whenToConsultExpert}
          </div>

          <div className="p-2.5 bg-stone-100 rounded-lg text-center text-[11px] text-stone-500 font-semibold flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>{response.disclaimer}</span>
          </div>
        </div>
      )}
    </div>
  );
};
