'use client';

// 节拍器 Hook — Kick Drum 底鼓音效
// Web Audio API 合成，零外部依赖
// 答题时根据 BPM 循环播放，营造节奏氛围

import { useCallback, useEffect, useRef } from 'react';

export function useMetronome() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRunningRef = useRef(false);

  // Kick Drum — deep bass thump
  const playClick = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Low frequency sweep: 150Hz → 40Hz for deep thump
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Silently fail — metronome is non-critical
    }
  }, []);

  const start = useCallback((bpm: number) => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    const intervalMs = (60 / bpm) * 1000;

    // Play immediately on start
    playClick();

    timerRef.current = setInterval(() => {
      playClick();
    }, intervalMs);
  }, [playClick]);

  const stop = useCallback(() => {
    isRunningRef.current = false;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, [stop]);

  return { start, stop };
}
