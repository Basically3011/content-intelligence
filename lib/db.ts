import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices
//
// Note: In Prisma 7, the database connection URL is configured in prisma/prisma.config.ts
// and automatically picked up by PrismaClient

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if we're in a build environment (no real database available)
const isBuildTime = process.env.DATABASE_URL?.includes('placeholder') ||
                    process.env.NEXT_PHASE === 'phase-production-build'

// Create a lazy-loading prisma client that only connects when actually used
function createPrismaClient() {
  if (isBuildTime) {
    // Return a proxy that throws helpful errors during build
    return new Proxy({} as PrismaClient, {
      get(target, prop) {
        if (prop === 'then' || prop === 'catch') return undefined
        throw new Error(`Database not available during build. Attempted to access: ${String(prop)}`)
      }
    })
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production' && !isBuildTime) {
  globalForPrisma.prisma = prisma
}

// Type exports for convenience
export type {
  content_inventory,
  content_persona_mapping,
  content_scoring
} from '@prisma/client'
