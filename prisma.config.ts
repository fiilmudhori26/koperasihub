import { defineConfig } from "@prisma/config";

// Prisma 7: connection URL lives here (not in schema.prisma).
export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    // Seed runs automatically after migrations are applied.
    seed: "tsx prisma/seed.ts",
  },
});
