// POST /api/signin — 每日签到
// Phase 1 使用数据库记录

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';

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
  if (rand < 0.80) {
    points = Math.floor(Math.random() * 6) + 5; // 5-10
  } else if (rand < 0.95) {
    points = Math.floor(Math.random() * 5) + 11; // 11-15
  } else {
    points = Math.floor(Math.random() * 5) + 16; // 16-20
  }

  // Day 7 奖励翻倍
  if (streak === 7) {
    points *= 2;
  }

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
        balance: 0, // 会被后续更新
        description: `每日签到 · Day ${streak}`,
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
      where: { userId, type: 'signin' },
      data: { balance: user.totalPoints },
    });
  }

  return NextResponse.json({
    success: true,
    points,
    streak,
  });
}
