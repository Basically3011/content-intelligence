import { prisma } from '@/lib/db'

/**
 * Get all recommendations
 */
export async function getRecommendations(status?: string) {
  return prisma.recommendation.findMany({
    where: status ? { status } : undefined,
    orderBy: [
      { priority: 'desc' },
      { created_at: 'desc' },
    ],
  })
}

/**
 * Create a new recommendation
 */
export async function createRecommendation(data: {
  title: string
  description: string
  priority: string
  effort: string
  impact: string
  reasoning: string
  action_items: string[]
}) {
  return prisma.recommendation.create({
    data,
  })
}

/**
 * Update recommendation status
 */
export async function updateRecommendationStatus(id: string, status: string) {
  return prisma.recommendation.update({
    where: { id },
    data: { status },
  })
}
