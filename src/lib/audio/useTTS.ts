'use client';

import { useCallback, useRef, useState } from 'react';

type Accent = 'en-US' | 'en-GB';

export function getDifficultyRate(difficulty: string): number {
  switch (difficulty) {
    case 'easy': return -30;
    case 'medium': return -40;
    case 'hard': return -50;
    default: return -45;
  }
}

export function useTTS(options: { accent?: Accent; rate?: number } = {}) {
  const { accent = 'en-US', rate = -45 } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentRate, setCurrentRate] = useState(rate);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(
    async (text: string, customRate?: number) => {
      if (!text || text.trim().length === 0) return;

      // Stop any currently playing audio immediately
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
        audioRef.current = null;
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      setIsSpeaking(true);
      const r = customRate !== undefined ? customRate : currentRate;

      try {
        const url = `/api/tts?text=${encodeURIComponent(text)}&accent=${encodeURIComponent(accent)}&rate=${r}`;
        const res = await fetch(url);

        if (!res.ok) {
          setIsSpeaking(false);
          return;
        }

        const blob = await res.blob();
        if (blob.size === 0) {
          setIsSpeaking(false);
          return;
        }

        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        const done = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
        };

        audio.onended = done;
        audio.onerror = done;
        await audio.play();
      } catch {
        setIsSpeaking(false);
      }
    },
    [accent, currentRate]
  );

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, speak, stop, currentRate, setCurrentRate };
}
