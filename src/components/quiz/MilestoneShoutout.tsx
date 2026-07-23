'use client';

// Combo 里程碑喊话组件
// 在答题页顶部弹出鼓励文案，非阻塞式，2s 自动消失

import { useEffect, useState } from 'react';
import { COMBO_MILESTONES } from '@/types';

interface MilestoneShoutoutProps {
  combo: number;
  lastMilestone: number;
  onMilestoneReached: (milestone: number) => void;
}

export default function MilestoneShoutout({
  combo,
  lastMilestone,
  onMilestoneReached,
}: MilestoneShoutoutProps) {
  const [current, setCurrent] = useState<{ milestone: number; message: string } | null>(null);

  useEffect(() => {
    // 检查是否触发新的里程碑
    const milestones = Object.keys(COMBO_MILESTONES)
      .map(Number)
      .sort((a, b) => a - b);

    for (const m of milestones) {
      if (combo >= m && m > lastMilestone) {
        setCurrent({ milestone: m, message: COMBO_MILESTONES[m] });
        onMilestoneReached(m);

        // 2s 后自动消失
        const timer = setTimeout(() => setCurrent(null), 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [combo, lastMilestone, onMilestoneReached]);

  if (!current) return null;

  return (
    <div className="pointer-events-none fixed top-20 left-0 right-0 z-40 flex justify-center">
      <div className="animate-float-up rounded-2xl bg-gradient-to-r from-[var(--rhythm-secondary-amber)]/20 to-[var(--rhythm-secondary-pink)]/20 px-6 py-3 backdrop-blur-sm">
        <span className="font-display text-lg font-bold text-[var(--rhythm-secondary-amber)] drop-shadow-[0_0_8px_var(--rhythm-secondary-amber)]">
          {current.message}
        </span>
      </div>
    </div>
  );
}
