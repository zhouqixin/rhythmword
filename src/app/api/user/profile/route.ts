// GET/PUT /api/user/profile
// 获取和更新用户配置

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';

// GET — 获取当前用户完整配置
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      grade: true,
      difficulty: true,
      accent: true,
      totalPoints: true,
      level: true,
      bgmStyle: true,
      bgmVolume: true,
      sfxVolume: true,
      globalVolume: true,
      isOnboarded: true,
      reducedMotion: true,
      firstBgmPurchase: true,
      firstSkinPurchase: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }

  return NextResponse.json({ user });
}

// PUT — 更新用户配置
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await request.json();

    // 允许更新的字段白名单
    const allowedFields: Record<string, boolean> = {
      name: true,
      grade: true,
      difficulty: true,
      accent: true,
      bgmStyle: true,
      bgmVolume: true,
      sfxVolume: true,
      globalVolume: true,
      reducedMotion: true,
      isOnboarded: true,
    };

    const updateData: Record<string, unknown> = {};
    for (const key of Object.keys(body)) {
      if (allowedFields[key]) {
        updateData[key] = body[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: '没有可更新的字段' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        grade: true,
        difficulty: true,
        accent: true,
        totalPoints: true,
        level: true,
        isOnboarded: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('更新配置失败:', error);
    return NextResponse.json(
      { error: '更新失败，请稍后重试' },
      { status: 500 }
    );
  }
}
