'use client';

// TTS Audio Hook - Uses Microsoft Edge Neural TTS via backend API
// High-quality natural voices (Jenny/Sonia) with MP3 streaming
// Falls back to Web Speech API if server TTS is unavailable

import { useCallback, useRef, useState } from 'react';

type Accent = 'en-US' | 'en-GB';
type TTSState = 'idle' | 'loading' | 'playing' | 'error';

interface UseTTSOptions {
  accent?: Accent;
  rate?: number;
  maxReplays?: number;
}

export function useTTS(options: UseTTSOptions = {}) {
  const { accent = 'en-US', maxReplays = 3 } = options;
  const [state, setState] = useState<TTSState>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const replayCount = useRef(0);
  const currentText = useRef('');
  const currentAccent = useRef(accent);

  // Server TTS via edge-tts
  const speakServer = useCallback(async (text: string, acc: string): Promise<boolean> => {
    try {
      const url = `/api/tts?text=${encodeURIComponent(text)}&accent=${encodeURIComponent(acc)}`;
      const res = await fetch(url);

      if (!res.ok) return false;

      const blob = await res.blob();
      if (blob.size === 0) return false;

      const audioUrl = URL.createObjectURL(blob);

      // Stop previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      return new Promise((resolve) => {
        audio.onplay = () => setState('playing');
        audio.onended = () => {
          setState('idle');
          URL.revokeObjectURL(audioUrl);
          resolve(true);
        };
        audio.onerror = () => {
          setState('error');
          URL.revokeObjectURL(audioUrl);
          resolve(false);
        };

        audio.play().catch(() => {
          setState('error');
          resolve(false);
        });
      });
    } catch {
      return false;
    }
  }, []);

  // Fallback: Web Speech API
  const speakFallback = useCallback((text: string, acc: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = acc;
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith(acc.split('-')[0]) && v.name.includes('Google')
    ) || voices.find((v) => v.lang === acc) || voices[0];

    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setState('playing');
    utterance.onend = () => setState('idle');
    utterance.onerror = () => setState('error');

    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback(
    async (text: string) => {
      if (!text || text.trim().length === 0) return;

      currentText.current = text;
      currentAccent.current = accent;
      replayCount.current = 0;
      setState('loading');

      // Try server TTS first
      const success = await speakServer(text, accent);

      // Fallback to Web Speech API
      if (!success) {
        speakFallback(text, accent);
      }
    },
    [accent, speakServer, speakFallback]
  );

  const replay = useCallback(() => {
    if (replayCount.current >= maxReplays) return;
    replayCount.current += 1;
    speak(currentText.current);
  }, [speak, maxReplays]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setState('idle');
  }, []);

  const canReplay = replayCount.current < maxReplays;
  const replaysLeft = maxReplays - replayCount.current;

  return { state, speak, replay, stop, canReplay, replaysLeft };
}
