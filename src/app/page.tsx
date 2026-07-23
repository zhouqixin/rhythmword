// 首页 — Phase 1 完整首页
// 问候语 + 签到卡片 + 上次训练 + 开始训练 CTA

import AppLayout from '@/components/layout/AppLayout';

export default function HomePage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl px-4 pt-8">
        {/* 顶部问候 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--rhythm-neutral-50)]">
              👋 你好！
            </h2>
            <p className="mt-1 text-sm text-[var(--rhythm-neutral-400)]">
              准备好今天的训练了吗？
            </p>
          </div>
          <div className="rounded-full bg-[var(--rhythm-primary)]/15 px-4 py-2 text-sm font-semibold text-[var(--rhythm-primary-light)]">
            ⭐ 0 积分
          </div>
        </div>

        {/* 签到卡片 */}
        <div className="mb-6 rounded-2xl border border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-card)] p-6 shadow-[var(--rhythm-glow-card)]">
          <h3 className="mb-4 text-lg font-semibold text-[var(--rhythm-neutral-200)]">
            📅 每日签到
          </h3>
          <div className="flex justify-between gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-elevated)] text-xs text-[var(--rhythm-neutral-600)]"
              >
                {i + 1}
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-sm text-[var(--rhythm-neutral-400)]">
            今日奖励: 随机 5-20 积分
          </p>
        </div>

        {/* 开始训练 CTA */}
        <div className="rounded-2xl border border-[var(--rhythm-primary)]/30 bg-gradient-to-br from-[var(--rhythm-primary)]/20 to-[var(--rhythm-bg-card)] p-8 text-center shadow-[var(--rhythm-glow-primary)]">
          <h3 className="mb-2 font-display text-xl font-bold text-[var(--rhythm-neutral-50)]">
            🎵 开始训练
          </h3>
          <p className="mb-6 text-sm text-[var(--rhythm-neutral-400)]">
            今日已完成 0/20 题
          </p>
          <button className="animate-breathe rounded-xl bg-[var(--rhythm-primary)] px-8 py-3 font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97]">
            开始答题
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
