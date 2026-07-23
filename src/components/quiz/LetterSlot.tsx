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
}

export default function LetterSlot({
  value,
  index,
  isActive,
  isCorrect,
  isError,
}: LetterSlotProps) {
  return (
    <div
      className={cn(
        'flex h-12 w-10 items-center justify-center rounded-lg border-2 text-xl font-bold transition-all duration-200',
        // 默认状态
        'border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-card)] text-[var(--rhythm-neutral-200)]',
        // 当前聚焦
        isActive && 'border-[var(--rhythm-primary-light)] bg-[var(--rhythm-primary)]/10 shadow-[var(--rhythm-glow-primary)] scale-110',
        // 正确
        isCorrect && 'border-[var(--rhythm-success)] bg-[var(--rhythm-success)]/20 text-[var(--rhythm-success)]',
        // 错误
        isError && 'animate-shake border-[var(--rhythm-error)] bg-[var(--rhythm-error)]/20 text-[var(--rhythm-error)]'
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
