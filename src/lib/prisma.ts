import { PrismaClient } from "@prisma/client";

/**
 * PrismaClient can be instantiated even without DATABASE_URL - it just won't connect.
 * During build, Next.js may try to execute server components, but all our Prisma queries
 * are wrapped in try/catch blocks, so connection errors are handled gracefully.
 */
const prismaClientSingleton = () => {
  // Always return a real PrismaClient instance.
  // If DATABASE_URL is missing, Prisma will throw when you try to query,
  // but that's fine because all our queries are wrapped in try/catch.
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;