'use client';

// 单个字母输入槽组件
// 状态: empty | filled | focused | correct | error

import { cn } from '@/lib/utils';

interface LetterSlotProps {
  value: string;
  index: number;
  isActive: boolean;
  isCorrect?: boolean | null;
  isError?: boolean | null;
  isGiven?: boolean;
  isHint?: boolean;
  // Per-letter error tracking: array of booleans for each position
  errorPositions?: boolean[];
}

export default function LetterSlot({
  value,
  index,
  isActive,
  isCorrect,
  isError,
  isGiven,
  isHint,
  errorPositions,
}: LetterSlotProps) {
  // Determine if this specific position has an error
  const hasErrorAtPosition = errorPositions ? errorPositions[index] : isError;

  return (
    <div
      className={cn(
        'flex h-12 w-10 items-center justify-center rounded-lg border-2 text-xl font-bold transition-all duration-200',
        // 首字母（预填）- 保留向后兼容
        isGiven && 'border-[var(--rhythm-primary)]/50 bg-[var(--rhythm-primary)]/15 text-[var(--rhythm-primary-light)] shadow-inner',
        // 智能提示字母 - 青色风格
        isHint && !isGiven && 'border-[var(--rhythm-secondary-cyan)]/50 bg-[var(--rhythm-secondary-cyan)]/15 text-[var(--rhythm-secondary-cyan)] shadow-inner',
        // 默认状态
        !isGiven && !isHint && 'border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-card)] text-[var(--rhythm-neutral-200)]',
        // 当前聚焦
        isActive && 'border-[var(--rhythm-primary-light)] bg-[var(--rhythm-primary)]/10 shadow-[var(--rhythm-glow-primary)] scale-110',
        // 整体正确
        isCorrect && 'border-[var(--rhythm-success)] bg-[var(--rhythm-success)]/20 text-[var(--rhythm-success)]',
        // 单个位置错误
        hasErrorAtPosition && 'animate-shake border-[var(--rhythm-error)] bg-[var(--rhythm-error)]/20 text-[var(--rhythm-error)]'
      )}
    >
      {value || (
        <span className="text-[var(--rhythm-neutral-600)]">
          {isActive ? '|' : '_'}
        </span>
      )}
    </div>
  );
}
