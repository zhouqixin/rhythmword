'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CeremonyProps {
  totalQuestions: number;
  correctCount: number;
  maxCombo: number;
  totalScore: number;
  mvpWord: string | null;
  yesterdayComparison: string | null;
}

type Rank = 'S' | 'A' | 'B' | 'C';

function calculateRank(correctCount: number, totalQuestions: number, maxCombo: number): Rank {
  const accuracy = correctCount / totalQuestions;
  if (accuracy >= 0.95 && maxCombo >= 15) return 'S';
  if (accuracy >= 0.80 && maxCombo >= 10) return 'A';
  if (accuracy >= 0.60) return 'B';
  return 'C';
}

const RANK_CONFIG: Record<Rank, { label: string; color: string; bg: string; emoji: string; message: string }> = {
  S: { label: 'S', color: 'text-amber-300', bg: 'from-amber-500/30 to-yellow-600/10', emoji: '👑', message: 'Perfect! You are the vocabulary king today!' },
  A: { label: 'A', color: 'text-[var(--rhythm-primary-light)]', bg: 'from-[var(--rhythm-primary)]/30 to-[var(--rhythm-primary)]/5', emoji: '🌟', message: 'Excellent! Keep up this momentum!' },
  B: { label: 'B', color: 'text-[var(--rhythm-secondary)]', bg: 'from-[var(--rhythm-secondary)]/20 to-[var(--rhythm-secondary)]/5', emoji: '💪', message: 'Good performance! Room to improve!' },
  C: { label: 'C', color: 'text-[var(--rhythm-neutral-400)]', bg: 'from-[var(--rhythm-bg-card)] to-[var(--rhythm-bg-card)]/50', emoji: '📚', message: 'Keep going! Every practice makes progress!' },
};

export default function Ceremony({ totalQuestions, correctCount, maxCombo, totalScore, mvpWord, yesterdayComparison }: CeremonyProps) {
  const router = useRouter();
  const rank = calculateRank(correctCount, totalQuestions, maxCombo);
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const config = RANK_CONFIG[rank];
  const [phase, setPhase] = useState<"intro" | "rank" | "details">("intro");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("rank"), 800);
    const t2 = setTimeout(() => setPhase("details"), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--rhythm-bg-deep)]">
      <div className="w-full max-w-sm mx-4 text-center">
        {phase === "intro" && (
          <div className="animate-fade-out-wobble">
            <div className="text-6xl mb-4">🎵</div>
            <h2 className="text-2xl font-bold text-[var(--rhythm-neutral-50)] mb-2">Training Complete!</h2>
            <p className="text-sm text-[var(--rhythm-neutral-400)]">Generating your report card...</p>
          </div>
        )}
        {phase === "rank" && (
          <div className="animate-fade-out-wobble">
            <div className={"w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br " + config.bg + " border-2 border-white/10 flex items-center justify-center shadow-2xl " + (rank === "S" ? "shadow-amber-500/20 animate-breathe" : "")}>
              <span className={"text-6xl font-black font-[Orbitron] " + config.color}>{config.label}</span>
            </div>
            <p className="text-xl font-bold text-[var(--rhythm-neutral-50)] mb-2">{config.emoji} {config.message}</p>
          </div>
        )}
        {phase === "details" && (
          <div className="space-y-6 animate-fade-out-wobble">
            <div className={"w-24 h-24 mx-auto rounded-full bg-gradient-to-br " + config.bg + " border-2 border-white/10 flex items-center justify-center " + (rank === "S" ? "shadow-lg shadow-amber-500/20" : "")}>
              <span className={"text-4xl font-black font-[Orbitron] " + config.color}>{config.label}</span>
            </div>
            <p className="text-lg font-bold text-[var(--rhythm-neutral-50)]">{config.emoji} {config.message}</p>
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[var(--rhythm-bg-card)] border border-[var(--rhythm-bg-border)]">
              <div className="text-center p-2"><p className="text-2xl font-black font-[Orbitron] text-[var(--rhythm-primary-light)]">{accuracy}%</p><p className="text-xs text-[var(--rhythm-neutral-500)] mt-1">Accuracy</p></div>
              <div className="text-center p-2"><p className="text-2xl font-black font-[Orbitron] text-[var(--rhythm-secondary)]">{correctCount}/{totalQuestions}</p><p className="text-xs text-[var(--rhythm-neutral-500)] mt-1">Correct/Total</p></div>
              <div className="text-center p-2"><p className="text-2xl font-black font-[Orbitron] text-[var(--rhythm-warning)]">{maxCombo}x</p><p className="text-xs text-[var(--rhythm-neutral-500)] mt-1">Max Combo</p></div>
              <div className="text-center p-2"><p className="text-2xl font-black font-[Orbitron] text-[var(--rhythm-primary-light)]">+{totalScore}</p><p className="text-xs text-[var(--rhythm-neutral-500)] mt-1">Score Earned</p></div>
            </div>
            {mvpWord && (<div className="p-4 rounded-2xl bg-[var(--rhythm-bg-card)] border border-[var(--rhythm-primary)]/20"><p className="text-xs text-[var(--rhythm-neutral-500)] mb-1">MVP Word</p><p className="text-xl font-bold font-[Orbitron] text-[var(--rhythm-primary-light)]">{mvpWord}</p></div>)}
            {yesterdayComparison && (<div className="text-sm text-[var(--rhythm-neutral-400)]">{yesterdayComparison}</div>)}
            <div className="flex gap-3 pt-2">
              <button onClick={() => router.push("/wrongbook")} className="flex-1 px-4 py-3 rounded-xl border border-[var(--rhythm-bg-border)] text-sm font-semibold text-[var(--rhythm-neutral-400)] hover:text-[var(--rhythm-neutral-200)] transition-colors">Wrong Book</button>
              <button onClick={() => router.push("/")} className="flex-1 px-4 py-3 rounded-xl bg-[var(--rhythm-primary)] text-white text-sm font-bold hover:bg-[var(--rhythm-primary)]/90 transition-colors">Back Home</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
