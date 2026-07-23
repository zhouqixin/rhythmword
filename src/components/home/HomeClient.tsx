'use client';

// 首页客户端组件
// 负责 UI 渲染和交互

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import AppLayout from '@/components/layout/AppLayout';
import { LEVEL_NAMES } from '@/types';

interface HomeClientProps {
  userName: string;
  points: number;
  level: number;
  todaySigned: boolean;
  weekStatus: boolean[];
  streak: number;
  lastSession: {
    questions: number;
    correct: number;
    maxCombo: number;
  } | null;
}

// 每日签到用励志语
const MOTIVATIONAL_QUOTES = [
  'Practice makes perfect!',
  'Every word is a step forward.',
  'Small steps, big results.',
  'You are building your future, one word at a time.',
  'The expert in anything was once a beginner.',
  'Believe you can and you\'re halfway there.',
  'Your only limit is your mind.',
  'Don\'t stop until you\'re proud.',
  'Learning is a treasure that follows its owner.',
  'Today a reader, tomorrow a leader.',
];

export default function HomeClient({
  userName,
  points,
  level,
  todaySigned,
  weekStatus,
  streak,
  lastSession,
}: HomeClientProps) {
  const router = useRouter();
  const [signed, setSigned] = useState(todaySigned);
  const [signing, setSigning] = useState(false);
  const levelName = LEVEL_NAMES[level] || '探索者';

  const handleSignIn = async () => {
    if (signed || signing) return;
    setSigning(true);

    try {
      const res = await fetch('/api/signin', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || '签到失败');
        setSigning(false);
        return;
      }

      setSigned(true);
      const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
      toast.success(`签到成功！+${data.points} 积分 · ${quote}`, {
        duration: 4000,
      });
    } catch {
      toast.error('网络错误');
    } finally {
      setSigning(false);
    }
  };

  const dayNames = ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl px-4 pt-8">
        {/* 顶部问候 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--rhythm-neutral-50)]">
              👋 你好，{userName}！
            </h2>
            <p className="mt-1 text-sm text-[var(--rhythm-neutral-400)]">
              {levelName} Lv.{level} · 准备好今天的训练了吗？
            </p>
          </div>
          <div className="rounded-full bg-[var(--rhythm-primary)]/15 px-4 py-2">
            <span className="text-sm font-semibold text-[var(--rhythm-primary-light)]">
              ⭐ {points.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 签到卡片 */}
        <div className="mb-6 rounded-2xl border border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-card)] p-6 shadow-[var(--rhythm-glow-card)]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--rhythm-neutral-200)]">
              📅 每日签到
            </h3>
            {streak > 1 && (
              <span className="rounded-full bg-[var(--rhythm-secondary-amber)]/15 px-3 py-1 text-xs font-semibold text-[var(--rhythm-secondary-amber)]">
                已连续 {streak} 天
              </span>
            )}
          </div>

          {/* 7 天签到网格 */}
          <div className="mb-3 flex justify-between gap-2">
            {weekStatus.map((done, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-xs font-medium transition-all ${
                    done
                      ? 'bg-[var(--rhythm-success)]/20 text-[var(--rhythm-success)] border border-[var(--rhythm-success)]/30'
                      : i === new Date().getDay() && !signed
                        ? 'animate-breathe border border-[var(--rhythm-primary-light)] bg-[var(--rhythm-bg-elevated)] text-[var(--rhythm-primary-light)]'
                        : 'border border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-elevated)] text-[var(--rhythm-neutral-600)]'
                  }`}
                >
                  {done ? '✓' : i + 1}
                </div>
                <span className="text-[10px] text-[var(--rhythm-neutral-400)]">
                  {dayNames[i]}
                </span>
              </div>
            ))}
          </div>

          {!signed ? (
            <button
              onClick={handleSignIn}
              disabled={signing}
              className="w-full rounded-xl bg-[var(--rhythm-primary)]/20 py-2.5 text-sm font-medium text-[var(--rhythm-primary-light)] transition-all hover:bg-[var(--rhythm-primary)]/30 active:scale-[0.97] disabled:opacity-50"
            >
              {signing ? '签到中...' : '点击签到 · 随机 5-20 积分'}
            </button>
          ) : (
            <div className="rounded-xl bg-[var(--rhythm-success)]/10 py-2.5 text-center text-sm font-medium text-[var(--rhythm-success)]">
              ✅ 今日已签到
            </div>
          )}
        </div>

        {/* 上次训练回顾 */}
        {lastSession && (
          <div className="mb-6 rounded-2xl border border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-card)] p-5">
            <h3 className="mb-3 text-sm font-semibold text-[var(--rhythm-neutral-400)]">
              📊 上次训练
            </h3>
            <div className="flex justify-around text-center">
              <div>
                <div className="font-display text-lg font-bold text-[var(--rhythm-neutral-50)]">
                  {lastSession.questions}
                </div>
                <div className="text-xs text-[var(--rhythm-neutral-400)]">答题数</div>
              </div>
              <div>
                <div className="font-display text-lg font-bold text-[var(--rhythm-success)]">
                  {lastSession.correct}
                </div>
                <div className="text-xs text-[var(--rhythm-neutral-400)]">正确</div>
              </div>
              <div>
                <div className="font-display text-lg font-bold text-[var(--rhythm-secondary-amber)]">
                  {lastSession.maxCombo}x
                </div>
                <div className="text-xs text-[var(--rhythm-neutral-400)]">最高 Combo</div>
              </div>
            </div>
          </div>
        )}

        {/* 开始训练 CTA */}
        <div className="rounded-2xl border border-[var(--rhythm-primary)]/30 bg-gradient-to-br from-[var(--rhythm-primary)]/20 to-[var(--rhythm-bg-card)] p-8 text-center shadow-[var(--rhythm-glow-primary)]">
          <h3 className="mb-2 font-display text-xl font-bold text-[var(--rhythm-neutral-50)]">
            🎵 开始训练
          </h3>
          <p className="mb-6 text-sm text-[var(--rhythm-neutral-400)]">
            完成 20 题训练，解锁每日收官仪式
          </p>
          <button
            onClick={() => router.push('/quiz')}
            className="animate-breathe rounded-xl bg-[var(--rhythm-primary)] px-10 py-3.5 font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97]"
          >
            开始答题
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
