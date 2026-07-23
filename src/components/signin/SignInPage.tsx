'use client';

// 每日签到页面 — 翻牌交互 + 英文励志语 + Day7 金色粒子
// M5: 积分系统

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import AppLayout from '@/components/layout/AppLayout';

interface WeekDay {
  date: string;
  signed: boolean;
  points: number;
  isToday: boolean;
  isGolden: boolean;
}

interface Quote {
  en: string;
  zh: string;
  author: string;
}

interface SignInData {
  todaySigned: boolean;
  todayPoints: number;
  streak: number;
  weekStatus: WeekDay[];
  quote: Quote;
}

const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

export default function SignInPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<SignInData | null>(null);
  const [loading, setLoading] = useState(true);
  const [flipping, setFlipping] = useState(false);
  const [flipResult, setFlipResult] = useState<{
    points: number;
    streak: number;
    rarity: string;
    isDay7: boolean;
    quote: Quote;
  } | null>(null);
  const [showParticles, setShowParticles] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/signin');
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (err) {
      console.error('获取签到状态失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchStatus();
  }, [session, fetchStatus]);

  const handleSignIn = async () => {
    if (flipping || data?.todaySigned) return;

    setFlipping(true);
    try {
      const res = await fetch('/api/signin', { method: 'POST' });
      if (res.ok) {
        const result = await res.json();
        setFlipResult(result);
        if (result.isDay7) setShowParticles(true);

        // 刷新状态
        setTimeout(() => {
          fetchStatus();
          setFlipping(false);
        }, 800);
      } else {
        const err = await res.json();
        console.error(err.error);
        setFlipping(false);
        fetchStatus();
      }
    } catch (err) {
      console.error('签到失败:', err);
      setFlipping(false);
    }
  };

  const dismissResult = () => {
    setFlipResult(null);
    setShowParticles(false);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-2xl px-4 pt-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-[var(--rhythm-bg-card)]" />
            <div className="h-64 rounded-2xl bg-[var(--rhythm-bg-card)]" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-2xl px-4 pt-8 text-center">
          <p className="text-[var(--rhythm-neutral-400)]">请先登录</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl px-4 pt-8 pb-24">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[var(--rhythm-neutral-50)]">📅 每日签到</h2>
            <p className="mt-1 text-sm text-[var(--rhythm-neutral-400)]">
              连续签到 <span className="text-[var(--rhythm-primary-light)] font-bold">{data.streak}</span> 天
            </p>
          </div>
          {data.todaySigned && (
            <span className="rounded-full bg-[var(--rhythm-secondary)]/15 px-4 py-2 text-sm font-semibold text-[var(--rhythm-secondary)]">
              ✅ 已签到
            </span>
          )}
        </div>

        {/* 翻牌区域 — 7天网格 */}
        <div className="relative">
          {/* Day7 金色粒子背景 */}
          {showParticles && (
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-2xl">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-float-up"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 1.5}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                  }}
                >
                  <span className="text-2xl">✨</span>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-7 gap-3">
            {data.weekStatus.map((day, i) => (
              <div key={day.date} className="flex flex-col items-center gap-2">
                {/* 日期标签 */}
                <span className={`text-xs font-medium ${
                  day.isToday
                    ? 'text-[var(--rhythm-primary-light)]'
                    : 'text-[var(--rhythm-neutral-500)]'
                }`}>
                  {DAY_LABELS[i]}
                </span>

                {/* 签到卡片 */}
                <div
                  className={`
                    relative w-full aspect-square rounded-xl flex flex-col items-center justify-center
                    transition-all duration-300 cursor-pointer select-none
                    ${day.isGolden
                      ? 'bg-gradient-to-br from-amber-400 to-yellow-600 shadow-lg shadow-amber-500/25 border-2 border-amber-300'
                      : day.signed
                        ? 'bg-[var(--rhythm-primary)]/20 border border-[var(--rhythm-primary)]/30'
                        : day.isToday && !data.todaySigned
                          ? 'bg-[var(--rhythm-bg-card)] border-2 border-[var(--rhythm-primary)]/50 hover:border-[var(--rhythm-primary)] hover:scale-105 active:scale-95'
                          : 'bg-[var(--rhythm-bg-card)] border border-[var(--rhythm-bg-border)] opacity-50'
                    }
                    ${flipping && day.isToday ? 'animate-card-flip' : ''}
                  `}
                  onClick={() => day.isToday && !data.todaySigned && handleSignIn()}
                >
                  {day.signed ? (
                    <>
                      <span className="text-xl">{day.isGolden ? '👑' : '⭐'}</span>
                      <span className={`text-xs font-bold mt-1 ${
                        day.isGolden ? 'text-white' : 'text-[var(--rhythm-primary-light)]'
                      }`}>
                        +{day.points}
                      </span>
                    </>
                  ) : day.isToday ? (
                    <>
                      <span className="text-2xl opacity-60">🎁</span>
                      <span className="text-xs text-[var(--rhythm-neutral-400)] mt-1">签到</span>
                    </>
                  ) : (
                    <span className="text-lg text-[var(--rhythm-neutral-600)]">
                      {i + 1}
                    </span>
                  )}
                </div>

                {/* 日期数字 */}
                <span className={`text-[10px] ${
                  day.isToday ? 'text-[var(--rhythm-primary-light)] font-bold' : 'text-[var(--rhythm-neutral-600)]'
                }`}>
                  {day.date.split('-')[2]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 翻牌结果弹窗 */}
        {flipResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
               onClick={dismissResult}>
            <div
              className={`
                relative w-full max-w-sm rounded-2xl p-8 text-center
                animate-fade-out-wobble
                ${flipResult.isDay7
                  ? 'bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border-2 border-amber-400 shadow-2xl shadow-amber-500/30'
                  : flipResult.rarity === 'legendary'
                    ? 'bg-[var(--rhythm-bg-card)] border-2 border-[var(--rhythm-secondary)] shadow-2xl shadow-[var(--rhythm-secondary)]/20'
                    : flipResult.rarity === 'rare'
                      ? 'bg-[var(--rhythm-bg-card)] border border-[var(--rhythm-primary)]/40 shadow-xl'
                      : 'bg-[var(--rhythm-bg-card)] border border-[var(--rhythm-bg-border)] shadow-xl'
                }
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Day7 金色粒子 */}
              {flipResult.isDay7 && (
                <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute animate-float-up"
                      style={{
                        left: `${10 + Math.random() * 80}%`,
                        top: `${20 + Math.random() * 60}%`,
                        animationDelay: `${Math.random() * 1}s`,
                        animationDuration: `${1.5 + Math.random() * 2}s`,
                      }}
                    >
                      <span className="text-xl">✨</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 图标 */}
              <div className="text-6xl mb-4">
                {flipResult.isDay7 ? '👑' : flipResult.rarity === 'legendary' ? '💎' : flipResult.rarity === 'rare' ? '🌟' : '🎁'}
              </div>

              {/* 积分 */}
              <div className={`text-4xl font-black font-[Orbitron] mb-2 ${
                flipResult.isDay7
                  ? 'text-amber-300'
                  : flipResult.rarity === 'legendary'
                    ? 'text-[var(--rhythm-secondary)]'
                    : 'text-[var(--rhythm-primary-light)]'
              }`}>
                +{flipResult.points}
              </div>

              <p className="text-sm text-[var(--rhythm-neutral-400)] mb-4">
                {flipResult.isDay7
                  ? '🎉 7天连续签到！积分翻倍！'
                  : flipResult.rarity === 'legendary'
                    ? '传说级签到！'
                    : flipResult.rarity === 'rare'
                      ? '稀有签到！'
                      : '签到成功！'}
              </p>

              {/* 励志语 */}
              <div className="mt-6 pt-6 border-t border-[var(--rhythm-bg-border)]">
                <p className="text-sm italic text-[var(--rhythm-neutral-200)] leading-relaxed">
                  &ldquo;{flipResult.quote.en}&rdquo;
                </p>
                <p className="text-xs text-[var(--rhythm-neutral-500)] mt-1">
                  — {flipResult.quote.author}
                </p>
              </div>

              {/* 关闭按钮 */}
              <button
                className="mt-6 px-6 py-2 rounded-full bg-[var(--rhythm-primary)]/20 text-[var(--rhythm-primary-light)] text-sm font-semibold hover:bg-[var(--rhythm-primary)]/30 transition-colors"
                onClick={dismissResult}
              >
                好的
              </button>
            </div>
          </div>
        )}

        {/* 签到说明 */}
        <div className="mt-8 p-4 rounded-xl bg-[var(--rhythm-bg-card)] border border-[var(--rhythm-bg-border)]">
          <h3 className="text-sm font-semibold text-[var(--rhythm-neutral-200)] mb-2">📋 签到规则</h3>
          <ul className="space-y-1 text-xs text-[var(--rhythm-neutral-400)]">
            <li>• 每日签到随机获得 5-20 积分</li>
            <li>• 连续签到 7 天，积分翻倍 + 金色奖励</li>
            <li>• 签到后可获得一句英文励志语</li>
            <li>• 中断签到不影响已获得积分</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
