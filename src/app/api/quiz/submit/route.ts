// POST /api/quiz/submit
// 提交答案 → 判定对错 → 计算积分 → 返回反馈
// M5 增强：反刷机制（同题24h冷却）、多通道积分（组题完成/每日首练/错题复习）

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';

// 积分常量
const SCORE = {
  BASE: 10,              // 基础正确分
  QUICK: 5,              // 快速反应 (< 1.5s)
  PERFECT: 3,            // 完美拼写
  COMBO_5: 1,            // Combo 5+
  COMBO_10: 3,           // Combo 10+
  COMBO_20: 5,           // Combo 20+
  DAILY_FIRST: 10,       // 每日首练
  SET_COMPLETE: 20,      // 组题完成（每20题）
  WRONG_REVIEW: 8,       // 错题复习奖励
};

// 获取今天 00:00 的 Date
function startOfDay(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const { questionId, userAnswer, timeSpent, comboBefore } = await request.json();

    if (!questionId || userAnswer === undefined) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 获取题目
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json({ error: '题目不存在' }, { status: 404 });
    }

    // ---- 反刷机制：同一题 24h 内只给首次积分 ----
    const todayStart = startOfDay();
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const recentAnswer = await prisma.answerRecord.findFirst({
      where: {
        userId,
        questionId,
        isCorrect: true,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    const isAntiFarming = !!recentAnswer; // 24h内已答对此题

    // 判定对错（不区分大小写）
    const isCorrect =
      userAnswer.toLowerCase().trim() === question.targetWord.toLowerCase().trim();

    // ---- 计算积分 ----
    let scoreEarned = 0;
    let isQuickResponse = false;
    let isPerfectSpelling = false;
    const scoreDetails: string[] = [];

    if (isCorrect && !isAntiFarming) {
      // 基础分
      scoreEarned += SCORE.BASE;
      scoreDetails.push(`基础 +${SCORE.BASE}`);

      // 快速反应（< 1.5s）
      if (timeSpent < 1500) {
        scoreEarned += SCORE.QUICK;
        isQuickResponse = true;
        scoreDetails.push(`闪电 +${SCORE.QUICK}`);
      }

      // 完美拼写
      if (userAnswer === question.targetWord) {
        scoreEarned += SCORE.PERFECT;
        isPerfectSpelling = true;
        scoreDetails.push(`完美 +${SCORE.PERFECT}`);
      }

      // Combo 加成
      const combo = comboBefore || 0;
      if (combo >= 20) {
        scoreEarned += SCORE.COMBO_20;
        scoreDetails.push(`Combo ×20 +${SCORE.COMBO_20}`);
      } else if (combo >= 10) {
        scoreEarned += SCORE.COMBO_10;
        scoreDetails.push(`Combo ×10 +${SCORE.COMBO_10}`);
      } else if (combo >= 5) {
        scoreEarned += SCORE.COMBO_5;
        scoreDetails.push(`Combo ×5 +${SCORE.COMBO_5}`);
      }

      // 每日首练
      const todayAnswerCount = await prisma.answerRecord.count({
        where: {
          userId,
          createdAt: { gte: todayStart },
        },
      });

      if (todayAnswerCount === 0) {
        scoreEarned += SCORE.DAILY_FIRST;
        scoreDetails.push(`每日首练 +${SCORE.DAILY_FIRST}`);
      }

      // 错题复习奖励
      const isWrongReview = await prisma.wrongBook.findFirst({
        where: { userId, questionId },
      });

      if (isWrongReview && !isWrongReview.isConfirmed) {
        scoreEarned += SCORE.WRONG_REVIEW;
        scoreDetails.push(`错题复习 +${SCORE.WRONG_REVIEW}`);
      }
    } else if (isCorrect && isAntiFarming) {
      // 反刷：答对但不给分
      scoreDetails.push('(24h 内重复答题，无积分)');
    }

    // 写入答题记录
    const now = new Date();
    await prisma.$transaction(async (tx) => {
      // 创建答题记录
      await tx.answerRecord.create({
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
      });

      // 更新题目使用次数
      await tx.question.update({
        where: { id: questionId },
        data: { usageCount: { increment: 1 } },
      });

      // 更新积分
      if (scoreEarned > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { totalPoints: { increment: scoreEarned } },
        });

        await tx.scoreEvent.create({
          data: {
            userId,
            type: isAntiFarming ? 'answer' : (isQuickResponse ? 'quick' : isPerfectSpelling ? 'perfect' : 'answer'),
            amount: scoreEarned,
            balance: 0,
            description: `答题正确 · ${scoreDetails.join(' + ')}`,
          },
        });
      }

      // 组题完成奖励（累计答对满 20 的倍数题）
      if (isCorrect) {
        const totalCorrect = await tx.answerRecord.count({
          where: { userId, isCorrect: true },
        });

        if (totalCorrect > 0 && totalCorrect % 20 === 0) {
          await tx.user.update({
            where: { id: userId },
            data: { totalPoints: { increment: SCORE.SET_COMPLETE } },
          });

          await tx.scoreEvent.create({
            data: {
              userId,
              type: 'set',
              amount: SCORE.SET_COMPLETE,
              balance: 0,
              description: `组题完成奖励 · 累计 ${totalCorrect} 题 +${SCORE.SET_COMPLETE}`,
            },
          });

          scoreEarned += SCORE.SET_COMPLETE;
          scoreDetails.push(`组题完成 +${SCORE.SET_COMPLETE}`);
        }
      }

      // 处理错题本
      if (!isCorrect) {
        await tx.wrongBook.upsert({
          where: {
            userId_questionId: { userId, questionId },
          },
          create: {
            userId,
            questionId,
            correctCount: 0,
            lastWrongAt: now,
          },
          update: {
            lastWrongAt: now,
            isConfirmed: false,
          },
        });
      } else {
        // 答对了，更新错题本计数
        const wb = await tx.wrongBook.findUnique({
          where: { userId_questionId: { userId, questionId } },
        });

        if (wb) {
          const newCount = wb.correctCount + 1;
          if (newCount >= 2) {
            // 连续答对 2 次，移出错题本
            await tx.wrongBook.delete({
              where: { userId_questionId: { userId, questionId } },
            });
          } else {
            await tx.wrongBook.update({
              where: { userId_questionId: { userId, questionId } },
              data: { correctCount: newCount },
            });
          }
        }
      }
    });

    // 更新 ScoreEvent balance
    if (scoreEarned > 0) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { totalPoints: true },
      });
      if (user) {
        await prisma.scoreEvent.updateMany({
          where: { userId, createdAt: { gte: new Date(Date.now() - 5000) } },
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
      isAntiFarming,
      scoreDetails,
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
