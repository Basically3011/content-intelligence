import { prisma } from '@/lib/db'
import { ENABLED_LANGUAGE_CODES } from '@/lib/config/languages'

/**
 * Get unique personas for filtering with counts
 */
export async function getUniquePersonas() {
  const personasWithCounts = await prisma.content_persona_mapping.groupBy({
    by: ['persona_primary_label'],
    where: {
      persona_primary_label: { not: null },
    },
    _count: {
      persona_primary_label: true,
    },
  })

  return personasWithCounts
    .filter(p => {
      const label = p.persona_primary_label
      return label !== null &&
             label !== 'N/A' &&
             label !== 'null' &&
             label.trim() !== ''
    })
    .map(p => ({
      persona: p.persona_primary_label as string,
      count: p._count.persona_primary_label,
    }))
    .sort((a, b) => a.persona.localeCompare(b.persona))
}

/**
 * Get unique buying stages for filtering with counts
 */
export async function getUniqueBuyingStages() {
  const stagesWithCounts = await prisma.content_persona_mapping.groupBy({
    by: ['buying_stage'],
    where: {
      buying_stage: { not: null },
    },
    _count: {
      buying_stage: true,
    },
  })

  return stagesWithCounts
    .filter(s => s.buying_stage !== null)
    .map(s => ({
      stage: s.buying_stage as string,
      count: s._count.buying_stage,
    }))
}

/**
 * Get unique content types for filtering
 */
export async function getUniqueContentTypes() {
  const types = await prisma.content_inventory.findMany({
    where: {
      content_type_machine: { not: null },
    },
    select: {
      content_type_machine: true,
    },
    distinct: ['content_type_machine'],
    orderBy: {
      content_type_machine: 'asc',
    },
  })

  return types.map(t => t.content_type_machine).filter(Boolean) as string[]
}

/**
 * Get unique languages for filtering
 * Only returns enabled languages from config
 */
export async function getUniqueLanguages() {
  const languages = await prisma.content_inventory.findMany({
    where: {
      language: { in: ENABLED_LANGUAGE_CODES },
    },
    select: {
      language: true,
    },
    distinct: ['language'],
    orderBy: {
      language: 'asc',
    },
  })

  return languages.map(l => l.language)
}

/**
 * Get unique PDG stages (ann_stage) for filtering
 */
export async function getUniquePdgStages() {
  const stages = await prisma.content_inventory.findMany({
    where: {
      ann_stage: { not: null },
    },
    select: {
      ann_stage: true,
    },
    distinct: ['ann_stage'],
    orderBy: {
      ann_stage: 'asc',
    },
  })

  return stages.map(s => s.ann_stage).filter(Boolean) as string[]
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
    orderBy: {
      content_mix_category: 'asc',
    },
  })

  return categories.map(c => c.content_mix_category).filter(Boolean) as string[]
}

/**
 * Get all filter options in one call
 */
export async function getAllFilterOptions() {
  const [personas, stages, contentTypes, languages, pdgStages, contentMixCategories] = await Promise.all([
    getUniquePersonas(),
    getUniqueBuyingStages(),
    getUniqueContentTypes(),
    getUniqueLanguages(),
    getUniquePdgStages(),
    getUniqueContentMixCategories(),
  ])

  return {
    personas,
    stages,
    contentTypes,
    languages,
    pdgStages,
    contentMixCategories,
  }
}
