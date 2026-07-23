'use client';

// TTS 音频播放 Hook
// 封装 Web Speech API，支持英音/美音、重播、状态管理

import { useCallback, useRef, useState } from 'react';

type Accent = 'en-US' | 'en-GB';
type TTSState = 'idle' | 'loading' | 'playing' | 'error';

interface UseTTSOptions {
  accent?: Accent;
  rate?: number; // 0.1 - 10, 默认 1.0
  maxReplays?: number;
}

export function useTTS(options: UseTTSOptions = {}) {
  const { accent = 'en-US', rate = 0.9, maxReplays = 3 } = options;
  const [state, setState] = useState<TTSState>('idle');
  const replayCount = useRef(0);
  const currentText = useRef('');

  const speak = useCallback(
    (text: string) => {
      // 浏览器不支持
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        setState('error');
        console.warn('Web Speech API 不可用');
        return;
      }

      // 取消当前播放
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = accent;
      utterance.rate = rate;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      currentText.current = text;
      replayCount.current = 0;
      setState('loading');

      utterance.onstart = () => setState('playing');
      utterance.onend = () => setState('idle');
      utterance.onerror = (e) => {
        console.warn('TTS 播放错误:', e);
        setState('error');
      };

      window.speechSynthesis.speak(utterance);
    },
    [accent, rate]
  );

  const replay = useCallback(() => {
    if (replayCount.current >= maxReplays) return;
    replayCount.current += 1;
    speak(currentText.current);
  }, [speak, maxReplays]);

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
