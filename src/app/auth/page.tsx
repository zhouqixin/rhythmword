'use client';

// 登录/注册页面
// Tab 切换式表单，邮箱 + 密码，含忘记密码入口

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import AuthLayout from '@/components/layout/AuthLayout';

type TabType = 'login' | 'register';

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabType>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 表单校验
  const validate = (): string | null => {
    if (!email.trim()) return '请输入邮箱';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return '邮箱格式不正确';
    if (!password) return '请输入密码';
    if (password.length < 6) return '密码至少需要 6 位';
    if (tab === 'register') {
      if (!confirmPassword) return '请确认密码';
      if (password !== confirmPassword) return '两次密码不一致';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);

    try {
      if (tab === 'register') {
        // 注册
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || '注册失败');
          setLoading(false);
          return;
        }

        toast.success('注册成功！正在登录...');
      }

      // 登录
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
        setLoading(false);
        return;
      }

      // 检查是否需要引导
      const profileRes = await fetch('/api/user/profile');
      const profileData = await profileRes.json();

      toast.success(`欢迎回来！`);

      if (profileData?.user?.isOnboarded) {
        router.push('/');
      } else {
        router.push('/onboarding');
      }

      router.refresh();
    } catch {
      toast.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Tab 切换 */}
      <div className="mb-6 flex rounded-xl bg-[var(--rhythm-bg-card)] p-1">
        <button
          onClick={() => setTab('login')}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            tab === 'login'
              ? 'bg-[var(--rhythm-primary)] text-white shadow-lg'
              : 'text-[var(--rhythm-neutral-400)] hover:text-[var(--rhythm-neutral-200)]'
          }`}
        >
          登录
        </button>
        <button
          onClick={() => setTab('register')}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            tab === 'register'
              ? 'bg-[var(--rhythm-primary)] text-white shadow-lg'
              : 'text-[var(--rhythm-neutral-400)] hover:text-[var(--rhythm-neutral-200)]'
          }`}
        >
          注册
        </button>
      </div>

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 注册时显示昵称 */}
        {tab === 'register' && (
          <div>
            <label className="mb-1.5 block text-sm text-[var(--rhythm-neutral-400)]">
              昵称（选填）
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="你的昵称"
              className="w-full rounded-xl border border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-card)] px-4 py-3 text-[var(--rhythm-neutral-200)] placeholder:text-[var(--rhythm-neutral-600)] transition-colors outline-none focus:border-[var(--rhythm-primary-light)] focus:ring-2 focus:ring-[var(--rhythm-primary)]/30"
            />
          </div>
        )}

        {/* 邮箱 */}
        <div>
          <label className="mb-1.5 block text-sm text-[var(--rhythm-neutral-400)]">
            邮箱地址
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            autoComplete="email"
            className="w-full rounded-xl border border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-card)] px-4 py-3 text-[var(--rhythm-neutral-200)] placeholder:text-[var(--rhythm-neutral-600)] transition-colors outline-none focus:border-[var(--rhythm-primary-light)] focus:ring-2 focus:ring-[var(--rhythm-primary)]/30"
          />
        </div>

        {/* 密码 */}
        <div>
          <label className="mb-1.5 block text-sm text-[var(--rhythm-neutral-400)]">
            密码
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="至少 6 位密码"
            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            className="w-full rounded-xl border border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-card)] px-4 py-3 text-[var(--rhythm-neutral-200)] placeholder:text-[var(--rhythm-neutral-600)] transition-colors outline-none focus:border-[var(--rhythm-primary-light)] focus:ring-2 focus:ring-[var(--rhythm-primary)]/30"
          />
        </div>

        {/* 注册时确认密码 */}
        {tab === 'register' && (
          <div>
            <label className="mb-1.5 block text-sm text-[var(--rhythm-neutral-400)]">
              确认密码
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次输入密码"
              autoComplete="new-password"
              className="w-full rounded-xl border border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-card)] px-4 py-3 text-[var(--rhythm-neutral-200)] placeholder:text-[var(--rhythm-neutral-600)] transition-colors outline-none focus:border-[var(--rhythm-primary-light)] focus:ring-2 focus:ring-[var(--rhythm-primary)]/30"
            />
          </div>
        )}

        {/* 忘记密码 */}
        {tab === 'login' && (
          <div className="text-right">
            <button
              type="button"
              className="text-xs text-[var(--rhythm-neutral-400)] transition-colors hover:text-[var(--rhythm-primary-light)]"
              onClick={() => toast.info('忘记密码功能将在后续版本上线')}
            >
              忘记密码？
            </button>
          </div>
        )}

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[var(--rhythm-primary)] px-6 py-3 font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4" fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {tab === 'login' ? '登录中...' : '注册中...'}
            </span>
          ) : (
            tab === 'login' ? '登录' : '注册'
          )}
        </button>
      </form>

      {/* 底部切换提示 */}
      <p className="mt-6 text-center text-sm text-[var(--rhythm-neutral-400)]">
        {tab === 'login' ? (
          <>
            没有账号？
            <button
              type="button"
              onClick={() => setTab('register')}
              className="ml-1 text-[var(--rhythm-primary-light)] transition-colors hover:underline"
            >
              立即注册
            </button>
          </>
        ) : (
          <>
            已有账号？
            <button
              type="button"
              onClick={() => setTab('login')}
              className="ml-1 text-[var(--rhythm-primary-light)] transition-colors hover:underline"
            >
              去登录
            </button>
          </>
        )}
      </p>
    </AuthLayout>
  );
}
