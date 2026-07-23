'use client';

// 答题会话状态管理 Hook — M4 增强版
// Combo 三层保护：护盾 → 缓冲 → 归零
// 护盾获取：连续答对 20 题得 1 个（不叠加，冷却期需再连对 20 题）
// 缓冲：Combo>=30 时答错进入缓冲，下一题答对恢复，再答错归零
// 虽败犹荣：Combo>=30 归零时弹出安慰卡片

import { useCallback, useRef, useState } from 'react';

export interface QuizQuestion {
  id: string;
  sentenceEn: string;
  sentenceZh: string;
  targetWord: string;
  firstLetter: string;
  blankCount: number;
  questionType: string;
  bpm: number;
  funFacts: string[];
}

export interface QuizResult {
  isCorrect: boolean;
  correctAnswer: string;
  userAnswer: string;
  scoreEarned: number;
  isQuickResponse: boolean;
  isPerfectSpelling: boolean;
  funFacts: string[];
}

export type ComboState = 'active' | 'shielded' | 'buffering' | 'broken';
export type QuizPhase = 'idle' | 'playing' | 'submitting' | 'result' | 'finished';

interface QuizSessionState {
  phase: QuizPhase;
  questionIndex: number;
  currentQuestion: QuizQuestion | null;
  userInput: string[];
  activeSlot: number;
  combo: number;
  maxCombo: number;
  shields: number;
  comboState: ComboState;
  sessionScore: number;
  correctCount: number;
  lastResult: QuizResult | null;
  startTime: number;
  consecutiveCorrect: number;  // 当前连续答对数（用于护盾获取追踪）
  shieldCoolingDown: boolean;  // 护盾消耗后冷却中
  showConsolation: boolean;    // 显示虽败犹荣卡片
  lastMilestone: number;       // 上次触发的里程碑值
  brokenCombo: number;         // 归零前的 Combo 值（用于安慰卡片）
}

const TOTAL_QUESTIONS = 20;
const SHIELD_THRESHOLD = 20;     // 连续答对 20 题获得护盾
const CONSOLATION_THRESHOLD = 30; // Combo>=30 归零触发安慰卡片

export function useQuizSession() {
  const [state, setState] = useState<QuizSessionState>({
    phase: 'idle',
    questionIndex: 0,
    currentQuestion: null,
    userInput: [],
    activeSlot: 0,
    combo: 0,
    maxCombo: 0,
    shields: 0,
    comboState: 'active',
    sessionScore: 0,
    correctCount: 0,
    lastResult: null,
    startTime: 0,
    consecutiveCorrect: 0,
    shieldCoolingDown: false,
    showConsolation: false,
    lastMilestone: 0,
    brokenCombo: 0,
  });

  const sessionRef = useRef(state);
  sessionRef.current = state;

  const loadNextQuestion = useCallback(async () => {
    try {
      const res = await fetch('/api/quiz/question');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to load question');
      }
      const data = await res.json();
      const q = data.question as QuizQuestion;

      setState((prev) => ({
        ...prev,
        phase: 'playing',
        currentQuestion: q,
        userInput: Array(q.blankCount).fill(''),
        activeSlot: 0,
        startTime: Date.now(),
        lastResult: null,
      }));
    } catch (err) {
      console.error('Failed to load question:', err);
      setState((prev) => ({ ...prev, phase: 'idle' }));
    }
  }, []);

  const startSession = useCallback(async () => {
    setState({
      phase: 'playing',
      questionIndex: 0,
      currentQuestion: null,
      userInput: [],
      activeSlot: 0,
      combo: 0,
      maxCombo: 0,
      shields: 0,
      comboState: 'active',
      sessionScore: 0,
      correctCount: 0,
      lastResult: null,
      startTime: 0,
      consecutiveCorrect: 0,
      shieldCoolingDown: false,
      showConsolation: false,
      lastMilestone: 0,
      brokenCombo: 0,
    });
    setTimeout(() => loadNextQuestion(), 0);
  }, [loadNextQuestion]);

  const handleKeyInput = useCallback((key: string) => {
    const s = sessionRef.current;
    if (s.phase !== 'playing' || !s.currentQuestion) return;

    setState((prev) => {
      if (!prev.currentQuestion) return prev;
      const newInput = [...prev.userInput];
      const slot = prev.activeSlot;

      if (slot < prev.currentQuestion.blankCount) {
        newInput[slot] = key.toLowerCase();
        return {
          ...prev,
          userInput: newInput,
          activeSlot: Math.min(slot + 1, prev.currentQuestion.blankCount),
        };
      }
      return prev;
    });
  }, []);

  const handleBackspace = useCallback(() => {
    const s = sessionRef.current;
    if (s.phase !== 'playing') return;

    setState((prev) => {
      const slot = prev.activeSlot;
      const newInput = [...prev.userInput];

      if (slot > 0) {
        newInput[slot - 1] = '';
        return { ...prev, userInput: newInput, activeSlot: slot - 1 };
      }
      return prev;
    });
  }, []);

  const submitAnswer = useCallback(async () => {
    const s = sessionRef.current;
    if (s.phase !== 'playing' || !s.currentQuestion) return;

    const userAnswer = s.userInput.join('');
    if (userAnswer.length === 0) return;

    setState((prev) => ({ ...prev, phase: 'submitting' }));

    const timeSpent = Date.now() - s.startTime;

    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: s.currentQuestion.id,
          userAnswer,
          timeSpent,
          comboBefore: s.combo,
        }),
      });

      const data = await res.json();

      setState((prev) => {
        const isCorrect = data.isCorrect;
        let newCombo = prev.combo;
        let newShields = prev.shields;
        let newComboState: ComboState = prev.comboState;
        let newConsecutive = prev.consecutiveCorrect;
        let newCoolingDown = prev.shieldCoolingDown;
        let newShowConsolation = false;
        let newBrokenCombo = 0;

        if (isCorrect) {
          newCombo += 1;
          newConsecutive += 1;

          // 护盾获取：连续答对 20 题 + 当前护盾 < 1 + 不在冷却期
          if (newConsecutive >= SHIELD_THRESHOLD && newShields < 1 && !newCoolingDown) {
            newShields += 1;
            newConsecutive = 0; // 重置计数
          }

          // 缓冲恢复：缓冲状态下答对，恢复 Combo
          if (prev.comboState === 'buffering') {
            newComboState = 'active';
          } else {
            newComboState = 'active';
          }
        } else {
          newConsecutive = 0; // 答错重置连续计数

          // 三层保护判断
          if (newShields > 0) {
            // 第一层：护盾保护
            newShields -= 1;
            newComboState = 'shielded';
            newCoolingDown = true; // 护盾消耗后进入冷却期
          } else if (newCombo >= CONSOLATION_THRESHOLD) {
            // 第二层：缓冲（高 Combo 保护）
            newComboState = 'buffering';
          } else {
            // 第三层：归零
            if (newCombo >= CONSOLATION_THRESHOLD) {
              newShowConsolation = true; // 虽败犹荣
              newBrokenCombo = newCombo;
            }
            newCombo = 0;
            newComboState = 'broken';
          }
        }

        return {
          ...prev,
          phase: 'result',
          combo: newCombo,
          maxCombo: Math.max(prev.maxCombo, newCombo),
          shields: newShields,
          comboState: newComboState,
          sessionScore: prev.sessionScore + data.scoreEarned,
          correctCount: prev.correctCount + (isCorrect ? 1 : 0),
          consecutiveCorrect: newConsecutive,
          shieldCoolingDown: newCoolingDown,
          showConsolation: newShowConsolation,
          brokenCombo: newBrokenCombo,
          lastResult: {
            isCorrect,
            correctAnswer: data.correctAnswer,
            userAnswer: data.userAnswer,
            scoreEarned: data.scoreEarned,
            isQuickResponse: data.isQuickResponse,
            isPerfectSpelling: data.isPerfectSpelling,
            funFacts: data.funFacts || [],
          },
        };
      });
    } catch (err) {
      console.error('Submit failed:', err);
      setState((prev) => ({ ...prev, phase: 'playing' }));
    }
  }, []);

  const nextQuestion = useCallback(() => {
    const s = sessionRef.current;
    const nextIndex = s.questionIndex + 1;

    if (nextIndex >= TOTAL_QUESTIONS) {
      setState((prev) => ({ ...prev, phase: 'finished' }));
      return;
    }

    setState((prev) => ({
      ...prev,
      questionIndex: nextIndex,
      phase: 'idle',
      currentQuestion: null,
      userInput: [],
      activeSlot: 0,
      lastResult: null,
      showConsolation: false,
      // 缓冲/护盾状态持续到下一题
      comboState: prev.comboState === 'shielded'
        ? 'active'
        : prev.comboState === 'broken'
          ? 'active'
          : prev.comboState,
    }));

    loadNextQuestion();
  }, [loadNextQuestion]);

  // 缓冲状态超时归零
  const handleBufferTimeout = useCallback(() => {
    setState((prev) => {
      const brokenCombo = prev.combo;
      return {
        ...prev,
        combo: 0,
        comboState: 'broken',
        showConsolation: brokenCombo >= CONSOLATION_THRESHOLD,
        brokenCombo: brokenCombo >= CONSOLATION_THRESHOLD ? brokenCombo : 0,
      };
    });
  }, []);

  // 关闭虽败犹荣卡片
  const dismissConsolation = useCallback(() => {
    setState((prev) => ({ ...prev, showConsolation: false }));
  }, []);

  return {
    state,
    loadNextQuestion,
    startSession,
    handleKeyInput,
    handleBackspace,
    submitAnswer,
    nextQuestion,
    handleBufferTimeout,
    dismissConsolation,
    totalQuestions: TOTAL_QUESTIONS,
  };
}
