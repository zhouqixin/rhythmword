'use client';

/**
 * 答题音效 Hook — 统一管理三种音效
 *
 * 1. Key Tap: Kick Pulse — 键盘敲击时播放
 * 2. Success: Level Up — 回答正确时播放
 * 3. Failure: Descending Slide — 回答错误时播放
 *
 * 所有音效使用 Web Audio API 合成，零外部依赖
 */

import { useCallback, useRef } from 'react';

function getCtx(ctxRef: React.MutableRefObject<AudioContext | null>): AudioContext {
  if (!ctxRef.current) {
    ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (ctxRef.current.state === 'suspended') {
    ctxRef.current.resume();
  }
  return ctxRef.current;
}

export function useQuizSounds() {
  const ctxRef = useRef<AudioContext | null>(null);

  // ── Key Tap: Kick Pulse — 150→40Hz 低频下沉 ──
  const playKeyTap = useCallback(() => {
    try {
      const ctx = getCtx(ctxRef);
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
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
      // Non-critical — silently fail
    }
  }, []);

  // ── Success: Level Up — 递增扫频 400→1000Hz ──
  const playSuccess = useCallback(() => {
    try {
      const ctx = getCtx(ctxRef);
      const now = ctx.currentTime;
      [400, 500, 600, 800, 1000].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.08, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.12);
      });
    } catch {
      // Non-critical
    }
  }, []);

  // ── Failure: Descending Slide — G4→D4 下行 ──
  const playFailure = useCallback(() => {
    try {
      const ctx = getCtx(ctxRef);
      const now = ctx.currentTime;
      [392, 294].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.2);
        gain.gain.setValueAtTime(0.18, now + i * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.2);
        osc.stop(now + i * 0.2 + 0.35);
      });
    } catch {
      // Non-critical
    }
  }, []);

  return { playKeyTap, playSuccess, playFailure };
}
