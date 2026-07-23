'use client';

// 积分商城页面 — 分类Tab + 商品卡片 + 购买弹窗 + 首购5折
// M5: 积分系统

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import AppLayout from '@/components/layout/AppLayout';

type ShopCategory = 'item' | 'bgm' | 'skin' | 'theme';

interface ShopProduct {
  id: string;
  category: ShopCategory;
  name: string;
  description: string;
  price: number;
  salePrice: number | null;
  isWeeklyDeal: boolean;
  finalPrice: number;
  discounts: string[];
  owned: boolean;
  equipped: boolean;
  sortOrder: number;
}

interface ShopData {
  items: ShopProduct[];
  userPoints: number;
  firstBgmAvailable: boolean;
  firstSkinAvailable: boolean;
  firstPurchaseDeadline: string | null;
  inventory: { itemType: string; itemName: string; quantity: number; isActive: boolean }[];
}

const CATEGORIES: { key: ShopCategory; label: string; icon: string }[] = [
  { key: 'item', label: '道具', icon: '🎒' },
  { key: 'bgm', label: 'BGM', icon: '🎵' },
  { key: 'skin', label: '皮肤', icon: '🎨' },
  { key: 'theme', label: '主题', icon: '🌟' },
];

export default function ShopPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ShopCategory>('item');
  const [buyingItem, setBuyingItem] = useState<ShopProduct | null>(null);
  const [purchaseResult, setPurchaseResult] = useState<{
    success: boolean;
    itemName: string;
    price: number;
    newBalance: number;
    discounts: string[];
  } | null>(null);

  const fetchShop = useCallback(async () => {
    try {
      const res = await fetch('/api/shop');
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (err) {
      console.error('获取商城数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchShop();
  }, [session, fetchShop]);

  const handleBuy = async () => {
    if (!buyingItem) return;

    try {
      const res = await fetch('/api/shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: buyingItem.id }),
      });

      const result = await res.json();

      if (res.ok) {
        setPurchaseResult({
          success: true,
          itemName: result.itemName,
          price: result.price,
          newBalance: result.newBalance,
          discounts: result.discounts,
        });
        fetchShop();
      } else {
        setPurchaseResult({
          success: false,
          itemName: buyingItem.name,
          price: buyingItem.finalPrice,
          newBalance: data?.userPoints || 0,
          discounts: [],
        });
      }
    } catch (err) {
      console.error('购买失败:', err);
      setPurchaseResult({
        success: false,
        itemName: buyingItem.name,
        price: buyingItem.finalPrice,
        newBalance: data?.userPoints || 0,
        discounts: [],
      });
    }
  };

  const closeModal = () => {
    setBuyingItem(null);
    setPurchaseResult(null);
  };

  const filteredItems = data?.items
    .filter((item) => item.category === activeCategory)
    .sort((a, b) => a.sortOrder - b.sortOrder) || [];

  // 格式化倒计时
  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const remaining = new Date(deadline).getTime() - Date.now();
    if (remaining <= 0) return null;
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}小时${minutes}分钟`;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-2xl px-4 pt-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-[var(--rhythm-bg-card)]" />
            <div className="h-64 rounded-2xl bg-[var(--rhythm-bg-card)]" />
          </div>
        </div>
      </AppLayout>
    );
  }

  const deadline = data ? formatDeadline(data.firstPurchaseDeadline) : null;

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl px-4 pt-8 pb-24">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-[var(--rhythm-neutral-50)]">🛒 积分商城</h2>
          <span className="rounded-full bg-[var(--rhythm-primary)]/15 px-4 py-2 text-sm font-semibold text-[var(--rhythm-primary-light)]">
            ⭐ {data?.userPoints.toLocaleString() || 0}
          </span>
        </div>

        {/* 首购提醒 */}
        {deadline && (
          <div className="mb-6 p-3 rounded-xl bg-[var(--rhythm-secondary)]/10 border border-[var(--rhythm-secondary)]/20 flex items-center gap-3">
            <span className="text-lg">⏰</span>
            <div>
              <p className="text-sm font-semibold text-[var(--rhythm-secondary)]">
                首购5折优惠 · 还剩 {deadline}
              </p>
              <p className="text-xs text-[var(--rhythm-neutral-400)]">
                首次购买 BGM 或皮肤各享 5 折优惠
              </p>
            </div>
          </div>
        )}

        {/* 分类Tab */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                transition-all duration-200
                ${activeCategory === cat.key
                  ? 'bg-[var(--rhythm-primary)] text-white shadow-lg shadow-[var(--rhythm-primary)]/25'
                  : 'bg-[var(--rhythm-bg-card)] text-[var(--rhythm-neutral-400)] hover:text-[var(--rhythm-neutral-200)] border border-[var(--rhythm-bg-border)]'
                }
              `}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* 商品网格 */}
        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`
                relative rounded-2xl border overflow-hidden transition-all duration-200
                ${item.owned
                  ? 'bg-[var(--rhythm-bg-card)]/50 border-[var(--rhythm-bg-border)] opacity-60'
                  : 'bg-[var(--rhythm-bg-card)] border-[var(--rhythm-bg-border)] hover:border-[var(--rhythm-primary)]/30 hover:shadow-lg hover:shadow-[var(--rhythm-primary)]/5 cursor-pointer'
                }
              `}
              onClick={() => !item.owned && setBuyingItem(item)}
            >
              {/* 特惠标签 */}
              {item.isWeeklyDeal && !item.owned && (
                <div className="absolute top-2 right-2 z-10">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--rhythm-warning)]/20 text-[var(--rhythm-warning)] border border-[var(--rhythm-warning)]/30">
                    特惠
                  </span>
                </div>
              )}

              {/* 首购标签 */}
              {item.discounts.includes('首购5折') && !item.owned && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--rhythm-secondary)]/20 text-[var(--rhythm-secondary)] border border-[var(--rhythm-secondary)]/30">
                    首购5折
                  </span>
                </div>
              )}

              {/* 已拥有 */}
              {item.owned && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20">
                  <span className="px-4 py-1.5 rounded-full bg-[var(--rhythm-primary)]/80 text-white text-sm font-bold backdrop-blur-sm">
                    {item.equipped ? '✅ 使用中' : '✓ 已拥有'}
                  </span>
                </div>
              )}

              <div className="p-4">
                {/* 图标 */}
                <div className="text-3xl mb-3">
                  {item.category === 'item' ? '🎒' :
                   item.category === 'bgm' ? '🎵' :
                   item.category === 'skin' ? '🎨' : '🌟'}
                </div>

                {/* 名称 */}
                <h3 className="text-sm font-bold text-[var(--rhythm-neutral-100)] mb-1">
                  {item.name}
                </h3>

                {/* 描述 */}
                <p className="text-xs text-[var(--rhythm-neutral-500)] mb-3 line-clamp-2">
                  {item.description}
                </p>

                {/* 价格 */}
                <div className="flex items-center gap-2">
                  {item.salePrice && item.salePrice < item.price ? (
                    <>
                      <span className="text-lg font-black font-[Orbitron] text-[var(--rhythm-warning)]">
                        ⭐{item.finalPrice}
                      </span>
                      <span className="text-xs text-[var(--rhythm-neutral-600)] line-through">
                        {item.price}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-black font-[Orbitron] text-[var(--rhythm-primary-light)]">
                      ⭐{item.finalPrice}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-2 py-12 text-center">
              <p className="text-[var(--rhythm-neutral-500)]">暂无商品</p>
            </div>
          )}
        </div>

        {/* 购买确认弹窗 */}
        {buyingItem && !purchaseResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
               onClick={closeModal}>
            <div
              className="w-full max-w-sm rounded-2xl bg-[var(--rhythm-bg-card)] border border-[var(--rhythm-bg-border)] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <span className="text-5xl">
                  {buyingItem.category === 'item' ? '🎒' :
                   buyingItem.category === 'bgm' ? '🎵' :
                   buyingItem.category === 'skin' ? '🎨' : '🌟'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-center text-[var(--rhythm-neutral-50)] mb-2">
                {buyingItem.name}
              </h3>
              <p className="text-sm text-center text-[var(--rhythm-neutral-400)] mb-6">
                {buyingItem.description}
              </p>

              {/* 价格明细 */}
              <div className="space-y-2 mb-6 p-4 rounded-xl bg-[var(--rhythm-bg-card)]/50 border border-[var(--rhythm-bg-border)]">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--rhythm-neutral-400)]">原价</span>
                  <span className="text-[var(--rhythm-neutral-300)]">⭐{buyingItem.price}</span>
                </div>
                {buyingItem.discounts.map((d, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-[var(--rhythm-secondary)]">{d}</span>
                    <span className="text-[var(--rhythm-secondary)]">
                      -{buyingItem.price - buyingItem.finalPrice}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-[var(--rhythm-bg-border)]">
                  <span className="text-[var(--rhythm-neutral-200)]">实付</span>
                  <span className="text-[var(--rhythm-warning)] font-[Orbitron]">⭐{buyingItem.finalPrice}</span>
                </div>
              </div>

              {/* 当前积分 */}
              <div className="flex justify-between text-sm mb-6 px-2">
                <span className="text-[var(--rhythm-neutral-400)]">当前积分</span>
                <span className="text-[var(--rhythm-primary-light)] font-bold">
                  ⭐{data?.userPoints.toLocaleString() || 0}
                </span>
              </div>

              {/* 按钮 */}
              <div className="flex gap-3">
                <button
                  className="flex-1 px-4 py-3 rounded-xl border border-[var(--rhythm-bg-border)] text-sm font-semibold text-[var(--rhythm-neutral-400)] hover:text-[var(--rhythm-neutral-200)] transition-colors"
                  onClick={closeModal}
                >
                  取消
                </button>
                <button
                  className="flex-1 px-4 py-3 rounded-xl bg-[var(--rhythm-primary)] text-white text-sm font-bold hover:bg-[var(--rhythm-primary)]/90 transition-colors disabled:opacity-40"
                  disabled={(data?.userPoints || 0) < buyingItem.finalPrice}
                  onClick={handleBuy}
                >
                  {(data?.userPoints || 0) < buyingItem.finalPrice ? '积分不足' : '确认购买'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 购买结果弹窗 */}
        {purchaseResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
               onClick={closeModal}>
            <div
              className="w-full max-w-sm rounded-2xl bg-[var(--rhythm-bg-card)] border border-[var(--rhythm-bg-border)] p-8 text-center shadow-2xl animate-fade-out-wobble"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-6xl mb-4">
                {purchaseResult.success ? '🎉' : '😢'}
              </div>
              <h3 className="text-xl font-bold text-[var(--rhythm-neutral-50)] mb-2">
                {purchaseResult.success ? '购买成功！' : '购买失败'}
              </h3>
              <p className="text-sm text-[var(--rhythm-neutral-400)] mb-6">
                {purchaseResult.success
                  ? `你成功购买了「${purchaseResult.itemName}」`
                  : '积分不足，请继续答题赚取积分'}
              </p>

              {purchaseResult.success && (
                <div className="space-y-2 mb-6 p-4 rounded-xl bg-[var(--rhythm-bg-card)]/50 border border-[var(--rhythm-bg-border)]">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--rhythm-neutral-400)]">消费</span>
                    <span className="text-[var(--rhythm-warning)] font-bold font-[Orbitron]">
                      -⭐{purchaseResult.price}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--rhythm-neutral-400)]">余额</span>
                    <span className="text-[var(--rhythm-primary-light)] font-bold">
                      ⭐{purchaseResult.newBalance.toLocaleString()}
                    </span>
                  </div>
                  {purchaseResult.discounts.map((d, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-[var(--rhythm-secondary)]">{d}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="w-full px-6 py-3 rounded-xl bg-[var(--rhythm-primary)] text-white text-sm font-bold hover:bg-[var(--rhythm-primary)]/90 transition-colors"
                onClick={closeModal}
              >
                好的
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
