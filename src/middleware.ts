// Next.js 中间件 — 路由守卫
// 未登录用户重定向到 /auth

import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/auth',
  },
});

export const config = {
  matcher: [
    '/((?!api|_next|favicon.ico|.*\\.svg|auth|onboarding).*)',
  ],
};
