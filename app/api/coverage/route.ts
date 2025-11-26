import { NextResponse } from 'next/server'
import { getCoverageHeatmap, type CoverageFilters } from '@/lib/api/coverage'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const filters: CoverageFilters = {}

    // PDG filter
    const isPdg = searchParams.get('is_pdg')
    if (isPdg !== null) {
      filters.is_pdg = isPdg === 'true'
    }

    // Language filter
    const language = searchParams.get('language')
    if (language) {
      filters.language = language
    }

    // Content Mix Category filters
    const contentMixCategories = searchParams.get('content_mix_categories')
    if (contentMixCategories) {
      filters.content_mix_categories = contentMixCategories.split(',')
    }

    const contentMixIsNull = searchParams.get('content_mix_is_null')
    if (contentMixIsNull === 'true') {
      filters.content_mix_is_null = true
    }

    const contentMixIsNotNull = searchParams.get('content_mix_is_not_null')
    if (contentMixIsNotNull === 'true') {
      filters.content_mix_is_not_null = true
    }

    const coverage = await getCoverageHeatmap(filters)
    return NextResponse.json(coverage)
  } catch (error) {
    console.error('Coverage API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch coverage data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
