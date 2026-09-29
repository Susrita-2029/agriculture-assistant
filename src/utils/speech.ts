import { Language } from '../types';

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function speakText(
  text: string,
  lang: Language,
  onStart?: () => void,
  onEnd?: () => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Strip markdown, asterisks, brackets for natural reading
  const cleanText = text
    .replace(/[#*_`~]/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .trim();

  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  currentUtterance = utterance;

  // Language mapping for India
  const localeMap: Record<Language, string> = {
    en: 'en-IN',
    hi: 'hi-IN',
    gu: 'gu-IN',
    pa: 'pa-IN',
    bn: 'bn-IN',
    te: 'te-IN',
    ta: 'ta-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    mr: 'mr-IN',
    or: 'or-IN',
    raj: 'hi-IN', // Rajasthani uses Devanagari Hindi voice fallback
  };

  utterance.lang = localeMap[lang] || 'en-IN';

  // Find preferred voice if available
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) => v.lang.startsWith(lang) || v.lang.includes(lang));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.rate = 0.95; // Slightly slower, clear pace for farmers
  utterance.pitch = 1.0;

  if (onStart) utterance.onstart = onStart;
  utterance.onend = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };
  utterance.onerror = (e) => {
    console.warn('Speech synthesis notice:', e);
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

export function isSpeechSpeaking(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  return window.speechSynthesis.speaking;
}
