'use client';

// 个人面板 — 本周统计 + 积分收支 + 等级进度 + 徽章墙
// M5: 积分系统

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';

interface LevelInfo {
  level: number;
  title: string;
  currentPoints: number;
  nextLevelPoints: number;
  progress: number;
  isMax: boolean;
}

interface ScoreEvent {
  id: string;
  type: string;
  amount: number;
  balance: number;
  description: string;
  createdAt: string;
}

interface Badge {
  badgeKey: string;
  badgeName: string;
  earnedAt: string;
}

interface ProfileData {
  totalPoints: number;
  levelInfo: LevelInfo;
  weekStats: {
    questionsAnswered: number;
    correctAnswers: number;
    scoreEarned: number;
  };
  recentEvents: ScoreEvent[];
  badges: Badge[];
  firstBgmPurchase: boolean;
  firstSkinPurchase: boolean;
  todayAnswerCount: number;
}

// 积分事件图标映射
const EVENT_ICONS: Record<string, string> = {
  answer: '✅',
  combo: '🔥',
  quick: '⚡',
  perfect: '💯',
  set: '🏆',
  daily: '🌅',
  signin: '📅',
  levelup: '⬆️',
  purchase: '🛒',
  review: '📝',
};

// 徽章图标映射
const BADGE_ICONS: Record<string, string> = {
  hundred_quiz: '💯',
  thousand_quiz: '🏅',
  perfect_ten: '🎯',
  combo_star: '⭐',
  week_streak: '🔥',
  early_bird: '🌅',
  shopaholic: '🛍️',
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/score');
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (err) {
      console.error('获取个人面板失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchProfile();
  }, [session, fetchProfile]);

  if (loading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-2xl px-4 pt-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-32 rounded bg-[var(--rhythm-bg-card)]" />
            <div className="h-40 rounded-2xl bg-[var(--rhythm-bg-card)]" />
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

  const { levelInfo, weekStats, recentEvents, badges } = data;

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl px-4 pt-8 pb-24">
        <h2 className="text-2xl font-bold text-[var(--rhythm-neutral-50)] mb-6">👤 个人面板</h2>

        {/* ---- 等级卡片 ---- */}
        <div className="relative mb-6 p-6 rounded-2xl bg-gradient-to-br from-[var(--rhythm-primary)]/10 to-[var(--rhythm-primary)]/5 border border-[var(--rhythm-primary)]/20 overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute top-0 right-0 text-8xl opacity-5 select-none">
            {levelInfo.isMax ? '👑' : '⭐'}
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-[var(--rhythm-neutral-400)] mb-1">当前等级</p>
                <h3 className="text-3xl font-black font-[Orbitron] text-[var(--rhythm-primary-light)]">
                  Lv.{levelInfo.level}
                </h3>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-[var(--rhythm-neutral-100)]">
                  {levelInfo.title}
                </p>
                <p className="text-sm text-[var(--rhythm-neutral-400)]">
                  ⭐ {levelInfo.currentPoints.toLocaleString()}
                </p>
              </div>
            </div>

            {/* 进度条 */}
            {!levelInfo.isMax && (
              <div>
                <div className="flex justify-between text-xs text-[var(--rhythm-neutral-500)] mb-1.5">
                  <span>升级进度</span>
                  <span>{levelInfo.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--rhythm-bg-card)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--rhythm-primary)] to-[var(--rhythm-secondary)] transition-all duration-700 ease-out"
                    style={{ width: `${levelInfo.progress}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--rhythm-neutral-600)] mt-1.5">
                  距离下一级还需 ⭐{(levelInfo.nextLevelPoints - levelInfo.currentPoints).toLocaleString()}
                </p>
              </div>
            )}

            {levelInfo.isMax && (
              <p className="text-sm text-[var(--rhythm-warning)] font-bold">
                🎉 已达最高等级！
              </p>
            )}
          </div>
        </div>

        {/* ---- 本周统计 ---- */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[var(--rhythm-neutral-300)] mb-3">📊 本周统计</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-[var(--rhythm-bg-card)] border border-[var(--rhythm-bg-border)] text-center">
              <p className="text-2xl font-black font-[Orbitron] text-[var(--rhythm-primary-light)]">
                {weekStats.questionsAnswered}
              </p>
              <p className="text-xs text-[var(--rhythm-neutral-500)] mt-1">答题数</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--rhythm-bg-card)] border border-[var(--rhythm-bg-border)] text-center">
              <p className="text-2xl font-black font-[Orbitron] text-[var(--rhythm-secondary)]">
                {weekStats.correctAnswers}
              </p>
              <p className="text-xs text-[var(--rhythm-neutral-500)] mt-1">正确数</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--rhythm-bg-card)] border border-[var(--rhythm-bg-border)] text-center">
              <p className="text-2xl font-black font-[Orbitron] text-[var(--rhythm-warning)]">
                {weekStats.scoreEarned}
              </p>
              <p className="text-xs text-[var(--rhythm-neutral-500)] mt-1">获得积分</p>
            </div>
          </div>
        </div>

        {/* ---- 快捷入口 ---- */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[var(--rhythm-neutral-300)] mb-3">⚡ 快捷入口</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/signin"
              className="p-4 rounded-xl bg-[var(--rhythm-bg-card)] border border-[var(--rhythm-bg-border)] hover:border-[var(--rhythm-primary)]/30 transition-colors text-center"
            >
              <p className="text-2xl mb-1">📅</p>
              <p className="text-sm font-semibold text-[var(--rhythm-neutral-200)]">每日签到</p>
              <p className="text-xs text-[var(--rhythm-neutral-500)] mt-0.5">赚取积分</p>
            </Link>
            <Link
              href="/shop"
              className="p-4 rounded-xl bg-[var(--rhythm-bg-card)] border border-[var(--rhythm-bg-border)] hover:border-[var(--rhythm-primary)]/30 transition-colors text-center"
            >
              <p className="text-2xl mb-1">🛒</p>
              <p className="text-sm font-semibold text-[var(--rhythm-neutral-200)]">积分商城</p>
              <p className="text-xs text-[var(--rhythm-neutral-500)] mt-0.5">购买道具/BGM</p>
            </Link>
          </div>
        </div>

        {/* ---- 徽章墙 ---- */}
        {badges.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--rhythm-neutral-300)] mb-3">🏅 徽章墙</h3>
            <div className="flex flex-wrap gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.badgeKey}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--rhythm-bg-card)] border border-[var(--rhythm-bg-border)]"
                  title={`获得于 ${new Date(badge.earnedAt).toLocaleDateString('zh-CN')}`}
                >
                  <span className="text-lg">{BADGE_ICONS[badge.badgeKey] || '🏅'}</span>
                  <span className="text-xs font-medium text-[var(--rhythm-neutral-300)]">
                    {badge.badgeName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---- 积分收支 ---- */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--rhythm-neutral-300)] mb-3">💰 积分收支</h3>
          <div className="space-y-2">
            {recentEvents.length === 0 ? (
              <p className="text-sm text-[var(--rhythm-neutral-500)] text-center py-8">
                暂无积分记录，快去答题吧！
              </p>
            ) : (
              recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--rhythm-bg-card)] border border-[var(--rhythm-bg-border)]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg flex-shrink-0">
                      {EVENT_ICONS[event.type] || '📌'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-[var(--rhythm-neutral-200)] truncate">
                        {event.description}
                      </p>
                      <p className="text-xs text-[var(--rhythm-neutral-600)]">
                        {new Date(event.createdAt).toLocaleString('zh-CN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold font-[Orbitron] flex-shrink-0 ml-3 ${
                    event.amount > 0
                      ? 'text-[var(--rhythm-secondary)]'
                      : 'text-[var(--rhythm-neutral-500)]'
                  }`}>
                    {event.amount > 0 ? '+' : ''}{event.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
