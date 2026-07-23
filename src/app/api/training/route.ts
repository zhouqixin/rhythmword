// POST /api/training — 保存训练会话 + 获取昨日对比
// GET /api/training — 获取最近训练记录

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const { totalQuestions, correctCount, maxCombo, totalScore } = await request.json();

    if (!totalQuestions) {
      return NextResponse.json({ error: '缺少参数' }, { status: 400 });
    }

    // 计算评级
    const accuracy = totalQuestions > 0 ? correctCount / totalQuestions : 0;
    let rank: string;
    if (accuracy >= 0.95 && maxCombo >= 15) rank = 'S';
    else if (accuracy >= 0.80 && maxCombo >= 10) rank = 'A';
    else if (accuracy >= 0.60) rank = 'B';
    else rank = 'C';

    // 找 MVP 词汇（答错最多的词）
    const wrongWords = await prisma.wrongBook.findMany({
      where: { userId },
      orderBy: { lastWrongAt: 'desc' },
      take: 5,
      include: { question: { select: { targetWord: true } } },
    });

    const mvpWord = wrongWords.length > 0 ? wrongWords[0].question.targetWord : null;

    // 昨日对比
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterdaySession = await prisma.trainingSession.findFirst({
      where: {
        userId,
        createdAt: { gte: yesterday, lt: today },
        completed: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    let comparison: string | null = null;
    if (yesterdaySession) {
      const prevAccuracy = yesterdaySession.totalQuestions > 0
        ? yesterdaySession.correctCount / yesterdaySession.totalQuestions
        : 0;

      if (accuracy > prevAccuracy + 0.05) {
        comparison = `正确率比昨天提升了 ${Math.round((accuracy - prevAccuracy) * 100)}%！`;
      } else if (accuracy < prevAccuracy - 0.05) {
        comparison = `比昨天稍有下降，明天加油！`;
      } else {
        comparison = '表现与昨天持平，保持稳定！';
      }
    }

    // 保存训练会话
    const session_ = await prisma.trainingSession.create({
      data: {
        userId,
        totalQuestions,
        correctCount,
        maxCombo,
        totalScore,
        rank,
        mvpWordId: mvpWord,
        completed: true,
      },
    });

    return NextResponse.json({
      id: session_.id,
      rank,
      mvpWord,
      yesterdayComparison: comparison,
    });
  } catch (error) {
    console.error('保存训练失败:', error);
    return NextResponse.json({ error: '保存失败' }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const sessions = await prisma.trainingSession.findMany({
    where: { userId, completed: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      totalQuestions: true,
      correctCount: true,
      maxCombo: true,
      totalScore: true,
      rank: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ sessions });
}
