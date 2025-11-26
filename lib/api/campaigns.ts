import { prisma } from '@/lib/db'

/**
 * Get all campaigns
 */
export async function getCampaigns() {
  return prisma.campaign.findMany({
    include: {
      content_sequence: true,
    },
    orderBy: { created_at: 'desc' },
  })
}

/**
 * Get a single campaign with content
 */
export async function getCampaignById(id: string) {
  return prisma.campaign.findUnique({
    where: { id },
    include: {
      content_sequence: true,
    },
  })
}

/**
 * Create a new campaign
 */
export async function createCampaign(data: {
  name: string
  target_persona: string
  description?: string
}) {
  return prisma.campaign.create({
    data,
  })
}

/**
 * Add content to campaign
 */
export async function addContentToCampaign(
  campaignId: string,
  contentId: number,
  buyingStage: string,
  sequenceOrder: number
) {
  return prisma.campaignContent.create({
    data: {
      campaign_id: campaignId,
      content_id: contentId,
      buying_stage: buyingStage,
      sequence_order: sequenceOrder,
    },
  })
}
