import { prisma } from '@/lib/db'
import { ENABLED_LANGUAGE_CODES } from '@/lib/config/languages'

export interface NurtureCoverageCell {
  persona: string
  stage: string
  count: number
}

export interface NurtureCoverageMatrix {
  personas: string[]
  stages: string[]
  data: NurtureCoverageCell[]
}

export interface NurtureCoverageFilters {
  language?: string
}

/**
 * Get nurture content coverage heatmap data (Persona x Stage)
 * Filters on published nurture content
 */
export async function getNurtureCoverageHeatmap(filters?: NurtureCoverageFilters): Promise<NurtureCoverageMatrix> {
  // Define the fixed buying stages
  const primaryStages = ['Awareness', 'Explore', 'Evaluate', 'Decision']

  // Get all valid personas from the entire dataset
  const allPersonas = await prisma.content_persona_mapping.findMany({
    where: {
      persona_primary_label: {
        not: null,
        notIn: ['N/A', 'null', ''],
      },
      buying_stage: {
        in: primaryStages,
      },
      content_inventory_content_persona_mapping_inventory_idTocontent_inventory: {
        cms_status: 'published',
        language: { in: ENABLED_LANGUAGE_CODES },
      }
    },
    select: {
      persona_primary_label: true,
    },
    distinct: ['persona_primary_label'],
  })

  const personasSet = new Set<string>()
  allPersonas.forEach((mapping) => {
    if (mapping.persona_primary_label && mapping.persona_primary_label.trim() !== '') {
      personasSet.add(mapping.persona_primary_label)
    }
  })

  // Build where clause for nurture content
  const inventoryWhere: any = {
    cms_status: 'published',
    is_nurture_content: true,
    language: filters?.language
      ? filters.language
      : { in: ENABLED_LANGUAGE_CODES },
  }

  // Get nurture content mappings
  const mappings = await prisma.content_persona_mapping.findMany({
    where: {
      persona_primary_label: {
        not: null,
        notIn: ['N/A', 'null', ''],
      },
      buying_stage: {
        in: primaryStages,
      },
      content_inventory_content_persona_mapping_inventory_idTocontent_inventory: inventoryWhere
    },
    select: {
      inventory_id: true,
      persona_primary_label: true,
      buying_stage: true,
    },
  })

  // Count unique assets per combination
  const countMap = new Map<string, Set<bigint>>()

  mappings.forEach((mapping) => {
    const persona = mapping.persona_primary_label
    const stage = mapping.buying_stage

    if (persona && stage && persona.trim() !== '') {
      const key = `${persona}|${stage}`
      if (!countMap.has(key)) {
        countMap.set(key, new Set<bigint>())
      }
      countMap.get(key)!.add(mapping.inventory_id)
    }
  })

  // Sort personas
  const personas = Array.from(personasSet).sort()

  // Build data array with all combinations (including zeros)
  const data: NurtureCoverageCell[] = []
  personas.forEach((persona) => {
    primaryStages.forEach((stage) => {
      const key = `${persona}|${stage}`
      const count = countMap.get(key)?.size || 0
      data.push({ persona, stage, count })
    })
  })

  return {
    personas,
    stages: primaryStages,
    data,
  }
}
