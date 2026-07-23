'use client';

// 首次引导页 — 2 步流程
// Step 1: 年级选择 → Step 2: 难度选择 → 完成引导

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import AuthLayout from '@/components/layout/AuthLayout';

// 年级选项（小学1年级 到 高中3年级）
const GRADES = [
  { value: 1, label: '一年级' },
  { value: 2, label: '二年级' },
  { value: 3, label: '三年级' },
  { value: 4, label: '四年级' },
  { value: 5, label: '五年级' },
  { value: 6, label: '六年级' },
  { value: 7, label: '七年级（初一）' },
  { value: 8, label: '八年级（初二）' },
  { value: 9, label: '九年级（初三）' },
  { value: 10, label: '高一' },
  { value: 11, label: '高二' },
  { value: 12, label: '高三' },
];

const DIFFICULTIES = [
  {
    value: 'easy' as const,
    label: '初级',
    icon: '🟢',
    desc: 'BPM 60 · 窗口 3s',
    detail: '适合刚开始学习英语的同学，节拍较慢，有充足的思考时间',
  },
  {
    value: 'medium' as const,
    label: '中级',
    icon: '🟡',
    desc: 'BPM 90 · 窗口 2s',
    detail: '适合有一定基础的同学，节拍适中，推荐选择',
  },
  {
    value: 'hard' as const,
    label: '高级',
    icon: '🔴',
    desc: 'BPM 120 · 窗口 1.5s',
    detail: '适合英语熟练的同学，节拍较快，需要快速反应',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [grade, setGrade] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    if (!grade) return;

    setLoading(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade,
          difficulty,
          isOnboarded: true,
        }),
      });

      if (!res.ok) {
        throw new Error('保存失败');
      }

      toast.success('欢迎来到 RhythmWord！🎵');
      router.push('/');
      router.refresh();
    } catch {
      toast.error('设置失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* 进度指示器 */}
      <div className="mb-8 flex items-center justify-center gap-2">
        <div
          className={`h-2 w-10 rounded-full transition-colors ${
            step >= 1 ? 'bg-[var(--rhythm-primary)]' : 'bg-[var(--rhythm-bg-border)]'
          }`}
        />
        <div
          className={`h-2 w-10 rounded-full transition-colors ${
            step >= 2 ? 'bg-[var(--rhythm-primary)]' : 'bg-[var(--rhythm-bg-border)]'
          }`}
        />
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-[var(--rhythm-neutral-50)]">
              选择你的年级
            </h2>
            <p className="mt-2 text-sm text-[var(--rhythm-neutral-400)]">
              我们会根据你的年级推荐合适难度的题目
            </p>
          </div>

          {/* 年级网格 */}
          <div className="grid grid-cols-3 gap-3">
            {GRADES.map((g) => (
              <button
                key={g.value}
                onClick={() => setGrade(g.value)}
                className={`rounded-xl border px-3 py-4 text-center text-sm font-medium transition-all ${
                  grade === g.value
                    ? 'border-[var(--rhythm-primary-light)] bg-[var(--rhythm-primary)]/20 text-[var(--rhythm-primary-light)] shadow-[var(--rhythm-glow-primary)]'
                    : 'border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-card)] text-[var(--rhythm-neutral-400)] hover:border-[var(--rhythm-neutral-600)] hover:text-[var(--rhythm-neutral-200)]'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!grade}
            className="w-full rounded-xl bg-[var(--rhythm-primary)] px-6 py-3 font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            下一步 →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-[var(--rhythm-neutral-50)]">
              选择难度
            </h2>
            <p className="mt-2 text-sm text-[var(--rhythm-neutral-400)]">
              别担心，随时可以在设置中调整
            </p>
          </div>

          {/* 难度卡片 */}
          <div className="space-y-3">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className={`w-full rounded-xl border p-4 text-left transition-all ${
                  difficulty === d.value
                    ? 'border-[var(--rhythm-primary-light)] bg-[var(--rhythm-primary)]/20 shadow-[var(--rhythm-glow-primary)]'
                    : 'border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-card)] hover:border-[var(--rhythm-neutral-600)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{d.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-[var(--rhythm-neutral-200)]">
                      {d.label}
                      <span className="ml-2 text-xs text-[var(--rhythm-neutral-400)]">
                        {d.desc}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--rhythm-neutral-400)]">
                      {d.detail}
                    </p>
                  </div>
                  {difficulty === d.value && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--rhythm-primary)]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 rounded-xl border border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-card)] px-6 py-3 font-medium text-[var(--rhythm-neutral-400)] transition-all hover:text-[var(--rhythm-neutral-200)]"
            >
              ← 上一步
            </button>
            <button
              onClick={handleFinish}
              disabled={loading}
              className="flex-1 rounded-xl bg-[var(--rhythm-primary)] px-6 py-3 font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? '设置中...' : '开始学习 🎵'}
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
