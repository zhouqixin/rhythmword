'use client';

// 答题结果浮层
// 正确：绿色庆祝 + 积分飘字 → 5s 自动下一题
// 错误：逐字母标红错误位 + 正确答案 + 冷知识（固定高度防跳动） + 「我记住了」

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import type { QuizResult, ComboState } from '@/hooks/useQuizSession';

interface ResultOverlayProps {
  result: QuizResult;
  combo: number;
  comboState: ComboState;
  questionIndex: number;
  onNext: () => void;
}

/** Compare user answer vs correct answer, return per-position error flags */
function getErrorMap(userAnswer: string, correctAnswer: string): boolean[] {
  const len = Math.max(userAnswer.length, correctAnswer.length);
  const map: boolean[] = [];
  for (let i = 0; i < len; i++) {
    map.push(userAnswer[i]?.toLowerCase() !== correctAnswer[i]?.toLowerCase());
  }
  return map;
}

/** Render answer with per-letter highlighting */
function AnswerWithErrors({ answer, errorMap, isError }: { answer: string; errorMap: boolean[]; isError: boolean }) {
  return (
    <div className="flex justify-center gap-1 flex-wrap">
      {answer.split('').map((ch, i) => (
        <span
          key={i}
          className={cn(
            'inline-flex h-10 w-8 items-center justify-center rounded-md border-2 text-lg font-bold',
            errorMap[i]
              ? 'border-[var(--rhythm-error)] bg-[var(--rhythm-error)]/20 text-[var(--rhythm-error)]'
              : 'border-[var(--rhythm-success)]/60 bg-[var(--rhythm-success)]/15 text-[var(--rhythm-success)]'
          )}
        >
          {ch}
        </span>
      ))}
    </div>
  );
}

export default function ResultOverlay({
  result,
  combo,
  comboState,
  questionIndex,
  onNext,
}: ResultOverlayProps) {
  const [countdown, setCountdown] = useState(result.isCorrect ? 5 : 60);
  const [funFactIndex, setFunFactIndex] = useState(0);

  const errorMap = useMemo(
    () => getErrorMap(result.userAnswer || '', result.correctAnswer || ''),
    [result.userAnswer, result.correctAnswer]
  );

  // 倒计时
  useEffect(() => {
    if (countdown <= 0) {
      onNext();
      return;
    }
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown, onNext]);

  // Enter 键跳过
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext]);

  // 冷知识轮换（3s 一条）
  useEffect(() => {
    if (result.isCorrect || result.funFacts.length <= 1) return;
    const timer = setInterval(() => {
      setFunFactIndex((prev) => (prev + 1) % result.funFacts.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [result.isCorrect, result.funFacts.length]);

  const getComboMessage = () => {
    if (comboState === 'shielded') return '🛡️ 护盾保护！Combo 保持不变';
    if (comboState === 'buffering') return '⚠️ 缓冲中...下一题答对可恢复';
    if (comboState === 'broken') return '💔 Combo 归零';
    return '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className={cn(
          'mx-4 w-full max-w-md rounded-3xl p-8 text-center shadow-2xl',
          result.isCorrect
            ? 'border border-[var(--rhythm-success)]/30 bg-[var(--rhythm-bg-card)]'
            : 'border border-[var(--rhythm-error)]/30 bg-[var(--rhythm-bg-card)]'
        )}
      >
        {/* 结果图标 */}
        <div className="mb-4">
          {result.isCorrect ? (
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--rhythm-success)]/20 text-5xl animate-combo-grow">
              ✅
            </div>
          ) : (
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--rhythm-error)]/20 text-5xl animate-shake">
              ❌
            </div>
          )}
        </div>

        {/* 结果文字 */}
        <h2
          className={cn(
            'mb-4 text-2xl font-bold',
            result.isCorrect ? 'text-[var(--rhythm-success)]' : 'text-[var(--rhythm-error)]'
          )}
        >
          {result.isCorrect ? '回答正确！' : '回答错误'}
        </h2>

        {/* 错误时：逐字母标红 + 显示正确答案 */}
        {!result.isCorrect && (
          <div className="mb-4 space-y-3">
            <div>
              <p className="mb-2 text-xs text-[var(--rhythm-neutral-500)]">你的答案</p>
              <AnswerWithErrors answer={result.userAnswer || ''} errorMap={errorMap} isError />
            </div>
            <div>
              <p className="mb-2 text-xs text-[var(--rhythm-neutral-500)]">正确答案</p>
              <p className="font-display text-2xl font-bold text-[var(--rhythm-success-light)]">
                {result.correctAnswer}
              </p>
            </div>
          </div>
        )}

        {/* 冷知识 — 固定高度防止跳动 */}
        {result.funFacts.length > 0 && (
          <div className="mb-4 rounded-xl border border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-elevated)] p-4" style={{ minHeight: '88px' }}>
            <p className="mb-1 text-xs text-[var(--rhythm-info)]">💡 冷知识</p>
            <p className="text-sm text-[var(--rhythm-neutral-200)] leading-relaxed">
              {result.funFacts[funFactIndex]}
            </p>
            {result.funFacts.length > 1 && (
              <div className="mt-2 flex justify-center gap-1">
                {result.funFacts.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1.5 w-1.5 rounded-full transition-colors',
                      i === funFactIndex
                        ? 'bg-[var(--rhythm-primary-light)]'
                        : 'bg-[var(--rhythm-bg-border)]'
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 无冷知识时的占位 */}
        {result.funFacts.length === 0 && (
          <div className="mb-4" style={{ minHeight: '88px' }} />
        )}

        {/* Combo 状态变化 */}
        {getComboMessage() && (
          <p className="mb-3 text-sm font-medium text-[var(--rhythm-neutral-400)]">
            {getComboMessage()}
          </p>
        )}

        {/* 积分飘字 */}
        {result.scoreEarned > 0 && (
          <div className="mb-4 animate-float-up">
            <span className="text-lg font-bold text-[var(--rhythm-secondary-amber)]">
              +{result.scoreEarned} ⭐
            </span>
            {result.isQuickResponse && (
              <span className="ml-2 text-xs text-[var(--rhythm-secondary-cyan)]">⚡ 快速反应</span>
            )}
            {result.isPerfectSpelling && (
              <span className="ml-2 text-xs text-[var(--rhythm-secondary-amber)]">✨ 完美拼写</span>
            )}
          </div>
        )}

        {/* 倒计时进度条 */}
        <div className="mb-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--rhythm-bg-border)]">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-1000',
                countdown > 30 ? 'bg-[var(--rhythm-success)]'
                  : countdown > 10 ? 'bg-[var(--rhythm-warning)]'
                  : 'bg-[var(--rhythm-error)]'
              )}
              style={{
                width: `${result.isCorrect ? (countdown / 5) * 100 : (countdown / 60) * 100}%`,
              }}
            />
          </div>
          <p className="mt-1 text-xs text-[var(--rhythm-neutral-600)]">
            {countdown}s 后自动进入下一题
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          {!result.isCorrect && (
            <button
              onClick={onNext}
              className="flex-1 rounded-xl bg-[var(--rhythm-primary)] px-6 py-3 font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97]"
            >
              我记住了
            </button>
          )}
          <button
            onClick={onNext}
            className={cn(
              'rounded-xl px-6 py-3 text-sm transition-all',
              result.isCorrect
                ? 'w-full bg-[var(--rhythm-primary)] font-semibold text-white hover:brightness-110'
                : 'border border-[var(--rhythm-bg-border)] text-[var(--rhythm-neutral-400)] hover:text-[var(--rhythm-neutral-200)]'
            )}
          >
            跳过 ({countdown}s)
          </button>
        </div>
      </div>
    </div>
  );
}
