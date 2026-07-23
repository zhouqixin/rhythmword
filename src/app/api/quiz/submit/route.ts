// POST /api/quiz/submit
// 提交答案 → 判定对错 → 计算积分 → 返回反馈

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
    const { questionId, userAnswer, timeSpent, comboBefore } = await request.json();

    if (!questionId || userAnswer === undefined) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 获取题目
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json({ error: '题目不存在' }, { status: 404 });
    }

    // 判定对错（不区分大小写）
    const isCorrect =
      userAnswer.toLowerCase().trim() === question.targetWord.toLowerCase().trim();

    // 计算积分
    let scoreEarned = 0;
    let isQuickResponse = false;
    let isPerfectSpelling = false;

    if (isCorrect) {
      // 基础分
      scoreEarned += 10;

      // 快速反应（< 1.5s）
      if (timeSpent < 1500) {
        scoreEarned += 5;
        isQuickResponse = true;
      }

      // 完美拼写（一次输入正确）
      if (userAnswer === question.targetWord) {
        scoreEarned += 3;
        isPerfectSpelling = true;
      }

      // Combo 加成
      if (comboBefore >= 20) scoreEarned += 5;
      else if (comboBefore >= 10) scoreEarned += 3;
      else if (comboBefore >= 5) scoreEarned += 1;
    }

    // 写入答题记录
    const [answerRecord] = await prisma.$transaction([
      prisma.answerRecord.create({
        data: {
          userId,
          questionId,
          userAnswer: userAnswer.toLowerCase().trim(),
          isCorrect,
          timeSpent: timeSpent || 0,
          isQuickResponse,
          isPerfectSpelling,
          comboAtTime: comboBefore || 0,
          scoreEarned,
        },
      }),
      // 更新题目使用次数
      prisma.question.update({
        where: { id: questionId },
        data: { usageCount: { increment: 1 } },
      }),
      // 更新积分
      ...(scoreEarned > 0
        ? [
            prisma.user.update({
              where: { id: userId },
              data: { totalPoints: { increment: scoreEarned } },
            }),
            prisma.scoreEvent.create({
              data: {
                userId,
                type: isQuickResponse ? 'quick' : isPerfectSpelling ? 'perfect' : 'answer',
                amount: scoreEarned,
                balance: 0,
                description: `答题${isCorrect ? '正确' : ''} +${scoreEarned}分`,
              },
            }),
          ]
        : []),
    ]);

    // 更新 ScoreEvent balance
    if (scoreEarned > 0) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { totalPoints: true },
      });
      if (user) {
        await prisma.scoreEvent.updateMany({
          where: { userId, type: 'answer' },
          data: { balance: user.totalPoints },
        });
      }
    }

    return NextResponse.json({
      isCorrect,
      correctAnswer: question.targetWord,
      userAnswer: userAnswer.toLowerCase().trim(),
      scoreEarned,
      isQuickResponse,
      isPerfectSpelling,
      funFacts: question.funFacts ? JSON.parse(question.funFacts) : [],
    });
  } catch (error) {
    console.error('提交答案失败:', error);
    return NextResponse.json(
      { error: '提交失败，请稍后重试' },
      { status: 500 }
    );
  }
}
