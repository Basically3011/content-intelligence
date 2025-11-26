import { prisma } from '@/lib/db'
import { ENABLED_LANGUAGE_CODES } from '@/lib/config/languages'

export interface CoverageCell {
  persona: string
  stage: string
  count: number
}

export interface CoverageMatrix {
  personas: string[]
  stages: string[]
  data: CoverageCell[]
}

export interface CoverageFilters {
  is_pdg?: boolean
  language?: string
  content_mix_categories?: string[]
  content_mix_is_null?: boolean
  content_mix_is_not_null?: boolean
}

/**
 * Get coverage heatmap data (Persona x Stage)
 * Filters on published content and enabled languages
 */
export async function getCoverageHeatmap(filters?: CoverageFilters): Promise<CoverageMatrix> {
  // First, get ALL personas and stages (unfiltered) to always show the complete matrix
  const allPersonasAndStages = await prisma.content_persona_mapping.findMany({
    where: {
      persona_primary_label: { not: null },
      buying_stage: { not: null },
      content_inventory_content_persona_mapping_inventory_idTocontent_inventory: {
        cms_status: 'published',
        language: { in: ENABLED_LANGUAGE_CODES },
        cms_actions: { not: 'archive' },
      }
    },
    select: {
      persona_primary_label: true,
      buying_stage: true,
    },
    distinct: ['persona_primary_label', 'buying_stage'],
  })

  // Build sets of all personas and stages
  const personasSet = new Set<string>()
  const stagesSet = new Set<string>()

  allPersonasAndStages.forEach((mapping) => {
    const persona = mapping.persona_primary_label
    const stage = mapping.buying_stage

    // Filter out null, N/A, "null", or empty values
    if (
      persona &&
      stage &&
      persona !== 'N/A' &&
      stage !== 'N/A' &&
      persona !== 'null' &&
      stage !== 'null' &&
      persona.trim() !== '' &&
      stage.trim() !== ''
    ) {
      personasSet.add(persona)
      stagesSet.add(stage)
    }
  })

  // Now build where clause for content_inventory with actual filters
  const inventoryWhere: any = {
    // Always filter on published content
    cms_status: 'published',

    // Always filter on enabled languages (unless specific language selected)
    language: filters?.language
      ? filters.language
      : { in: ENABLED_LANGUAGE_CODES },

    // Exclude archived content
    cms_actions: { not: 'archive' },
  }

  if (filters?.is_pdg !== undefined) {
    inventoryWhere.is_pdg_program_content = filters.is_pdg
  }

  // Content Mix Category filters
  if (filters?.content_mix_categories && filters.content_mix_categories.length > 0) {
    inventoryWhere.content_mix_category = { in: filters.content_mix_categories }
  } else if (filters?.content_mix_is_null) {
    inventoryWhere.content_mix_category = null
  } else if (filters?.content_mix_is_not_null) {
    inventoryWhere.content_mix_category = { not: null }
  }

  // Get filtered mappings for counting
  const mappings = await prisma.content_persona_mapping.findMany({
    where: {
      persona_primary_label: { not: null },
      buying_stage: { not: null },
      content_inventory_content_persona_mapping_inventory_idTocontent_inventory: inventoryWhere
    },
    select: {
      inventory_id: true,
      persona_primary_label: true,
      buying_stage: true,
    },
  })

  // Count unique assets per combination (not mapping counts)
  const countMap = new Map<string, Set<string>>()

  mappings.forEach((mapping) => {
    const persona = mapping.persona_primary_label
    const stage = mapping.buying_stage

    // Filter out null, N/A, "null", or empty values
    if (
      persona &&
      stage &&
      persona !== 'N/A' &&
      stage !== 'N/A' &&
      persona !== 'null' &&
      stage !== 'null' &&
      persona.trim() !== '' &&
      stage.trim() !== ''
    ) {
      const key = `${persona}|${stage}`
      if (!countMap.has(key)) {
        countMap.set(key, new Set<string>())
      }
      countMap.get(key)!.add(mapping.inventory_id)
    }
  })

  // Sort personas and stages
  const personas = Array.from(personasSet).sort()

  // Sort stages with primary stages first
  const primaryStages = ['Awareness', 'Explore', 'Evaluate', 'Decision']
  const stages = Array.from(stagesSet).sort((a, b) => {
    const aIndex = primaryStages.indexOf(a)
    const bIndex = primaryStages.indexOf(b)

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    return a.localeCompare(b)
  })

  // Build data array
  const data: CoverageCell[] = []
  personas.forEach((persona) => {
    stages.forEach((stage) => {
      const key = `${persona}|${stage}`
      const count = countMap.get(key)?.size || 0
      data.push({ persona, stage, count })
    })
  })

  return {
    personas,
    stages,
    data,
  }
}
