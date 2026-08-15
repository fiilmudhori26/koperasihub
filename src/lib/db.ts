import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Postgres (Vercel/prod). Local dev uses the `main` branch (SQLite adapter).
function adapter() {
  const url = process.env.DATABASE_URL ?? "postgresql://localhost:5432/postgres";
  return new PrismaPg({ connectionString: url });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter: adapter() });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
