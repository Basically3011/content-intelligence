import { NextRequest, NextResponse } from 'next/server'
import { getContentItems, getContentStats, getSeoStats, getContentScoringStats, getLanguageDistribution } from '@/lib/api/content'

// Helper to convert BigInt to string for JSON serialization
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj

  if (typeof obj === 'bigint') {
    return obj.toString()
  }

  if (obj instanceof Date) {
    return obj.toISOString()
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt)
  }

  if (typeof obj === 'object') {
    const result: any = {}
    for (const key in obj) {
      result[key] = serializeBigInt(obj[key])
    }
    return result
  }

  return obj
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')

    // Get stats
    if (action === 'stats') {
      const stats = await getContentStats()
      return NextResponse.json(stats)
    }

    // Get SEO stats
    if (action === 'seo-stats') {
      const seoStats = await getSeoStats()
      return NextResponse.json(seoStats)
    }

    // Get Content Scoring stats
    if (action === 'scoring-stats') {
      const scoringStats = await getContentScoringStats()
      return NextResponse.json(scoringStats)
    }

    // Get Language Distribution
    if (action === 'language-distribution') {
      const languageDistribution = await getLanguageDistribution()
      return NextResponse.json(languageDistribution)
    }

    // Get content items with filters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const sortBy = searchParams.get('sort_by')
    const sortOrder = searchParams.get('sort_order')

    const dateField = searchParams.get('date_field')

    const filters = {
      search: searchParams.get('search') || undefined,
      personas: searchParams.get('personas')?.split(',') || undefined,
      buying_stages: searchParams.get('buying_stages')?.split(',') || undefined,
      languages: searchParams.get('languages')?.split(',') || undefined,
      content_types: searchParams.get('content_types')?.split(',') || undefined,
      score_min: searchParams.get('score_min') ? parseFloat(searchParams.get('score_min')!) : undefined,
      score_max: searchParams.get('score_max') ? parseFloat(searchParams.get('score_max')!) : undefined,

      // Content Status toggles
      is_gated: searchParams.get('is_gated') === 'true' ? true : searchParams.get('is_gated') === 'false' ? false : undefined,
      is_nurture: searchParams.get('is_nurture') === 'true' ? true : searchParams.get('is_nurture') === 'false' ? false : undefined,
      is_pdg: searchParams.get('is_pdg') === 'true' ? true : searchParams.get('is_pdg') === 'false' ? false : undefined,

      // CMS Status
      is_published: searchParams.get('is_published') === 'true' ? true : searchParams.get('is_published') === 'false' ? false : undefined,

      // Quality Flags
      has_low_content: searchParams.get('has_low_content') === 'true' ? true : searchParams.get('has_low_content') === 'false' ? false : undefined,
      has_low_readability: searchParams.get('has_low_readability') === 'true' ? true : searchParams.get('has_low_readability') === 'false' ? false : undefined,
      has_title_issues: searchParams.get('has_title_issues') === 'true' ? true : searchParams.get('has_title_issues') === 'false' ? false : undefined,
      has_url_issues: searchParams.get('has_url_issues') === 'true' ? true : searchParams.get('has_url_issues') === 'false' ? false : undefined,

      // Date Range Filters
      date_field: (dateField === 'cms_created_at' || dateField === 'cms_updated_at') ? dateField as 'cms_created_at' | 'cms_updated_at' : undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,

      // PDG Stage Filters
      pdg_stages: searchParams.get('pdg_stages')?.split(',') || undefined,
      pdg_stage_is_null: searchParams.get('pdg_stage_is_null') === 'true' ? true : undefined,
      pdg_stage_is_not_null: searchParams.get('pdg_stage_is_not_null') === 'true' ? true : undefined,

      // Content Mix Category Filters
      content_mix_categories: searchParams.get('content_mix_categories')?.split(',') || undefined,
      content_mix_is_null: searchParams.get('content_mix_is_null') === 'true' ? true : undefined,
      content_mix_is_not_null: searchParams.get('content_mix_is_not_null') === 'true' ? true : undefined,

      // Score Range Filters
      score_ranges: searchParams.get('score_ranges')?.split(',') || undefined,

      // Sorting
      sort_by: (sortBy === 'cms_created_at' || sortBy === 'cms_updated_at') ? sortBy as 'cms_created_at' | 'cms_updated_at' : undefined,
      sort_order: (sortOrder === 'asc' || sortOrder === 'desc') ? sortOrder as 'asc' | 'desc' : undefined,
    }

    const result = await getContentItems(filters, page, limit)

    // Serialize BigInt values
    const serialized = serializeBigInt(result)

    return NextResponse.json(serialized)
  } catch (error) {
    console.error('Content API error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch content',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
