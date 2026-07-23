'use client';

// 虽败犹荣安慰卡片
// Combo>=30 且无护盾归零时弹出

import { useEffect, useState } from 'react';

interface ConsolationCardProps {
  brokenCombo: number;
  onDismiss: () => void;
}

const CONSOLATION_MESSAGES = [
  "Even the best players stumble — that's how they get better.",
  'A high combo means you have real skill. This is just a bump.',
  'The phoenix rises from the ashes. So will your combo.',
  '30+ combo is no accident. You will reach it again.',
  'Every master has failed more times than the beginner has tried.',
];

export default function ConsolationCard({ brokenCombo, onDismiss }: ConsolationCardProps) {
  const [visible, setVisible] = useState(false);
  const message = CONSOLATION_MESSAGES[Math.floor(Math.random() * CONSOLATION_MESSAGES.length)];

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="mx-4 w-full max-w-sm rounded-3xl border border-[var(--rhythm-secondary-amber)]/30 bg-[var(--rhythm-bg-card)] p-8 text-center shadow-2xl animate-combo-grow">
        {/* 皇冠图标 */}
        <div className="mb-4 text-5xl">👑</div>

        {/* Combo 数值 */}
        <div className="mb-2 font-display text-4xl font-extrabold text-[var(--rhythm-secondary-amber)] drop-shadow-[0_0_12px_var(--rhythm-secondary-amber)]">
          {brokenCombo}x
        </div>
        <p className="mb-4 text-sm text-[var(--rhythm-neutral-400)]">
          Highest Combo
        </p>

        {/* 鼓励文案 */}
        <div className="mb-6 rounded-xl border border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-elevated)] p-4">
          <p className="text-sm leading-relaxed text-[var(--rhythm-neutral-200)] italic">
            "{message}"
          </p>
        </div>

        {/* 继续按钮 */}
        <button
          onClick={onDismiss}
          className="w-full rounded-xl bg-[var(--rhythm-primary)] px-6 py-3 font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97]"
        >
          Continue Challenge
        </button>
      </div>
    </div>
  );
}
