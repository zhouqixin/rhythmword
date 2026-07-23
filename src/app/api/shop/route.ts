// GET /api/shop — 获取商城商品列表 + 用户拥有状态
// POST /api/shop — 购买商品

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';

// 商品分类
type ShopCategory = 'bgm' | 'skin' | 'item' | 'theme';

// 静态商品数据（种子）
const SHOP_ITEMS = [
  // ---- 道具 ----
  { id: 'item-revive', category: 'item', name: '复活卡', description: 'Combo 归零时自动复活，保留 50% Combo', price: 100, salePrice: 80, isWeeklyDeal: true, sortOrder: 1 },
  { id: 'item-skip', category: 'item', name: '跳题卡', description: '跳过当前题目，不扣 Combo', price: 50, salePrice: null, isWeeklyDeal: false, sortOrder: 2 },
  { id: 'item-double', category: 'item', name: '双倍积分卡', description: '下一题积分翻倍', price: 80, salePrice: 60, isWeeklyDeal: true, sortOrder: 3 },

  // ---- BGM ----
  { id: 'bgm-lofi', category: 'bgm', name: 'Lo-Fi 学习', description: '轻松的 Lo-Fi 节拍，适合沉浸式学习', price: 200, salePrice: null, isWeeklyDeal: false, sortOrder: 10 },
  { id: 'bgm-jazz', category: 'bgm', name: '爵士咖啡馆', description: '温暖的爵士旋律，下午茶般的答题体验', price: 200, salePrice: null, isWeeklyDeal: false, sortOrder: 11 },
  { id: 'bgm-electronic', category: 'bgm', name: '电子节拍', description: '动感电子乐，让答题更有节奏感', price: 250, salePrice: 200, isWeeklyDeal: true, sortOrder: 12 },
  { id: 'bgm-classical', category: 'bgm', name: '古典乐章', description: '巴赫与莫扎特陪伴你的学习时光', price: 200, salePrice: null, isWeeklyDeal: false, sortOrder: 13 },
  { id: 'bgm-nature', category: 'bgm', name: '自然之声', description: '雨声、海浪、森林 — 大自然的白噪音', price: 150, salePrice: null, isWeeklyDeal: false, sortOrder: 14 },

  // ---- 皮肤 ----
  { id: 'skin-neon', category: 'skin', name: '赛博霓虹', description: '紫蓝色调的未来感答题界面', price: 300, salePrice: null, isWeeklyDeal: false, sortOrder: 20 },
  { id: 'skin-ocean', category: 'skin', name: '深海之蓝', description: '深邃海洋色调，宁静而专注', price: 300, salePrice: 250, isWeeklyDeal: true, sortOrder: 21 },
  { id: 'skin-sunset', category: 'skin', name: '落日余晖', description: '温暖的橙金色调，如傍晚的阳光', price: 300, salePrice: null, isWeeklyDeal: false, sortOrder: 22 },
  { id: 'skin-forest', category: 'skin', name: '森林秘境', description: '翠绿色调，仿佛置身于魔法森林', price: 300, salePrice: null, isWeeklyDeal: false, sortOrder: 23 },

  // ---- 主题 ----
  { id: 'theme-space', category: 'theme', name: '星际漫游', description: '太空主题全套界面（含字体+图标+背景）', price: 500, salePrice: 400, isWeeklyDeal: true, sortOrder: 30 },
  { id: 'theme-pixel', category: 'theme', name: '像素复古', description: '8-bit 像素风格主题，满满复古情怀', price: 500, salePrice: null, isWeeklyDeal: false, sortOrder: 31 },
];

// 首购5折（BGM/皮肤各一次）
function calculatePrice(originalPrice: number, salePrice: number | null, isWeeklyDeal: boolean, isFirstPurchase: boolean): { finalPrice: number; discounts: string[] } {
  let price = salePrice || originalPrice;
  const discounts: string[] = [];

  if (salePrice && salePrice < originalPrice) {
    discounts.push(`每周特惠 -${originalPrice - salePrice}`);
  }

  if (isFirstPurchase) {
    const halfPrice = Math.floor(originalPrice / 2);
    if (halfPrice < price) {
      price = halfPrice;
      discounts.push('首购5折');
    }
  }

  return { finalPrice: price, discounts };
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  // 获取用户数据
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      totalPoints: true,
      firstBgmPurchase: true,
      firstSkinPurchase: true,
      firstShopEntryAt: true,
      bgmStyle: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }

  // 获取用户拥有的道具
  const inventory = await prisma.inventory.findMany({
    where: { userId },
  });

  // 构建商品列表（含拥有状态）
  const items = SHOP_ITEMS.map((item) => {
    const owned = inventory.some(
      (inv) =>
        (item.category === 'item' && inv.itemType === item.id.replace('item-', '') + '_card') ||
        (item.category === 'bgm' && user.bgmStyle === item.id) ||
        (item.category === 'skin' && false) || // 皮肤装备状态后续扩展
        (item.category === 'theme' && false)
    );

    const isFirstPurchase =
      (item.category === 'bgm' && !user.firstBgmPurchase) ||
      (item.category === 'skin' && !user.firstSkinPurchase);

    const { finalPrice, discounts } = calculatePrice(
      item.price,
      item.salePrice,
      item.isWeeklyDeal,
      isFirstPurchase
    );

    return {
      ...item,
      finalPrice,
      discounts,
      owned,
      equipped: item.category === 'bgm' ? user.bgmStyle === item.id : false,
    };
  });

  // 48h 首购倒计时
  let firstPurchaseDeadline: string | null = null;
  if (user.firstShopEntryAt) {
    const deadline = new Date(user.firstShopEntryAt);
    deadline.setHours(deadline.getHours() + 48);
    if (deadline > new Date()) {
      firstPurchaseDeadline = deadline.toISOString();
    }
  }

  return NextResponse.json({
    items,
    userPoints: user.totalPoints,
    firstBgmAvailable: !user.firstBgmPurchase,
    firstSkinAvailable: !user.firstSkinPurchase,
    firstPurchaseDeadline,
    inventory: inventory.map((inv) => ({
      itemType: inv.itemType,
      itemName: inv.itemName,
      quantity: inv.quantity,
      isActive: inv.isActive,
    })),
  });
}

// POST: 购买
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json({ error: '缺少商品ID' }, { status: 400 });
    }

    const shopItem = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!shopItem) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    // 获取用户数据
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalPoints: true,
        firstBgmPurchase: true,
        firstSkinPurchase: true,
        firstShopEntryAt: true,
        bgmStyle: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 检查首购
    const isFirstPurchase =
      (shopItem.category === 'bgm' && !user.firstBgmPurchase) ||
      (shopItem.category === 'skin' && !user.firstSkinPurchase);

    const { finalPrice } = calculatePrice(
      shopItem.price,
      shopItem.salePrice,
      shopItem.isWeeklyDeal,
      isFirstPurchase
    );

    // 检查积分
    if (user.totalPoints < finalPrice) {
      return NextResponse.json(
        { error: `积分不足！需要 ${finalPrice} 积分，当前 ${user.totalPoints} 积分` },
        { status: 400 }
      );
    }

    // 执行购买
    await prisma.$transaction(async (tx) => {
      // 扣积分
      await tx.user.update({
        where: { id: userId },
        data: {
          totalPoints: { decrement: finalPrice },
          // 更新首购状态
          ...(shopItem.category === 'bgm' && isFirstPurchase
            ? { firstBgmPurchase: true }
            : {}),
          ...(shopItem.category === 'skin' && isFirstPurchase
            ? { firstSkinPurchase: true }
            : {}),
          // 装备 BGM
          ...(shopItem.category === 'bgm'
            ? { bgmStyle: shopItem.id }
            : {}),
          // 首次进入商城时间
          ...(!user.firstShopEntryAt
            ? { firstShopEntryAt: new Date() }
            : {}),
        },
      });

      // 积分事件
      await tx.scoreEvent.create({
        data: {
          userId,
          type: 'purchase',
          amount: -finalPrice,
          balance: user.totalPoints - finalPrice,
          description: `购买 ${shopItem.name} · -${finalPrice}分`,
        },
      });

      // 道具类写入背包
      if (shopItem.category === 'item') {
        const itemType = shopItem.id.replace('item-', '') + '_card';
        await tx.inventory.upsert({
          where: { userId_itemType: { userId, itemType } },
          create: {
            userId,
            itemType,
            itemName: shopItem.name,
            quantity: 1,
          },
          update: {
            quantity: { increment: 1 },
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      itemName: shopItem.name,
      price: finalPrice,
      newBalance: user.totalPoints - finalPrice,
      discounts: calculatePrice(shopItem.price, shopItem.salePrice, shopItem.isWeeklyDeal, isFirstPurchase).discounts,
    });
  } catch (error) {
    console.error('购买失败:', error);
    return NextResponse.json(
      { error: '购买失败，请稍后重试' },
      { status: 500 }
    );
  }
}
