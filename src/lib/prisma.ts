import { PrismaClient } from "@prisma/client";

/**
 * Vercel/Next builds may evaluate server components during `next build` (collect page data).
 * If DATABASE_URL isn't set (or Prisma can't initialize), importing prisma must not hard-crash
 * the build. We return a "safe" empty object in that case; callers that actually query should
 * already be wrapped in try/catch and can fall back gracefully.
 */
const prismaClientSingleton = () => {
  if (!process.env.DATABASE_URL) {
    // Keep builds alive even if DB isn't configured in build environment.
    console.warn("Prisma: DATABASE_URL is not set. Returning a disabled prisma client.");
    return {} as unknown as PrismaClient;
  }

  try {
    return new PrismaClient();
  } catch (err) {
    console.error("Prisma: failed to initialize PrismaClient. Returning disabled client.", err);
    return {} as unknown as PrismaClient;
  }
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;