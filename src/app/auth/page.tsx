import AuthLayout from '@/components/layout/AuthLayout';

export default function AuthPage() {
  return (
    <AuthLayout>
      <div className="space-y-4">
        <input
          type="email"
          placeholder="邮箱地址"
          className="w-full rounded-xl border border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-card)] px-4 py-3 text-[var(--rhythm-neutral-200)] placeholder:text-[var(--rhythm-neutral-600)] focus:border-[var(--rhythm-primary-light)] focus:ring-2 focus:ring-[var(--rhythm-primary)]/30 transition-colors outline-none"
        />
        <input
          type="password"
          placeholder="密码"
          className="w-full rounded-xl border border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-card)] px-4 py-3 text-[var(--rhythm-neutral-200)] placeholder:text-[var(--rhythm-neutral-600)] focus:border-[var(--rhythm-primary-light)] focus:ring-2 focus:ring-[var(--rhythm-primary)]/30 transition-colors outline-none"
        />
        <button className="w-full rounded-xl bg-[var(--rhythm-primary)] px-6 py-3 font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97]">
          登录
        </button>
        <p className="text-center text-sm text-[var(--rhythm-neutral-400)]">
          没有账号？<a href="#" className="text-[var(--rhythm-primary-light)] hover:underline">立即注册</a>
        </p>
      </div>
    </AuthLayout>
  );
}
