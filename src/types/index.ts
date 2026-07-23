// RhythmWord 核心类型定义

// ---- 用户 ----
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Accent = 'en-US' | 'en-GB';
export type QuestionType = 'first_letter' | 'dictation';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  grade: number;          // 1-12
  difficulty: Difficulty;
  accent: Accent;
  totalPoints: number;
  level: number;          // 1-50
  bgmStyle: string | null;
  bgmVolume: number;
  sfxVolume: number;
  globalVolume: number;
  isOnboarded: boolean;
  reducedMotion: boolean;
}

// ---- 题目 ----
export interface Question {
  id: string;
  sentenceEn: string;
  sentenceZh: string;
  targetWord: string;
  firstLetter: string;
  blankCount: number;
  grade: number;
  difficulty: Difficulty;
  questionType: QuestionType;
  bpm: number;
  funFacts: string[] | null;
}

// ---- 答题 ----
export type AnswerResult = 'correct' | 'error' | 'timeout';
export type ComboState = 'active' | 'shielded' | 'buffering' | 'broken';

export interface QuizState {
  currentQuestion: Question | null;
  questionIndex: number;
  totalQuestions: number;
  userInput: string[];
  combo: number;
  maxCombo: number;
  shields: number;
  bufferTimeLeft: number;
  comboState: ComboState;
  isPlaying: boolean;
  isSubmitting: boolean;
  sessionScore: number;
  correctCount: number;
}

export interface QuizResult {
  result: AnswerResult;
  correctAnswer: string;
  userAnswer: string;
  funFacts: string[];
  scoreEarned: number;
  isQuickResponse: boolean;
  isPerfectSpelling: boolean;
  comboBefore: number;
  comboAfter: number;
  shieldConsumed: boolean;
}

// ---- 签到 ----
export interface SignInStatus {
  streak: number;
  todaySigned: boolean;
  pointsEarned: number;
  motivationalQuote: string;
  weekStatus: boolean[];  // 7 天签到状态
}

// ---- 积分 ----
export type ScoreEventType =
  | 'answer' | 'combo' | 'quick' | 'perfect' | 'set'
  | 'daily' | 'signin' | 'levelup' | 'purchase' | 'review';

export interface ScoreRecord {
  id: string;
  type: ScoreEventType;
  amount: number;
  balance: number;
  description: string;
  createdAt: string;
}

// ---- 商城 ----
export type ShopCategory = 'bgm' | 'skin' | 'item' | 'theme';

export interface ShopProduct {
  id: string;
  category: ShopCategory;
  name: string;
  description: string;
  price: number;
  salePrice: number | null;
  isWeeklyDeal: boolean;
  previewUrl: string | null;
  owned: boolean;
  equipped: boolean;
}

// ---- 错题 ----
export interface WrongBookEntry {
  id: string;
  question: Question;
  correctCount: number;
  lastWrongAt: string;
  isConfirmed: boolean;
}

// ---- 训练会话 ----
export type CeremonyRank = 'S' | 'A' | 'B' | 'C';

export interface TrainingSummary {
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  maxCombo: number;
  totalScore: number;
  rank: CeremonyRank;
  mvpWord: string;
  yesterdayComparison: string;
}

// ---- 等级 ----
export const LEVEL_NAMES: Record<number, string> = {
  1: '探索者', 2: '探索者', 3: '探索者', 4: '探索者', 5: '探索者',
  6: '学徒', 7: '学徒', 8: '学徒', 9: '学徒', 10: '学徒',
  11: '旅人', 12: '旅人', 13: '旅人', 14: '旅人', 15: '旅人',
  16: '航海家', 17: '航海家', 18: '航海家', 19: '航海家', 20: '航海家',
  21: '大师', 22: '大师', 23: '大师', 24: '大师', 25: '大师',
  26: '传奇', 27: '传奇', 28: '传奇', 29: '传奇', 30: '传奇',
  31: '英雄', 32: '英雄', 33: '英雄', 34: '英雄', 35: '英雄',
  36: '王者', 37: '王者', 38: '王者', 39: '王者', 40: '王者',
  41: '冠军', 42: '冠军', 43: '冠军', 44: '冠军', 45: '冠军',
  46: '终极学霸', 47: '终极学霸', 48: '终极学霸', 49: '终极学霸', 50: '终极学霸',
};

// Combo 里程碑
export const COMBO_MILESTONES: Record<number, string> = {
  5: '不错哦！',
  10: '渐入佳境！🔥',
  15: '势不可挡！',
  20: '无人能挡！⚡',
  30: '神级表现！💎',
  50: '传说降临！👑',
  75: '超越极限！🌟',
  100: '封神之路！🏆',
};
