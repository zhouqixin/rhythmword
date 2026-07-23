import AppLayout from '@/components/layout/AppLayout';

export default function ProfilePage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl px-4 pt-8">
        <h2 className="text-2xl font-bold text-[var(--rhythm-neutral-50)]">👤 个人面板</h2>
        <div className="mt-8 rounded-2xl border border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-card)] p-8 text-center">
          <p className="text-[var(--rhythm-neutral-400)]">请先登录</p>
        </div>
      </div>
    </AppLayout>
  );
}
