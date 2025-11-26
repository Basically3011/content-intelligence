import { prisma } from '@/lib/db'
import { ContentFilters } from '@/lib/types'
import { ENABLED_LANGUAGE_CODES } from '@/lib/config/languages'

/**
 * Fetch content items with optional filters and pagination
 */
export async function getContentItems(
  filters?: ContentFilters,
  page = 1,
  limit = 20
) {
  const skip = (page - 1) * limit

  // Build where clause from filters
  const where = {
    // Exclude archived content
    cms_actions: { not: 'archive' },

    ...(filters?.search && {
      OR: [
        { title: { contains: filters.search, mode: 'insensitive' as const } },
        { topic: { contains: filters.search, mode: 'insensitive' as const } },
      ],
    }),
    ...(filters?.languages && filters.languages.length > 0 && {
      language: { in: filters.languages },
    }),
    ...(filters?.content_types && filters.content_types.length > 0 && {
      content_type_machine: { in: filters.content_types },
    }),
    ...(filters?.score_min && {
      seo_onpage_score: { gte: filters.score_min },
    }),
    ...(filters?.score_max && {
      seo_onpage_score: { lte: filters.score_max },
    }),

    // Content Status toggles
    ...(filters?.is_gated !== undefined && {
      is_content_gated: filters.is_gated,
    }),
    ...(filters?.is_nurture !== undefined && {
      is_nurture_content: filters.is_nurture,
    }),
    ...(filters?.is_pdg !== undefined && {
      is_pdg_program_content: filters.is_pdg,
    }),

    // CMS Status
    ...(filters?.is_published !== undefined && {
      cms_status: filters.is_published ? 'published' : { not: 'published' },
    }),

    // Quality Flags
    ...(filters?.has_low_content !== undefined && {
      seo_flag_low_content: filters.has_low_content,
    }),
    ...(filters?.has_low_readability !== undefined && {
      seo_flag_low_readability: filters.has_low_readability,
    }),
    ...(filters?.has_title_issues !== undefined && {
      seo_flag_title_issue: filters.has_title_issues,
    }),
    ...(filters?.has_url_issues !== undefined && {
      seo_flag_url_issue: filters.has_url_issues,
    }),

    // Date Range Filters
    ...(filters?.date_field && filters?.date_from && filters?.date_to && {
      [filters.date_field]: {
        gte: new Date(filters.date_from + 'T00:00:00Z'),
        lte: new Date(filters.date_to + 'T23:59:59Z'),
      },
    }),

    // PDG Stage Filters
    ...(filters?.pdg_stage_is_null && {
      ann_stage: null,
    }),
    ...(filters?.pdg_stage_is_not_null && !filters?.pdg_stage_is_null && {
      ann_stage: { not: null },
    }),
    ...(filters?.pdg_stages && filters.pdg_stages.length > 0 && !filters?.pdg_stage_is_null && !filters?.pdg_stage_is_not_null && {
      ann_stage: { in: filters.pdg_stages },
    }),

    // Content Mix Category Filters
    ...(filters?.content_mix_is_null && {
      content_mix_category: null,
    }),
    ...(filters?.content_mix_is_not_null && !filters?.content_mix_is_null && {
      content_mix_category: { not: null },
    }),
    ...(filters?.content_mix_categories && filters.content_mix_categories.length > 0 && !filters?.content_mix_is_null && !filters?.content_mix_is_not_null && {
      content_mix_category: { in: filters.content_mix_categories },
    }),
  }

  // Persona and buying stage filters need to go through the relation
  if (filters?.personas?.length || filters?.buying_stages?.length) {
    Object.assign(where, {
      content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping: {
        ...(filters?.personas?.length && {
          persona_primary_label: { in: filters.personas },
        }),
        ...(filters?.buying_stages?.length && {
          buying_stage: { in: filters.buying_stages },
        }),
      },
    })
  }

  // Score Range Filters - handled separately to construct proper OR conditions
  if (filters?.score_ranges && filters.score_ranges.length > 0) {
    const scoreOrConditions = filters.score_ranges.map(range => {
      if (range === 'not_scored') {
        // For not scored, check if scoring relation is null OR score_overall_weighted is null
        return {
          OR: [
            { active_scoring_id: null },
            {
              content_scoring_content_inventory_active_scoring_idTocontent_scoring: {
                score_overall_weighted: null
              }
            }
          ]
        }
      }

      let condition: any = {}
      if (range === 'poor') {
        condition = { gte: 0, lt: 2 }
      } else if (range === 'fair') {
        condition = { gte: 2, lt: 3 }
      } else if (range === 'good') {
        condition = { gte: 3 }
      }
      return {
        content_scoring_content_inventory_active_scoring_idTocontent_scoring: {
          score_overall_weighted: condition
        }
      }
    })

    // Wrap existing where conditions and score OR in an AND
    const existingWhere = { ...where }
    Object.assign(where, {
      AND: [
        existingWhere,
        { OR: scoreOrConditions }
      ]
    })
  }

  // Build orderBy clause
  let orderBy: any = { cms_updated_at: 'desc' } // Default sorting

  if (filters?.sort_by) {
    const sortField = filters.sort_by
    const sortOrder = filters.sort_order || 'desc'
    orderBy = { [sortField]: sortOrder }
  }

  const [items, total] = await Promise.all([
    prisma.content_inventory.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping: true,
        content_scoring_content_inventory_active_scoring_idTocontent_scoring: {
          select: {
            scoring_id: true,
            score_overall_weighted: true,
            score_clarity: true,
            score_conversion: true,
            score_relevance: true,
            score_structure: true,
            flag_is_wall_of_text: true,
            flag_has_transactional_cta: true,
            flag_has_mixed_pronouns: true,
            flag_is_company_centric: true,
            flag_has_case_study_metrics: true,
            audit_executive_summary: true,
            audit_primary_strengths: true,
            audit_critical_weaknesses: true,
            audit_recommendations: true,
          },
        },
      },
    }),
    prisma.content_inventory.count({ where }),
  ])

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Get a single content item by ID
 */
export async function getContentItemById(id: number) {
  return prisma.content_inventory.findUnique({
    where: { inventory_id: BigInt(id) },
    include: {
      content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping: true,
      content_scoring_content_inventory_active_scoring_idTocontent_scoring: true,
    },
  })
}

/**
 * Get content statistics
 */
export async function getContentStats() {
  const [total, published, avgScore] = await Promise.all([
    prisma.content_inventory.count(),
    prisma.content_inventory.count({
      where: { cms_status: 'published' },
    }),
    prisma.content_inventory.aggregate({
      _avg: { seo_onpage_score: true },
    }),
  ])

  return {
    total,
    published,
    avgScore: avgScore._avg.seo_onpage_score ? Number(avgScore._avg.seo_onpage_score) : 0,
  }
}

/**
 * Get Content Scoring statistics
 */
export async function getContentScoringStats() {
  const [avgScore, fairCount, poorCount] = await Promise.all([
    // Average overall weighted score
    prisma.content_scoring.aggregate({
      _avg: {
        score_overall_weighted: true,
      },
      where: {
        score_overall_weighted: { not: null },
      },
    }),
    // Assets with fair score (2-3)
    prisma.content_scoring.count({
      where: {
        score_overall_weighted: { gte: 2, lt: 3 },
      },
    }),
    // Assets with poor score (0-2)
    prisma.content_scoring.count({
      where: {
        score_overall_weighted: { gte: 0, lt: 2 },
      },
    }),
  ])

  return {
    avgScore: avgScore._avg.score_overall_weighted ? Number(avgScore._avg.score_overall_weighted) : 0,
    fairCount,
    poorCount,
  }
}

/**
 * Get SEO statistics (only for published content)
 */
export async function getSeoStats() {
  const [noTop10, top10Pages, top30Pages] = await Promise.all([
    // Assets without top10 ranking (published only)
    prisma.content_inventory.count({
      where: {
        cms_status: 'published',
        OR: [
          { seo_top10_keywords: 0 },
          { seo_top10_keywords: null },
        ],
      },
    }),
    // Pages with top10 ranking (published only)
    prisma.content_inventory.count({
      where: {
        cms_status: 'published',
        seo_top10_keywords: { gt: 0 },
      },
    }),
    // Pages with top30 ranking (published only)
    prisma.content_inventory.count({
      where: {
        cms_status: 'published',
        seo_top30_keywords: { gt: 0 },
      },
    }),
  ])

  return {
    noTop10,
    top10Pages,
    top30Pages,
  }
}

/**
 * Get Language Distribution statistics
 */
export async function getLanguageDistribution() {
  // Get all unique node_ids for published EN content (baseline)
  const enPublished = await prisma.content_inventory.findMany({
    where: {
      language: 'en',
      cms_status: 'published',
    },
    select: {
      node_id: true,
    },
  })

  const enNodeIds = enPublished.map(item => item.node_id).filter(Boolean)
  const enCount = enNodeIds.length

  // For each language, count how many of the EN node_ids exist in that language (published)
  const languages = ['en', 'de', 'fr', 'es', 'pt', 'ja']

  const results = await Promise.all(
    languages.map(async (lang) => {
      const count = await prisma.content_inventory.count({
        where: {
          language: lang,
          cms_status: 'published',
          node_id: { in: enNodeIds },
        },
      })

      return {
        language: lang.toUpperCase(),
        count,
        percentage: enCount > 0 ? Math.round((count / enCount) * 100) : 0,
      }
    })
  )

  return results
}

/**
 * Get coverage data for heatmap (personas x buying stages)
 */
export async function getCoverageData() {
  const mappings = await prisma.content_persona_mapping.findMany({
    where: {
      status: 'active',
    },
    select: {
      persona_primary_label: true,
      buying_stage: true,
    },
  })

  // Group by persona and stage
  const coverage: Record<string, Record<string, number>> = {}

  mappings.forEach((mapping) => {
    if (!mapping.persona_primary_label || !mapping.buying_stage) return

    if (!coverage[mapping.persona_primary_label]) {
      coverage[mapping.persona_primary_label] = {}
    }

    coverage[mapping.persona_primary_label][mapping.buying_stage] =
      (coverage[mapping.persona_primary_label][mapping.buying_stage] || 0) + 1
  })

  return coverage
}

/**
 * Get performance quadrant data
 */
export async function getPerformanceQuadrants() {
  const items = await prisma.content_inventory.findMany({
    where: {
      AND: [
        { seo_onpage_score: { not: null } },
        { active_scoring_id: { not: null } },
      ],
    },
    include: {
      content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping: {
        select: {
          persona_primary_label: true,
          buying_stage: true,
        },
      },
      content_scoring_content_inventory_active_scoring_idTocontent_scoring: {
        select: {
          score_overall_weighted: true,
          score_relevance: true,
        },
      },
    },
    take: 500, // Limit for performance
  })

  // Calculate median scores for quadrant thresholds
  const seoScores = items
    .map(i => i.seo_onpage_score ? Number(i.seo_onpage_score) : 0)
    .sort((a, b) => a - b)

  const qualityScores = items
    .map(i => i.content_scoring_content_inventory_active_scoring_idTocontent_scoring?.score_overall_weighted
      ? Number(i.content_scoring_content_inventory_active_scoring_idTocontent_scoring.score_overall_weighted)
      : 0)
    .sort((a, b) => a - b)

  const seoMedian = seoScores[Math.floor(seoScores.length / 2)] || 50
  const qualityMedian = qualityScores[Math.floor(qualityScores.length / 2)] || 50

  // Categorize items into quadrants
  const quadrants = {
    stars: items.filter(i => {
      const seo = i.seo_onpage_score ? Number(i.seo_onpage_score) : 0
      const quality = i.content_scoring_content_inventory_active_scoring_idTocontent_scoring?.score_overall_weighted
        ? Number(i.content_scoring_content_inventory_active_scoring_idTocontent_scoring.score_overall_weighted)
        : 0
      return seo >= seoMedian && quality >= qualityMedian
    }),
    rising: items.filter(i => {
      const seo = i.seo_onpage_score ? Number(i.seo_onpage_score) : 0
      const quality = i.content_scoring_content_inventory_active_scoring_idTocontent_scoring?.score_overall_weighted
        ? Number(i.content_scoring_content_inventory_active_scoring_idTocontent_scoring.score_overall_weighted)
        : 0
      return seo < seoMedian && quality >= qualityMedian
    }),
    hidden: items.filter(i => {
      const seo = i.seo_onpage_score ? Number(i.seo_onpage_score) : 0
      const quality = i.content_scoring_content_inventory_active_scoring_idTocontent_scoring?.score_overall_weighted
        ? Number(i.content_scoring_content_inventory_active_scoring_idTocontent_scoring.score_overall_weighted)
        : 0
      return seo >= seoMedian && quality < qualityMedian
    }),
    needswork: items.filter(i => {
      const seo = i.seo_onpage_score ? Number(i.seo_onpage_score) : 0
      const quality = i.content_scoring_content_inventory_active_scoring_idTocontent_scoring?.score_overall_weighted
        ? Number(i.content_scoring_content_inventory_active_scoring_idTocontent_scoring.score_overall_weighted)
        : 0
      return seo < seoMedian && quality < qualityMedian
    }),
  }

  return quadrants
}

/**
 * Get unique personas for filtering
 */
export async function getUniquePersonas() {
  const personas = await prisma.content_persona_mapping.findMany({
    where: {
      persona_primary_label: { not: null },
    },
    select: {
      persona_primary_label: true,
    },
    distinct: ['persona_primary_label'],
  })

  return personas.map(p => p.persona_primary_label).filter(Boolean) as string[]
}

/**
 * Get unique buying stages for filtering
 */
export async function getUniqueBuyingStages() {
  const stages = await prisma.content_persona_mapping.findMany({
    where: {
      buying_stage: { not: null },
    },
    select: {
      buying_stage: true,
    },
    distinct: ['buying_stage'],
  })

  return stages.map(s => s.buying_stage).filter(Boolean) as string[]
}

/**
 * Fetch content items for manual classification
 * Returns simplified data for classification table
 */
export async function getClassificationItems(
  filters?: Omit<ContentFilters, 'sort_by' | 'sort_order'> & {
    inventory_id?: string
    node_id?: string
    ann_stage?: string
    content_type_machine?: string
    content_type_inferred?: string
    content_type_inferred_is_null?: boolean
    content_type_inferred_is_not_null?: boolean
    content_mix_is_null?: boolean
    content_mix_is_not_null?: boolean
    content_mix_categories?: string[]
    cms_actions_is_null?: boolean
    cms_actions_is_not_null?: boolean
    cms_actions?: string[]
    sort_by?: 'node_id' | 'ann_stage' | 'language' | 'title' | 'persona' | 'stage' | 'content_type_machine' | 'content_mix_category' | 'cms_actions'
    sort_order?: 'asc' | 'desc'
  },
  page = 1,
  limit = 20
) {
  const skip = (page - 1) * limit

  // Build persona/stage filter (combine both into one object to avoid overwriting)
  const personaWhere: any = {}
  if (filters?.personas && filters.personas.length > 0) {
    personaWhere.persona_primary_label = { in: filters.personas }
  }
  if (filters?.buying_stages && filters.buying_stages.length > 0) {
    personaWhere.buying_stage = { in: filters.buying_stages }
  }

  // Content type inferred filters
  if (filters?.content_type_inferred_is_null) {
    personaWhere.content_type_inferred = null
  } else if (filters?.content_type_inferred_is_not_null) {
    personaWhere.content_type_inferred = { not: null }
  } else if (filters?.content_type_inferred) {
    personaWhere.content_type_inferred = { contains: filters.content_type_inferred, mode: 'insensitive' as const }
  }

  // Build where clause from filters
  const where: any = {
    // Only show published content
    cms_status: 'published',

    // Only show enabled languages
    language: filters?.languages && filters.languages.length > 0
      ? { in: filters.languages }
      : { in: ENABLED_LANGUAGE_CODES },

    ...(filters?.inventory_id && {
      inventory_id: { contains: filters.inventory_id, mode: 'insensitive' as const },
    }),
    ...(filters?.node_id && {
      node_id: { contains: filters.node_id, mode: 'insensitive' as const },
    }),
    ...(filters?.ann_stage && {
      ann_stage: { contains: filters.ann_stage, mode: 'insensitive' as const },
    }),
    ...(filters?.content_type_machine && {
      content_type_machine: { contains: filters.content_type_machine, mode: 'insensitive' as const },
    }),
    ...(filters?.is_pdg !== undefined && {
      is_pdg_program_content: filters.is_pdg,
    }),
    ...(Object.keys(personaWhere).length > 0 && {
      content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping: personaWhere,
    }),
  }

  // Content mix filters
  if (filters?.content_mix_is_null) {
    where.content_mix_category = null
  } else if (filters?.content_mix_is_not_null) {
    where.content_mix_category = { not: null }
  } else if (filters?.content_mix_categories && filters.content_mix_categories.length > 0) {
    where.content_mix_category = { in: filters.content_mix_categories }
  }

  // CMS Actions filters
  if (filters?.cms_actions_is_null) {
    where.cms_actions = null
  } else if (filters?.cms_actions_is_not_null) {
    where.cms_actions = { not: null }
  } else if (filters?.cms_actions && filters.cms_actions.length > 0) {
    where.cms_actions = { in: filters.cms_actions }
  }

  // Build orderBy clause
  let orderBy: any = { created_at: 'desc' }

  if (filters?.sort_by && filters?.sort_order) {
    switch (filters.sort_by) {
      case 'node_id':
        orderBy = { node_id: filters.sort_order }
        break
      case 'ann_stage':
        orderBy = { ann_stage: filters.sort_order }
        break
      case 'language':
        orderBy = { language: filters.sort_order }
        break
      case 'title':
        orderBy = { title: filters.sort_order }
        break
      case 'content_type_machine':
        orderBy = { content_type_machine: filters.sort_order }
        break
      case 'content_mix_category':
        orderBy = { content_mix_category: filters.sort_order }
        break
      case 'cms_actions':
        orderBy = { cms_actions: filters.sort_order }
        break
      case 'persona':
        orderBy = {
          content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping: {
            persona_primary_label: filters.sort_order
          }
        }
        break
      case 'stage':
        orderBy = {
          content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping: {
            buying_stage: filters.sort_order
          }
        }
        break
    }
  }

  // Fetch items with persona/stage data
  const [items, total] = await Promise.all([
    prisma.content_inventory.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: {
        inventory_id: true,
        node_id: true,
        ann_stage: true,
        language: true,
        title: true,
        url: true,
        content_type_machine: true,
        content_mix_category: true,
        cms_actions: true,
        is_pdg_program_content: true,
        is_content_gated: true,
        is_nurture_content: true,
        content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping: {
          select: {
            persona_primary_label: true,
            buying_stage: true,
            content_type_inferred: true,
            key_pain_point: true,
            rationale: true,
            model_name: true,
          },
        },
      },
    }),
    prisma.content_inventory.count({ where }),
  ])

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Get unique content mix categories for filtering
 */
export async function getUniqueContentMixCategories() {
  const categories = await prisma.content_inventory.findMany({
    where: {
      content_mix_category: { not: null },
    },
    select: {
      content_mix_category: true,
    },
    distinct: ['content_mix_category'],
  })

  return categories.map(c => c.content_mix_category).filter(Boolean) as string[]
}
