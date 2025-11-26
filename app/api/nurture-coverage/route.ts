import { NextResponse } from 'next/server'
import { getNurtureCoverageHeatmap, type NurtureCoverageFilters } from '@/lib/api/nurture-coverage'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const filters: NurtureCoverageFilters = {}

    // Language filter
    const language = searchParams.get('language')
    if (language) {
      filters.language = language
    }

    const coverage = await getNurtureCoverageHeatmap(filters)
    return NextResponse.json(coverage)
  } catch (error) {
    console.error('Nurture Coverage API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch nurture coverage data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
