// Prisma 客户端单例
// 开发环境下热重载会导致多次实例化，使用 globalThis 缓存

import { PrismaClient } from '.prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
