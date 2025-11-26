import { prisma } from '@/lib/db'

/**
 * Get all content gaps with optional filters
 */
export async function getContentGaps(status?: string) {
  return prisma.contentGap.findMany({
    where: status ? { status } : undefined,
    orderBy: [
      { priority: 'desc' },
      { impact_score: 'desc' },
    ],
  })
}

/**
 * Create a new content gap
 */
export async function createContentGap(data: {
  persona: string
  buying_stage: string
  priority: string
  impact_score: number
  missing_content_types: string[]
}) {
  return prisma.contentGap.create({
    data,
  })
}

/**
 * Update gap status
 */
export async function updateGapStatus(id: number, status: string) {
  return prisma.contentGap.update({
    where: { id },
    data: { status },
  })
}
