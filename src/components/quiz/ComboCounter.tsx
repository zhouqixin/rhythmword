'use client';

// Combo 计数器组件
// 显示当前 Combo 值，带火焰/爆炸特效

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ComboCounterProps {
  combo: number;
  comboState: 'active' | 'shielded' | 'buffering' | 'broken';
}

export default function ComboCounter({ combo, comboState }: ComboCounterProps) {
  const [animating, setAnimating] = useState(false);
  const prevCombo = useRef(combo);

  useEffect(() => {
    if (combo > prevCombo.current) {
      setAnimating(true);
      const timer = setTimeout(() => setAnimating(false), 400);
      prevCombo.current = combo;
      return () => clearTimeout(timer);
    }
    prevCombo.current = combo;
  }, [combo]);

  // Combo 等级视觉效果
  const getComboStyle = () => {
    if (comboState === 'broken') return 'text-[var(--rhythm-error)] opacity-50';
    if (comboState === 'buffering') return 'text-[var(--rhythm-warning)] animate-pulse';
    if (combo >= 50) return 'text-[var(--rhythm-secondary-pink)] drop-shadow-[0_0_12px_var(--rhythm-secondary-pink)]';
    if (combo >= 20) return 'text-[var(--rhythm-secondary-amber)] drop-shadow-[0_0_10px_var(--rhythm-secondary-amber)]';
    if (combo >= 10) return 'text-[var(--rhythm-success)] drop-shadow-[0_0_8px_var(--rhythm-success)]';
    return 'text-[var(--rhythm-neutral-50)]';
  };

  const getIcon = () => {
    if (comboState === 'shielded') return '🛡️';
    if (combo >= 50) return '👑';
    if (combo >= 20) return '💥';
    if (combo >= 10) return '🔥';
    return '';
  };

  if (combo === 0 && comboState !== 'broken') return null;

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 py-2 transition-all duration-300',
        animating && 'animate-combo-grow',
        comboState === 'broken' && 'animate-fade-out-wobble'
      )}
    >
      <span className="text-sm text-[var(--rhythm-neutral-400)]">Combo</span>
      <span
        className={cn(
          'font-display text-3xl font-extrabold tracking-wider transition-all',
          getComboStyle()
        )}
      >
        {combo}x
      </span>
      {getIcon() && <span className="text-2xl">{getIcon()}</span>}
    </div>
  );
}
