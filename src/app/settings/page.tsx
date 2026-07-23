import AppLayout from '@/components/layout/AppLayout';

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl px-4 pt-8">
        <h2 className="text-2xl font-bold text-[var(--rhythm-neutral-50)]">⚙️ 设置</h2>
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-card)] p-6">
            <h3 className="text-lg font-semibold text-[var(--rhythm-neutral-200)]">学习设置</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--rhythm-neutral-400)]">口音选择</span>
                <select className="rounded-lg border border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-elevated)] px-3 py-1.5 text-sm text-[var(--rhythm-neutral-200)] outline-none">
                  <option value="en-US">🇺🇸 美式</option>
                  <option value="en-GB">🇬🇧 英式</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--rhythm-neutral-400)]">难度等级</span>
                <select className="rounded-lg border border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-elevated)] px-3 py-1.5 text-sm text-[var(--rhythm-neutral-200)] outline-none">
                  <option value="easy">🟢 初级</option>
                  <option value="medium">🟡 中级</option>
                  <option value="hard">🔴 高级</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
