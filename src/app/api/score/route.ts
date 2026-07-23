// GET /api/score — 获取积分历史、本周统计、等级进度
// M5: 积分系统

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';

// 等级阈值（每级所需总积分）
function levelThreshold(level: number): number {
  // 1级: 0-99, 2级: 100-249, 3级: 250-449 ...
  // 公式: 需要积分 = level * (50 + level * 5)
  return level * 50 + level * level * 5;
}

// 等级名称
const LEVEL_NAMES: Record<number, string> = {
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

function getLevelInfo(points: number) {
  let level = 1;
  for (let l = 1; l <= 50; l++) {
    if (points >= levelThreshold(l)) {
      level = l;
    } else {
      break;
    }
  }

  const currentThreshold = levelThreshold(level);
  const nextThreshold = level < 50 ? levelThreshold(level + 1) : currentThreshold;
  const progress = level < 50
    ? ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    : 100;

  return {
    level: Math.min(level, 50),
    title: LEVEL_NAMES[Math.min(level, 50)] || '终极学霸',
    currentPoints: points,
    nextLevelPoints: nextThreshold,
    progress: Math.round(progress * 10) / 10,
    isMax: level >= 50,
  };
}

function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 7);

  return { monday, sunday };
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const { monday, sunday } = getWeekRange();

  // 并行查询
  const [user, weekStats, weekCorrect, recentEvents, badges, todayAnswers] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { totalPoints: true, level: true, firstBgmPurchase: true, firstSkinPurchase: true },
    }),
    // 本周统计
    prisma.answerRecord.aggregate({
      where: {
        userId,
        createdAt: { gte: monday, lt: sunday },
      },
      _count: { id: true },
      _sum: { scoreEarned: true },
    }),
    // 本周正确数
    prisma.answerRecord.count({
      where: {
        userId,
        isCorrect: true,
        createdAt: { gte: monday, lt: sunday },
      },
    }) as Promise<number>,
    // 最近积分事件（20条）
    prisma.scoreEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        type: true,
        amount: true,
        balance: true,
        description: true,
        createdAt: true,
      },
    }),
    // 徽章
    prisma.badge.findMany({
      where: { userId },
      select: {
        badgeKey: true,
        badgeName: true,
        earnedAt: true,
      },
      orderBy: { earnedAt: 'desc' },
    }),
    // 今日答题数
    prisma.answerRecord.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  if (!user) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }

  const levelInfo = getLevelInfo(user.totalPoints);

  return NextResponse.json({
    totalPoints: user.totalPoints,
    levelInfo,
    weekStats: {
      questionsAnswered: weekStats._count.id,
      correctAnswers: weekCorrect,
      scoreEarned: weekStats._sum.scoreEarned || 0,
    },
    recentEvents,
    badges,
    firstBgmPurchase: user.firstBgmPurchase,
    firstSkinPurchase: user.firstSkinPurchase,
    todayAnswerCount: todayAnswers,
  });
}
