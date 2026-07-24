/**
 * 智能提示系统 — 根据难度和单词长度计算需要提示的字母位置
 *
 * 规则：
 * - 最多提示字母数 = max(1, ceil(wordLength * rate))
 * - easy:   5% — 最宽松
 * - medium: 3% — 中等
 * - hard:   1% — 最严格
 * - 位置随机分布，不保证包含首字母
 * - Fisher-Yates 洗牌保证均匀分布
 */

export type Difficulty = 'easy' | 'medium' | 'hard';

const HINT_RATES: Record<Difficulty, number> = {
  easy: 0.05,
  medium: 0.03,
  hard: 0.01,
};

/**
 * 根据单词长度和难度计算要提示的字母位置索引（0-based）
 * 返回排序后的位置数组
 */
export function computeHintPositions(
  wordLength: number,
  difficulty: Difficulty
): number[] {
  if (wordLength <= 0) return [];

  const rate = HINT_RATES[difficulty] ?? HINT_RATES.medium;
  const maxHints = Math.max(1, Math.ceil(wordLength * rate));

  // 生成所有位置索引
  const positions = Array.from({ length: wordLength }, (_, i) => i);

  // Fisher-Yates 洗牌
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  // 取前 N 个并排序
  return positions.slice(0, maxHints).sort((a, b) => a - b);
}

/**
 * 获取难度对应的提示率（用于调试/显示）
 */
export function getHintRate(difficulty: Difficulty): number {
  return HINT_RATES[difficulty] ?? HINT_RATES.medium;
}
