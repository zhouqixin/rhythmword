// AuthLayout — 登录/注册/引导页布局
// 居中卡片式，无底部导航

'use client';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-extrabold tracking-wider text-[var(--rhythm-neutral-50)]">
            Rhythm<span className="text-[var(--rhythm-primary)]">Word</span>
          </h1>
          <p className="mt-2 text-sm text-[var(--rhythm-neutral-400)]">
            英语语境填空训练
          </p>
        </div>

        {/* 内容 */}
        {children}
      </div>
    </div>
  );
}
