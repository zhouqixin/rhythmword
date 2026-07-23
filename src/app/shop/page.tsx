import AppLayout from '@/components/layout/AppLayout';

export default function ShopPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl px-4 pt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[var(--rhythm-neutral-50)]">🛒 积分商城</h2>
          <span className="rounded-full bg-[var(--rhythm-primary)]/15 px-4 py-2 text-sm font-semibold text-[var(--rhythm-primary-light)]">
            ⭐ 0
          </span>
        </div>
        <div className="mt-8 rounded-2xl border border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-card)] p-8 text-center">
          <p className="text-[var(--rhythm-neutral-400)]">商城即将上线，敬请期待！</p>
        </div>
      </div>
    </AppLayout>
  );
}
