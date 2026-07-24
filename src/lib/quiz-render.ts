/**
 * 答题界面渲染工具
 *
 * 句子的 ___ 始终保持不变（不显示 hint 字母、不下划线展开），
 * hint 字母仅在输入框的 placeholder 位置显示。
 *
 * @example
 * renderHintedSentence("The ___ was great.", "abandon", [5, 6])
 * // => "The ___ was great."
 */
export function renderHintedSentence(
  _sentenceEn: string,
  _targetWord: string,
  _hintPositions: number[]
): string {
  return _sentenceEn;
}

/**
 * 渲染空白的填空（无提示时使用）
 * "I ___ apples" → "I ___ apples"
 */
export function renderBlankSentence(
  sentenceEn: string,
  _blankCount: number
): string {
  return sentenceEn;
}
