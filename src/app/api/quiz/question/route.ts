// GET /api/quiz/question
// 根据用户年级和难度返回一道未做过的题目
// 排除当天已答过的题目

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  // 获取用户配置
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { grade: true, difficulty: true },
  });

  if (!user) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }

  // 获取今日已答题目的 ID
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayAnswers = await prisma.answerRecord.findMany({
    where: {
      userId,
      createdAt: { gte: today },
    },
    select: { questionId: true },
  });

  const answeredIds = todayAnswers.map((a) => a.questionId);

  // 查询题目：匹配年级和难度，排除已答题，按使用次数升序
  const question = await prisma.question.findFirst({
    where: {
      grade: user.grade,
      difficulty: user.difficulty,
      reviewStatus: 'approved',
      ...(answeredIds.length > 0 ? { id: { notIn: answeredIds } } : {}),
    },
    orderBy: { usageCount: 'asc' },
  });

  if (!question) {
    // 如果该年级+难度没有题目了，尝试放宽难度
    const fallback = await prisma.question.findFirst({
      where: {
        grade: user.grade,
        reviewStatus: 'approved',
        ...(answeredIds.length > 0 ? { id: { notIn: answeredIds } } : {}),
      },
      orderBy: { usageCount: 'asc' },
    });

    if (!fallback) {
      return NextResponse.json(
        { error: '暂无可用的题目，请联系管理员扩充题库' },
        { status: 404 }
      );
    }

    return NextResponse.json({ question: formatQuestion(fallback) });
  }

  return NextResponse.json({ question: formatQuestion(question) });
}

function formatQuestion(q: {
  id: string;
  sentenceEn: string;
  sentenceZh: string;
  targetWord: string;
  firstLetter: string;
  blankCount: number;
  questionType: string;
  bpm: number;
  funFacts: string | null;
}) {
  return {
    id: q.id,
    sentenceEn: q.sentenceEn,
    sentenceZh: q.sentenceZh,
    targetWord: q.targetWord,
    firstLetter: q.firstLetter,
    blankCount: q.blankCount,
    questionType: q.questionType,
    bpm: q.bpm,
    funFacts: q.funFacts ? JSON.parse(q.funFacts) : [],
  };
}
