// GET /api/wrongbook — 获取错题本列表 + 统计
// POST /api/wrongbook — 标记「我记住了」(手动移除)
// DELETE /api/wrongbook — 清空错题本

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

  const [entries, stats] = await Promise.all([
    prisma.wrongBook.findMany({
      where: { userId },
      include: {
        question: {
          select: {
            id: true,
            sentenceEn: true,
            sentenceZh: true,
            targetWord: true,
            firstLetter: true,
            blankCount: true,
            grade: true,
            difficulty: true,
            funFacts: true,
          },
        },
      },
      orderBy: { lastWrongAt: 'desc' },
    }),
    // 错题统计
    prisma.wrongBook.aggregate({
      where: { userId },
      _count: { id: true },
    }),
    // 按年级统计
    prisma.wrongBook.groupBy({
      by: ['questionId'],
      where: { userId },
    }),
  ]);

  // 按难度分组统计
  const difficultyStats: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
  const gradeStats: Record<number, number> = {};

  for (const entry of entries) {
    const d = entry.question.difficulty;
    if (d in difficultyStats) {
      difficultyStats[d]++;
    }

    const g = entry.question.grade;
    gradeStats[g] = (gradeStats[g] || 0) + 1;
  }

  return NextResponse.json({
    entries: entries.map((e) => ({
      id: e.id,
      questionId: e.question.id,
      sentenceEn: e.question.sentenceEn,
      sentenceZh: e.question.sentenceZh,
      targetWord: e.question.targetWord,
      firstLetter: e.question.firstLetter,
      blankCount: e.question.blankCount,
      grade: e.question.grade,
      difficulty: e.question.difficulty,
      funFacts: e.question.funFacts ? JSON.parse(e.question.funFacts) : [],
      correctCount: e.correctCount,
      lastWrongAt: e.lastWrongAt.toISOString(),
      isConfirmed: e.isConfirmed,
    })),
    stats: {
      total: stats._count.id,
      byDifficulty: difficultyStats,
      byGrade: gradeStats,
    },
  });
}

// POST: 标记「我记住了」
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const { wrongBookId } = await request.json();

    if (!wrongBookId) {
      return NextResponse.json({ error: '缺少错题ID' }, { status: 400 });
    }

    const entry = await prisma.wrongBook.findFirst({
      where: { id: wrongBookId, userId },
    });

    if (!entry) {
      return NextResponse.json({ error: '错题记录不存在' }, { status: 404 });
    }

    await prisma.wrongBook.update({
      where: { id: wrongBookId },
      data: { isConfirmed: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('标记失败:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}

// DELETE: 移除单个错题（答对2次自动移除由 submit API 处理）
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const { searchParams } = new URL(request.url);
    const wrongBookId = searchParams.get('id');

    if (wrongBookId) {
      // 删除单条
      await prisma.wrongBook.deleteMany({
        where: { id: wrongBookId, userId },
      });
    } else {
      // 清空全部
      await prisma.wrongBook.deleteMany({
        where: { userId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除失败:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
