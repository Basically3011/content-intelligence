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

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Type exports for convenience
export type {
  content_inventory,
  content_persona_mapping,
  content_scoring
} from '@prisma/client'
