import { PrismaClient } from "@prisma/client";
import { databaseConfig } from "../../config/database.config.js";

// Global cache for development hot reloading
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseConfig.url,
      },
    },
    log: databaseConfig.logLevels,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

let dbConnected = false;

export async function connectDatabase(): Promise<boolean> {
  try {
    await prisma.$connect();
    dbConnected = true;
    return true;
  } catch {
    // Return false so server/app can handle unavailability without crashing test suites
    dbConnected = false;
    return false;
  }
}

export function isDatabaseConnected(): boolean {
  return dbConnected;
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  dbConnected = false;
}
