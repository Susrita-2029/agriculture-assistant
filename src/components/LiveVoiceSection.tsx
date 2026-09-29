import React, { useState, useEffect, useRef } from 'react';
import { FarmContext, Language } from '../types';
import { t } from '../services/i18nService';
import { Mic, MicOff, PhoneCall, PhoneOff, Radio, Volume2, Sparkles, AlertCircle, MessageSquare } from 'lucide-react';

interface LiveVoiceSectionProps {
  context: FarmContext;
  language: Language;
}

export const LiveVoiceSection: React.FC<LiveVoiceSectionProps> = ({ context, language }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [transcript, setTranscript] = useState<{ sender: 'user' | 'model'; text: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef<boolean>(false);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnectLive();
    };
  }, []);

  const playNextInQueue = () => {
    if (audioQueueRef.current.length === 0 || !outputAudioCtxRef.current) {
      isPlayingRef.current = false;
      setIsTalking(false);
      return;
    }

    isPlayingRef.current = true;
    setIsTalking(true);

    const buffer = audioQueueRef.current.shift()!;
    const source = outputAudioCtxRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(outputAudioCtxRef.current.destination);
    source.onended = () => {
      playNextInQueue();
    };
    source.start();
  };

  const playRawPcmChunk = (base64Data: string) => {
    try {
      if (!outputAudioCtxRef.current) {
        outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // 16-bit PCM little endian to Float32
      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = outputAudioCtxRef.current.createBuffer(1, float32Array.length, 24000);
      audioBuffer.copyToChannel(float32Array, 0);

      audioQueueRef.current.push(audioBuffer);
      if (!isPlayingRef.current) {
        playNextInQueue();
      }
    } catch (err) {
      console.error('Error playing raw PCM chunk:', err);
    }
  };

  const connectLive = async () => {
    try {
      setError(null);
      setTranscript([
        { sender: 'model', text: `Namaste! AgriSetu Live Voice is ready. Ask me any question regarding your ${context.crop} crop in ${context.district}.` },
      ]);

      // Setup microphone stream (16kHz)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const inputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputAudioCtx;

      outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      // Connect WebSocket to /live-voice
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live-voice`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);

        // Send initial context to the live model
        ws.send(JSON.stringify({
          type: 'text',
          text: `Farmer profile: ${context.crop} at ${context.crop_stage} stage in ${context.district}, ${context.state}. Preferred language: ${language}.`,
        }));

        // Capture microphone audio at 16kHz and send PCM
        const source = inputAudioCtx.createMediaStreamSource(stream);
        const processor = inputAudioCtx.createScriptProcessor(2048, 1, 1);
        source.connect(processor);
        processor.connect(inputAudioCtx.destination);

        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            // Convert Float32 to Int16 PCM
            const pcm16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
            }

            // Convert to base64
            let binary = '';
            const bytes = new Uint8Array(pcm16.buffer);
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);

            ws.send(JSON.stringify({
              type: 'audio',
              data: base64,
            }));
          }
        };
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'audio' && msg.data) {
            playRawPcmChunk(msg.data);
          }
          if (msg.type === 'text' && msg.text) {
            setTranscript((prev) => [...prev, { sender: 'model', text: msg.text }]);
          }
          if (msg.type === 'interrupted') {
            audioQueueRef.current = [];
            isPlayingRef.current = false;
            setIsTalking(false);
          }
          if (msg.type === 'error') {
            setError(msg.message);
          }
        } catch (err) {
          console.error('Error handling live message:', err);
        }
      };

      ws.onerror = (e) => {
        console.error('Live WebSocket error:', e);
        setError('Live connection error. Check server and network availability.');
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
      };
    } catch (err: any) {
      setError(err.message || 'Microphone access denied or Live API failed to connect.');
      setIsConnected(false);
    }
  };

  const disconnectLive = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setIsConnected(false);
    setIsTalking(false);
  };

  return (
    <div id="live-voice-section" className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-700 animate-pulse" />
            <h2 className="text-lg sm:text-xl font-extrabold text-stone-900">
              {t('liveVoiceTitle', language)}
            </h2>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              gemini-3.8-live
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            {t('liveVoiceSubtitle', language)}
          </p>
        </div>

        <div>
          {isConnected ? (
            <button
              onClick={disconnectLive}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Live Conversation</span>
            </button>
          ) : (
            <button
              onClick={connectLive}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-800/20 transition flex items-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Start Live Voice (gemini-3.8-live)</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Live Voice State Indicator */}
      <div className="mt-4 p-6 bg-stone-900 text-white rounded-2xl flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          {isConnected && (
            <span className={`w-24 h-24 rounded-full absolute -inset-0 animate-ping opacity-40 ${
              isTalking ? 'bg-emerald-400' : 'bg-blue-400'
            }`} />
          )}
          <div className={`w-24 h-24 rounded-full flex items-center justify-center relative z-10 transition-all ${
            isConnected
              ? isTalking
                ? 'bg-emerald-600 shadow-xl shadow-emerald-500/30 ring-4 ring-emerald-300'
                : 'bg-blue-600 shadow-lg ring-4 ring-blue-300'
              : 'bg-stone-800 text-stone-500'
          }`}>
            {isConnected ? (
              isTalking ? (
                <Volume2 className="w-10 h-10 text-white animate-bounce" />
              ) : (
                <Mic className="w-10 h-10 text-white animate-pulse" />
              )
            ) : (
              <MicOff className="w-10 h-10 text-stone-500" />
            )}
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm font-bold">
            {isConnected
              ? isTalking
                ? 'Gemini 3.8 Live is speaking...'
                : 'Listening to your microphone in real-time... Speak freely!'
              : 'Real-time conversational streaming powered by gemini-3.8-live'}
          </div>
          <p className="text-xs text-stone-400 mt-1">
            {isConnected
              ? 'Voice inputs are streamed with low latency directly via WebSockets.'
              : 'Click "Start Live Voice" above to grant mic access and speak with AgriSetu.'}
          </p>
        </div>
      </div>

      {/* Live Transcript Stream */}
      {transcript.length > 0 && (
        <div className="mt-4 p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2 max-h-48 overflow-y-auto text-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
            Live Conversation Transcript
          </span>
          {transcript.map((item, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-lg font-medium leading-relaxed ${
                item.sender === 'model'
                  ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                  : 'bg-white text-stone-900 border border-stone-200'
              }`}
            >
              <strong className="block text-[11px] mb-0.5 font-bold uppercase text-stone-500">
                {item.sender === 'model' ? '🌱 AgriSetu Live' : '🧑‍🌾 You'}
              </strong>
              {item.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
