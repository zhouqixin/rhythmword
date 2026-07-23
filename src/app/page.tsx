// 首页 — Phase 1 MVP 首页
// 问候语 + 签到卡片 + 训练概览 + 开始训练 CTA
// 通过 Session 获取真实用户数据

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import HomeClient from '@/components/home/HomeClient';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth');
  }

  const userId = (session.user as { id: string }).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      grade: true,
      difficulty: true,
      totalPoints: true,
      level: true,
      isOnboarded: true,
    },
  });

  if (!user?.isOnboarded) {
    redirect('/onboarding');
  }

  // 获取今日签到状态
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaySignIn = await prisma.signIn.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  });

  // 获取本周签到情况
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const weekSignIns = await prisma.signIn.findMany({
    where: {
      userId,
      date: { gte: weekStart },
    },
    orderBy: { date: 'asc' },
  });

  const weekStatus = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return weekSignIns.some(
      (s) => new Date(s.date).toDateString() === d.toDateString()
    );
  });

  // 获取最近一次训练
  const lastSession = await prisma.trainingSession.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      totalQuestions: true,
      correctCount: true,
      maxCombo: true,
    },
  });

  return (
    <HomeClient
      userName={user.name || '同学'}
      points={user.totalPoints}
      level={user.level}
      todaySigned={!!todaySignIn}
      weekStatus={weekStatus}
      streak={todaySignIn?.streak || 0}
      lastSession={lastSession ? {
        questions: lastSession.totalQuestions,
        correct: lastSession.correctCount,
        maxCombo: lastSession.maxCombo,
      } : null}
    />
  );
}
