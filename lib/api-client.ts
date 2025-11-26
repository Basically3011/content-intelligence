/**
 * Frontend API client for fetching data
 */

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export interface ContentStats {
  total: number
  published: number
  avgScore: number
}

export interface SeoStats {
  noTop10: number
  top10Pages: number
  top30Pages: number
}

export interface ContentScoringStats {
  avgScore: number
  fairCount: number
  poorCount: number
}

export interface ContentItem {
  inventory_id: string
  title: string | null
  url: string
  language: string
  content_type_machine: string | null
  seo_onpage_score: string | null
  cms_status: string | null
  cms_created_at: string | null
  cms_updated_at: string | null
  is_pdg_program_content: boolean | null
  is_content_gated: boolean | null
  is_nurture_content: boolean | null
  ann_stage: string | null
  serial_number: string | null
  ann_products: string[]
  ann_solutions: string[]
  ann_conversation_tracks: string[]
  content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping?: {
    persona_primary_label: string | null
    buying_stage: string | null
  } | null
  content_scoring_content_inventory_active_scoring_idTocontent_scoring?: {
    score_overall_weighted: string | null
    score_clarity: string | null
    score_conversion: string | null
    score_relevance: string | null
    score_structure: string | null
    flag_is_wall_of_text: boolean | null
    flag_has_transactional_cta: boolean | null
    flag_has_mixed_pronouns: boolean | null
    flag_is_company_centric: boolean | null
    flag_has_case_study_metrics: boolean | null
    audit_executive_summary: string | null
    audit_primary_strengths: any | null
    audit_critical_weaknesses: any | null
    audit_recommendations: any | null
  } | null
}

export interface ContentListResponse {
  items: ContentItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface HealthCheck {
  status: 'ok' | 'error'
  database: 'connected' | 'disconnected'
  tables?: {
    content_inventory: number
    content_persona_mapping: number
    content_scoring: number
  }
  timestamp: string
}

/**
 * Fetch content statistics
 */
export async function fetchContentStats(): Promise<ContentStats> {
  const response = await fetch(`${API_BASE}/api/content?action=stats`)

  if (!response.ok) {
    throw new Error('Failed to fetch content stats')
  }

  return response.json()
}

/**
 * Fetch SEO statistics
 */
export async function fetchSeoStats(): Promise<SeoStats> {
  const response = await fetch(`${API_BASE}/api/content?action=seo-stats`)

  if (!response.ok) {
    throw new Error('Failed to fetch SEO stats')
  }

  return response.json()
}

/**
 * Fetch Content Scoring statistics
 */
export async function fetchContentScoringStats(): Promise<ContentScoringStats> {
  const response = await fetch(`${API_BASE}/api/content?action=scoring-stats`)

  if (!response.ok) {
    throw new Error('Failed to fetch content scoring stats')
  }

  return response.json()
}

export interface LanguageDistribution {
  language: string
  count: number
  percentage: number
}

/**
 * Fetch Language Distribution
 */
export async function fetchLanguageDistribution(): Promise<LanguageDistribution[]> {
  const response = await fetch(`${API_BASE}/api/content?action=language-distribution`)

  if (!response.ok) {
    throw new Error('Failed to fetch language distribution')
  }

  return response.json()
}

/**
 * Fetch content items with filters
 */
export async function fetchContentItems(params: {
  page?: number
  limit?: number
  search?: string
  personas?: string[]
  buying_stages?: string[]
  content_types?: string[]
  languages?: string[]

  // Content Status toggles
  is_gated?: boolean
  is_nurture?: boolean
  is_pdg?: boolean

  // CMS Status
  is_published?: boolean

  // Quality Flags
  has_low_content?: boolean
  has_low_readability?: boolean
  has_title_issues?: boolean
  has_url_issues?: boolean

  // PDG Stage Filters
  pdg_stages?: string[]
  pdg_stage_is_null?: boolean
  pdg_stage_is_not_null?: boolean

  // Score Range Filters
  score_ranges?: string[]

  // Content Mix Category Filters
  content_mix_categories?: string[]
  content_mix_is_null?: boolean
  content_mix_is_not_null?: boolean

  // Date Range Filters
  date_field?: 'cms_created_at' | 'cms_updated_at'
  date_from?: string
  date_to?: string

  // Sorting
  sort_by?: 'cms_created_at' | 'cms_updated_at'
  sort_order?: 'asc' | 'desc'
}): Promise<ContentListResponse> {
  const searchParams = new URLSearchParams()

  if (params.page) searchParams.set('page', params.page.toString())
  if (params.limit) searchParams.set('limit', params.limit.toString())
  if (params.search) searchParams.set('search', params.search)
  if (params.personas?.length) searchParams.set('personas', params.personas.join(','))
  if (params.buying_stages?.length) searchParams.set('buying_stages', params.buying_stages.join(','))
  if (params.content_types?.length) searchParams.set('content_types', params.content_types.join(','))
  if (params.languages?.length) searchParams.set('languages', params.languages.join(','))

  // Content Status toggles
  if (params.is_gated !== undefined) searchParams.set('is_gated', params.is_gated.toString())
  if (params.is_nurture !== undefined) searchParams.set('is_nurture', params.is_nurture.toString())
  if (params.is_pdg !== undefined) searchParams.set('is_pdg', params.is_pdg.toString())

  // CMS Status
  if (params.is_published !== undefined) searchParams.set('is_published', params.is_published.toString())

  // Quality Flags
  if (params.has_low_content !== undefined) searchParams.set('has_low_content', params.has_low_content.toString())
  if (params.has_low_readability !== undefined) searchParams.set('has_low_readability', params.has_low_readability.toString())
  if (params.has_title_issues !== undefined) searchParams.set('has_title_issues', params.has_title_issues.toString())
  if (params.has_url_issues !== undefined) searchParams.set('has_url_issues', params.has_url_issues.toString())

  // PDG Stage Filters
  if (params.pdg_stages?.length) searchParams.set('pdg_stages', params.pdg_stages.join(','))
  if (params.pdg_stage_is_null !== undefined) searchParams.set('pdg_stage_is_null', params.pdg_stage_is_null.toString())
  if (params.pdg_stage_is_not_null !== undefined) searchParams.set('pdg_stage_is_not_null', params.pdg_stage_is_not_null.toString())

  // Score Range Filters
  if (params.score_ranges?.length) searchParams.set('score_ranges', params.score_ranges.join(','))

  // Content Mix Category Filters
  if (params.content_mix_categories?.length) searchParams.set('content_mix_categories', params.content_mix_categories.join(','))
  if (params.content_mix_is_null !== undefined) searchParams.set('content_mix_is_null', params.content_mix_is_null.toString())
  if (params.content_mix_is_not_null !== undefined) searchParams.set('content_mix_is_not_null', params.content_mix_is_not_null.toString())

  // Date Range Filters
  if (params.date_field) searchParams.set('date_field', params.date_field)
  if (params.date_from) searchParams.set('date_from', params.date_from)
  if (params.date_to) searchParams.set('date_to', params.date_to)

  // Sorting
  if (params.sort_by) searchParams.set('sort_by', params.sort_by)
  if (params.sort_order) searchParams.set('sort_order', params.sort_order)

  const response = await fetch(`${API_BASE}/api/content?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to fetch content items')
  }

  return response.json()
}

/**
 * Fetch health check
 */
export async function fetchHealthCheck(): Promise<HealthCheck> {
  const response = await fetch(`${API_BASE}/api/health`)

  if (!response.ok) {
    throw new Error('Health check failed')
  }

  return response.json()
}

/**
 * Calculate coverage percentage (for dashboard)
 */
export async function fetchCoveragePercentage(): Promise<number> {
  try {
    const stats = await fetchContentStats()

    // Rough coverage calculation
    // Assuming we want coverage across personas and stages
    // This is a simplified calculation - can be enhanced
    const targetCoverage = 100 // 100% would mean all persona/stage combinations have content
    const coverageEstimate = Math.min(100, (stats.published / 1500) * 100) // Rough estimate

    return Math.round(coverageEstimate)
  } catch {
    return 0
  }
}

/**
 * Identify gaps count (for dashboard)
 */
export async function fetchGapsCount(): Promise<number> {
  // This would ideally come from a dedicated gaps API endpoint
  // For now, we'll estimate based on content distribution
  try {
    const stats = await fetchContentStats()

    // Rough gap estimation - inverse of coverage
    const estimatedGaps = Math.max(0, Math.round((1500 - stats.published) / 50))

    return estimatedGaps
  } catch {
    return 0
  }
}

/**
 * Filter Options
 */
export interface StageWithCount {
  stage: string
  count: number
}

export interface PersonaWithCount {
  persona: string
  count: number
}

export interface FilterOptions {
  personas: PersonaWithCount[]
  stages: StageWithCount[]
  contentTypes: string[]
  languages: string[]
  pdgStages: string[]
}

/**
 * Fetch filter options
 */
export async function fetchFilterOptions(): Promise<FilterOptions> {
  const response = await fetch(`${API_BASE}/api/filters`)

  if (!response.ok) {
    throw new Error('Failed to fetch filter options')
  }

  return response.json()
}
