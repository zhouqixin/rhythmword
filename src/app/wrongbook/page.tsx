'use client';

// 错题本页面 — 错题列表 + 统计 + 「我记住了」
// M6: 错题本 + 每日收官仪式

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import AppLayout from '@/components/layout/AppLayout';

interface WrongEntry {
  id: string;
  questionId: string;
  sentenceEn: string;
  sentenceZh: string;
  targetWord: string;
  firstLetter: string;
  blankCount: number;
  grade: number;
  difficulty: string;
  funFacts: string[];
  correctCount: number;
  lastWrongAt: string;
  isConfirmed: boolean;
}

interface WrongBookStats {
  total: number;
  byDifficulty: Record<string, number>;
  byGrade: Record<number, number>;
}

interface WrongBookData {
  entries: WrongEntry[];
  stats: WrongBookStats;
}

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  easy: { label: '简单', color: 'text-[var(--rhythm-success)] bg-[var(--rhythm-success)]/10' },
  medium: { label: '中等', color: 'text-[var(--rhythm-warning)] bg-[var(--rhythm-warning)]/10' },
  hard: { label: '困难', color: 'text-[var(--rhythm-danger)] bg-[var(--rhythm-danger)]/10' },
};

export default function WrongBookPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<WrongBookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/wrongbook');
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (err) {
      console.error('获取错题本失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchData();
  }, [session, fetchData]);

  const handleRemember = async (entryId: string) => {
    try {
      const res = await fetch('/api/wrongbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wrongBookId: entryId }),
      });

      if (res.ok) {
        toast.success('已标记为记住！');
        fetchData();
      } else {
        toast.error('操作失败');
      }
    } catch {
      toast.error('网络错误');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('确定要清空所有错题吗？此操作不可撤销。')) return;

    try {
      const res = await fetch('/api/wrongbook', { method: 'DELETE' });
      if (res.ok) {
        toast.success('错题本已清空');
        fetchData();
      }
    } catch {
      toast.error('操作失败');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-2xl px-4 pt-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-32 rounded bg-[var(--rhythm-bg-card)]" />
            <div className="h-20 rounded-2xl bg-[var(--rhythm-bg-card)]" />
            <div className="h-32 rounded-2xl bg-[var(--rhythm-bg-card)]" />
          </div>
        </div>
      </AppLayout>
    );
  }

  const entries = data?.entries || [];
  const stats = data?.stats;

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl px-4 pt-8 pb-24">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[var(--rhythm-neutral-50)]">📖 错题本</h2>
          {entries.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-[var(--rhythm-neutral-500)] hover:text-[var(--rhythm-danger)] transition-colors"
            >
              清空全部
            </button>
          )}
        </div>

        {/* 统计卡片 */}
        {stats && stats.total > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-[var(--rhythm-bg-card)] border border-[var(--rhythm-bg-border)]">
            <div className="flex items-center justify-around text-center">
              <div>
                <p className="text-2xl font-black font-[Orbitron] text-[var(--rhythm-primary-light)]">
                  {stats.total}
                </p>
                <p className="text-xs text-[var(--rhythm-neutral-500)] mt-1">错题总数</p>
              </div>
              <div className="flex gap-3">
                {Object.entries(stats.byDifficulty).map(([key, count]) =>
                  count > 0 ? (
                    <div key={key} className={`px-3 py-1 rounded-full text-xs font-semibold ${DIFFICULTY_LABELS[key]?.color}`}>
                      {DIFFICULTY_LABELS[key]?.label} {count}
                    </div>
                  ) : null
                )}
              </div>
            </div>
          </div>
        )}

        {/* 错题列表 */}
        {entries.length === 0 ? (
          <div className="mt-16 text-center">
            <div className="text-6xl mb-4">📖</div>
            <p className="text-lg text-[var(--rhythm-neutral-200)]">错题本空空如也</p>
            <p className="mt-1 text-sm text-[var(--rhythm-neutral-400)]">
              继续保持，你很棒！
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className={`
                  rounded-2xl border overflow-hidden transition-all duration-200
                  ${entry.isConfirmed
                    ? 'bg-[var(--rhythm-bg-card)]/50 border-[var(--rhythm-bg-border)] opacity-50'
                    : 'bg-[var(--rhythm-bg-card)] border-[var(--rhythm-bg-border)] hover:border-[var(--rhythm-primary)]/20'
                  }
                `}
              >
                {/* 题目卡片 */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* 标签 */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${DIFFICULTY_LABELS[entry.difficulty]?.color}`}>
                          {DIFFICULTY_LABELS[entry.difficulty]?.label}
                        </span>
                        <span className="text-[10px] text-[var(--rhythm-neutral-600)]">
                          {entry.grade}年级
                        </span>
                        {entry.isConfirmed && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--rhythm-success)]/10 text-[var(--rhythm-success)]">
                            已记住
                          </span>
                        )}
                      </div>

                      {/* 句子 */}
                      <p className="text-sm text-[var(--rhythm-neutral-200)] leading-relaxed">
                        {entry.sentenceEn.replace(
                          entry.targetWord,
                          '_'.repeat(entry.targetWord.length)
                        )}
                      </p>
                      <p className="text-xs text-[var(--rhythm-neutral-500)] mt-1">
                        {entry.sentenceZh}
                      </p>

                      {/* 答对次数 */}
                      <p className="text-xs text-[var(--rhythm-neutral-600)] mt-2">
                        已答对 {entry.correctCount}/2 次
                        {entry.correctCount >= 2 && ' · 即将自动移除'}
                      </p>
                    </div>

                    {/* 展开箭头 */}
                    <span className="text-[var(--rhythm-neutral-500)] text-sm mt-1">
                      {expandedId === entry.id ? '▾' : '▸'}
                    </span>
                  </div>
                </div>

                {/* 展开详情 */}
                {expandedId === entry.id && (
                  <div className="px-4 pb-4 border-t border-[var(--rhythm-bg-border)] pt-4">
                    {/* 答案 */}
                    <div className="mb-3">
                      <p className="text-xs text-[var(--rhythm-neutral-500)] mb-1">正确答案</p>
                      <p className="text-lg font-bold font-[Orbitron] text-[var(--rhythm-primary-light)]">
                        {entry.targetWord}
                        <span className="text-sm text-[var(--rhythm-neutral-400)] ml-2">
                          ({entry.firstLetter?.toUpperCase()}...)
                        </span>
                      </p>
                    </div>

                    {/* 冷知识 */}
                    {entry.funFacts.length > 0 && (
                      <div className="mb-3 p-3 rounded-xl bg-[var(--rhythm-bg-card)]/50 border border-[var(--rhythm-bg-border)]">
                        <p className="text-xs text-[var(--rhythm-neutral-500)] mb-1">💡 冷知识</p>
                        <p className="text-xs text-[var(--rhythm-neutral-300)] leading-relaxed">
                          {entry.funFacts[0]}
                        </p>
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                      {!entry.isConfirmed && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemember(entry.id); }}
                          className="flex-1 px-4 py-2 rounded-xl bg-[var(--rhythm-primary)]/20 text-sm font-semibold text-[var(--rhythm-primary-light)] hover:bg-[var(--rhythm-primary)]/30 transition-colors"
                        >
                          ✅ 我记住了
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
