'use client';

// 答题会话状态管理 Hook
// 核心状态机: idle → playing → submitting → result → next

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
}

const TOTAL_QUESTIONS = 20;

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
  });

  const sessionRef = useRef(state);
  sessionRef.current = state;

  // 加载下一题
  const loadNextQuestion = useCallback(async () => {
    try {
      const res = await fetch('/api/quiz/question');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '加载题目失败');
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
      console.error('加载题目失败:', err);
      setState((prev) => ({ ...prev, phase: 'idle' }));
    }
  }, []);

  // 开始新训练
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
    });
    // 延迟加载第一题
    setTimeout(() => loadNextQuestion(), 0);
  }, [loadNextQuestion]);

  // 处理字母输入
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

  // 删除上一个字母
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

  // 提交答案
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
        let newComboState: ComboState = 'active';

        if (isCorrect) {
          newCombo += 1;
          // 连续答对 20 题获得护盾
          if (newCombo > 0 && newCombo % 20 === 0 && newShields < 1) {
            newShields += 1;
          }
        } else {
          if (newShields > 0) {
            // 护盾保护
            newShields -= 1;
            newComboState = 'shielded';
          } else if (newCombo >= 30) {
            // 高 Combo 缓冲
            newComboState = 'buffering';
          } else {
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
      console.error('提交失败:', err);
      setState((prev) => ({ ...prev, phase: 'playing' }));
    }
  }, []);

  // 进入下一题
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
      comboState: prev.comboState === 'buffering' || prev.comboState === 'shielded'
        ? 'active'
        : prev.comboState === 'broken'
          ? 'active'
          : prev.comboState,
    }));

    loadNextQuestion();
  }, [loadNextQuestion]);

  // 缓冲状态下一题答错归零
  const handleBufferFail = useCallback(() => {
    setState((prev) => ({
      ...prev,
      combo: 0,
      comboState: 'broken',
    }));
  }, []);

  return {
    state,
    loadNextQuestion,
    startSession,
    handleKeyInput,
    handleBackspace,
    submitAnswer,
    nextQuestion,
    handleBufferFail,
    totalQuestions: TOTAL_QUESTIONS,
  };
}
