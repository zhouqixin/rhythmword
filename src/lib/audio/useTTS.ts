'use client';

// TTS Audio Hook - Enhanced with voice selection and fallback
// Uses Web Speech API with best-available voice detection
// Falls back gracefully when no good voice is available

import { useCallback, useRef, useState } from 'react';

type Accent = 'en-US' | 'en-GB';
type TTSState = 'idle' | 'loading' | 'playing' | 'error';

interface UseTTSOptions {
  accent?: Accent;
  rate?: number;
  maxReplays?: number;
}

// Voice quality ranking - prefer these voices
const PREFERRED_VOICES = [
  'Google US English',
  'Microsoft David',
  'Microsoft Zira',
  'Samantha',
  'Alex',
  'Karen',
  'Daniel',
  'Google UK English Female',
  'Google UK English Male',
];

function findBestVoice(lang: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;

  const voices = window.speechSynthesis.getVoices();

  if (voices.length === 0) return null;

  // Try to find a preferred voice matching the language
  for (const preferred of PREFERRED_VOICES) {
    const voice = voices.find(
      (v) => v.name.includes(preferred) && v.lang.startsWith(lang.split('-')[0])
    );
    if (voice) return voice;
  }

  // Fallback: any voice matching the exact lang
  const exactMatch = voices.find((v) => v.lang === lang);
  if (exactMatch) return exactMatch;

  // Fallback: any voice matching the language prefix
  const prefixMatch = voices.find((v) => v.lang.startsWith(lang.split('-')[0]));
  if (prefixMatch) return prefixMatch;

  // Last resort: first available voice
  return voices[0] || null;
}

export function useTTS(options: UseTTSOptions = {}) {
  const { accent = 'en-US', rate = 0.85, maxReplays = 3 } = options;
  const [state, setState] = useState<TTSState>('idle');
  const replayCount = useRef(0);
  const currentText = useRef('');
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const voicesLoaded = useRef(false);

  // Load voices on first use (they load async in Chrome)
  const ensureVoices = useCallback((): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0 && !voicesLoaded.current) {
      voiceRef.current = findBestVoice(accent);
      voicesLoaded.current = true;
    }

    if (!voiceRef.current && voices.length > 0) {
      voiceRef.current = findBestVoice(accent);
    }

    return voiceRef.current;
  }, [accent]);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        setState('error');
        console.warn('Web Speech API not available');
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const voice = ensureVoices();

      // If no voice available after trying, try loading them
      if (!voice) {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
          // Voices not loaded yet - trigger async load
          window.speechSynthesis.onvoiceschanged = () => {
            voiceRef.current = findBestVoice(accent);
            voicesLoaded.current = true;
            // Retry speak after voices load
            doSpeak(text);
          };
          return;
        }
      }

      doSpeak(text);
    },
    [accent, rate, ensureVoices]
  );

  const doSpeak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = accent;
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Apply best voice if available
    const voice = voiceRef.current || findBestVoice(accent);
    if (voice) {
      utterance.voice = voice;
    }

    currentText.current = text;
    replayCount.current = 0;
    setState('loading');

    utterance.onstart = () => setState('playing');
    utterance.onend = () => setState('idle');
    utterance.onerror = (e) => {
      // Ignore 'interrupted' errors (from cancel())
      if (e.error !== 'interrupted') {
        console.warn('TTS error:', e.error);
        setState('error');
      } else {
        setState('idle');
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [accent, rate]);

  const replay = useCallback(() => {
    if (replayCount.current >= maxReplays) return;
    replayCount.current += 1;
    doSpeak(currentText.current);
  }, [doSpeak, maxReplays]);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setState('idle');
    }
  }, []);

  const canReplay = replayCount.current < maxReplays;
  const replaysLeft = maxReplays - replayCount.current;

  return { state, speak, replay, stop, canReplay, replaysLeft };
}
