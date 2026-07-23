// GET /api/signin — 查询签到状态
// POST /api/signin — 执行签到
// M5 增强：英文励志语、翻牌交互数据、Day7 金色粒子标识

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';

// 英文励志语库
const MOTIVATIONAL_QUOTES = [
  { en: 'The secret of getting ahead is getting started.', zh: '前进的秘诀就是开始行动。', author: 'Mark Twain' },
  { en: 'It does not matter how slowly you go as long as you do not stop.', zh: '走得慢不要紧，重要的是不要停下。', author: 'Confucius' },
  { en: 'Believe you can and you\'re halfway there.', zh: '相信你可以，你就已经成功了一半。', author: 'Theodore Roosevelt' },
  { en: 'The only way to do great work is to love what you do.', zh: '成就伟大的唯一方式是热爱你所做的事。', author: 'Steve Jobs' },
  { en: 'Small daily improvements lead to stunning results.', zh: '每天的小进步会带来惊人的成果。', author: 'Robin Sharma' },
  { en: 'Don\'t watch the clock; do what it does. Keep going.', zh: '不要盯着时钟看，像它一样行动——继续前进。', author: 'Sam Levenson' },
  { en: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', zh: '成功不是终点，失败也非末日，最重要的是继续前进的勇气。', author: 'Winston Churchill' },
  { en: 'The future belongs to those who believe in the beauty of their dreams.', zh: '未来属于那些相信自己梦想之美的人。', author: 'Eleanor Roosevelt' },
  { en: 'You are never too old to set another goal or to dream a new dream.', zh: '设定新目标或做新梦永远不会太晚。', author: 'C.S. Lewis' },
  { en: 'Education is the most powerful weapon which you can use to change the world.', zh: '教育是你可以用来改变世界的最强大武器。', author: 'Nelson Mandela' },
  { en: 'The expert in anything was once a beginner.', zh: '任何领域的专家都曾是初学者。', author: 'Helen Hayes' },
  { en: 'Every accomplishment starts with the decision to try.', zh: '每一项成就都始于一个尝试的决定。', author: 'John F. Kennedy' },
  { en: 'Words are, in my not-so-humble opinion, our most inexhaustible source of magic.', zh: '依我之见，文字是我们最不枯竭的魔法之源。', author: 'Albus Dumbledore' },
  { en: 'Learning is a treasure that will follow its owner everywhere.', zh: '学习是一笔跟随主人到天涯海角的财富。', author: 'Chinese Proverb' },
];

function getRandomQuote() {
  return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
}

// 获取本周签到状态
function getWeekDates() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

// GET: 查询签到状态
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 本周签到记录
  const weekDates = getWeekDates();
  const signIns = await prisma.signIn.findMany({
    where: {
      userId,
      date: { gte: weekDates[0], lte: weekDates[6] },
    },
    orderBy: { date: 'asc' },
  });

  const todaySignIn = signIns.find((s) => s.date.getTime() === today.getTime());

  // 连续天数
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdaySignIn = signIns.find((s) => s.date.getTime() === yesterday.getTime());

  const streak = todaySignIn
    ? todaySignIn.streak
    : yesterdaySignIn
      ? yesterdaySignIn.streak
      : 0;

  // 周签到状态数组
  const weekStatus = weekDates.map((d) => ({
    date: d.toISOString().split('T')[0],
    signed: signIns.some((s) => s.date.getTime() === d.getTime()),
    points: signIns.find((s) => s.date.getTime() === d.getTime())?.pointsEarned || 0,
    isToday: d.getTime() === today.getTime(),
    isGolden: false, // Day7 金色标识
  }));

  // 标记 Day 7
  if (weekStatus.filter((w) => w.signed).length >= 6 && weekStatus[6].signed) {
    weekStatus[6].isGolden = true;
  }

  const quote = getRandomQuote();

  return NextResponse.json({
    todaySigned: !!todaySignIn,
    todayPoints: todaySignIn?.pointsEarned || 0,
    streak,
    weekStatus,
    totalSignIns: signIns.length,
    quote,
  });
}

// POST: 执行签到
export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  // 获取今日日期（仅日期部分）
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 检查今日是否已签到
  const existing = await prisma.signIn.findUnique({
    where: {
      userId_date: { userId, date: today },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: '今日已签到', points: existing.pointsEarned },
      { status: 400 }
    );
  }

  // 计算连续签到天数
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const yesterdaySignIn = await prisma.signIn.findUnique({
    where: {
      userId_date: { userId, date: yesterday },
    },
  });

  const streak = yesterdaySignIn ? yesterdaySignIn.streak + 1 : 1;

  // 随机积分 5-20
  // 概率分布: 80% 5-10, 15% 11-15, 5% 16-20
  const rand = Math.random();
  let points: number;
  let rarity: 'common' | 'rare' | 'legendary';
  if (rand < 0.80) {
    points = Math.floor(Math.random() * 6) + 5;
    rarity = 'common';
  } else if (rand < 0.95) {
    points = Math.floor(Math.random() * 5) + 11;
    rarity = 'rare';
  } else {
    points = Math.floor(Math.random() * 5) + 16;
    rarity = 'legendary';
  }

  // Day 7 奖励翻倍 + 金色
  const isDay7 = streak === 7;
  if (isDay7) {
    points *= 2;
  }

  const quote = getRandomQuote();

  // 写入签到记录 + 更新积分
  const [signIn] = await prisma.$transaction([
    prisma.signIn.create({
      data: {
        userId,
        date: today,
        streak,
        pointsEarned: points,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { totalPoints: { increment: points } },
    }),
    prisma.scoreEvent.create({
      data: {
        userId,
        type: 'signin',
        amount: points,
        balance: 0,
        description: `每日签到 · Day ${streak}${isDay7 ? ' 🎉 7天达成!' : ''}`,
      },
    }),
  ]);

  // 更新 scoreEvent 的 balance
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalPoints: true },
  });

  if (user) {
    await prisma.scoreEvent.updateMany({
      where: { userId, type: 'signin', createdAt: { gte: new Date(Date.now() - 5000) } },
      data: { balance: user.totalPoints },
    });
  }

  return NextResponse.json({
    success: true,
    points,
    streak,
    rarity,
    isDay7,
    quote,
  });
}
