// 全局根布局
// 暗色主题 + 字体加载 + Toaster

import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'RhythmWord · 英语语境填空训练',
  description: '听音 + 首字母提示 + 补全单词 + 节拍挑战 + 积分激励 — 让英语学习像演奏音乐一样自然',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="min-h-screen bg-[var(--rhythm-bg-deep)] text-[var(--rhythm-neutral-200)]">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'var(--rhythm-bg-elevated)',
              color: 'var(--rhythm-neutral-200)',
              border: '1px solid var(--rhythm-bg-border)',
            },
          }}
        />
      </body>
    </html>
  );
}
