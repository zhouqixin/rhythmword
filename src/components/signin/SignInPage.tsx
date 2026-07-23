'use client';

// Daily sign-in page - card flip interaction + English motivational quote + Day7 golden particles
// M5: Points system

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

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function SignInPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [data, setData] = useState<SignInData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/signin');
      if (res.ok) {
        const d = await res.json();
        setData(d);
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to load sign-in status');
      }
    } catch (err) {
      console.error('Failed to fetch sign-in status:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionStatus === 'authenticated' && session) {
      fetchStatus();
    } else if (sessionStatus === 'unauthenticated') {
      setLoading(false);
      setError(null);
    }
  }, [session, sessionStatus, fetchStatus]);

  const handleSignIn = async () => {
    if (flipping || data?.todaySigned) return;

    setFlipping(true);
    try {
      const res = await fetch('/api/signin', { method: 'POST' });
      if (res.ok) {
        const result = await res.json();
        setFlipResult(result);
        if (result.isDay7) setShowParticles(true);

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
      console.error('Sign-in failed:', err);
      setFlipping(false);
    }
  };

  const dismissResult = () => {
    setFlipResult(null);
    setShowParticles(false);
  };

  // Not logged in
  if (sessionStatus === 'unauthenticated') {
    return (
      <AppLayout>
        <div className="mx-auto max-w-2xl px-4 pt-8 text-center">
          <p className="text-[var(--rhythm-neutral-400)]">Please log in first</p>
        </div>
      </AppLayout>
    );
  }

  // Loading
  if (loading || sessionStatus === 'loading') {
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

  // Error
  if (error) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-2xl px-4 pt-8 text-center">
          <p className="text-[var(--rhythm-neutral-400)]">{error}</p>
          <button
            onClick={fetchStatus}
            className="mt-4 px-4 py-2 rounded-xl bg-[var(--rhythm-primary)]/20 text-sm text-[var(--rhythm-primary-light)] hover:bg-[var(--rhythm-primary)]/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </AppLayout>
    );
  }

  // No data yet (shouldn't happen but safety check)
  if (!data) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-2xl px-4 pt-8 text-center">
          <p className="text-[var(--rhythm-neutral-400)]">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl px-4 pt-8 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[var(--rhythm-neutral-50)]">Daily Sign-in</h2>
            <p className="mt-1 text-sm text-[var(--rhythm-neutral-400)]">
              Streak: <span className="text-[var(--rhythm-primary-light)] font-bold">{data.streak}</span> days
            </p>
          </div>
          {data.todaySigned && (
            <span className="rounded-full bg-[var(--rhythm-secondary)]/15 px-4 py-2 text-sm font-semibold text-[var(--rhythm-secondary)]">
              Signed in today
            </span>
          )}
        </div>

        {/* 7-day grid */}
        <div className="relative">
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
                <span className={`text-xs font-medium ${
                  day.isToday
                    ? 'text-[var(--rhythm-primary-light)]'
                    : 'text-[var(--rhythm-neutral-500)]'
                }`}>
                  {DAY_LABELS[i]}
                </span>

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
                      <span className="text-xs text-[var(--rhythm-neutral-400)] mt-1">Sign in</span>
                    </>
                  ) : (
                    <span className="text-lg text-[var(--rhythm-neutral-600)]">
                      {i + 1}
                    </span>
                  )}
                </div>

                <span className={`text-[10px] ${
                  day.isToday ? 'text-[var(--rhythm-primary-light)] font-bold' : 'text-[var(--rhythm-neutral-600)]'
                }`}>
                  {day.date.split('-')[2]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Flip result modal */}
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

              <div className="text-6xl mb-4">
                {flipResult.isDay7 ? '👑' : flipResult.rarity === 'legendary' ? '💎' : flipResult.rarity === 'rare' ? '🌟' : '🎁'}
              </div>

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
                  ? '7-day streak! Points doubled!'
                  : flipResult.rarity === 'legendary'
                    ? 'Legendary sign-in!'
                    : flipResult.rarity === 'rare'
                      ? 'Rare sign-in!'
                      : 'Sign-in success!'}
              </p>

              <div className="mt-6 pt-6 border-t border-[var(--rhythm-bg-border)]">
                <p className="text-sm italic text-[var(--rhythm-neutral-200)] leading-relaxed">
                  &ldquo;{flipResult.quote.en}&rdquo;
                </p>
                <p className="text-xs text-[var(--rhythm-neutral-500)] mt-1">
                  — {flipResult.quote.author}
                </p>
              </div>

              <button
                className="mt-6 px-6 py-2 rounded-full bg-[var(--rhythm-primary)]/20 text-[var(--rhythm-primary-light)] text-sm font-semibold hover:bg-[var(--rhythm-primary)]/30 transition-colors"
                onClick={dismissResult}
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Rules */}
        <div className="mt-8 p-4 rounded-xl bg-[var(--rhythm-bg-card)] border border-[var(--rhythm-bg-border)]">
          <h3 className="text-sm font-semibold text-[var(--rhythm-neutral-200)] mb-2">Sign-in Rules</h3>
          <ul className="space-y-1 text-xs text-[var(--rhythm-neutral-400)]">
            <li>- Daily sign-in gives 5-20 random points</li>
            <li>- 7-day streak doubles points + golden reward</li>
            <li>- Get an English motivational quote each day</li>
            <li>- Broken streak does not affect earned points</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
