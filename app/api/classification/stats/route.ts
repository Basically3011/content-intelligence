import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ENABLED_LANGUAGE_CODES } from '@/lib/config/languages'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Get the same filters as the main classification view
    const filters = {
      is_pdg: searchParams.get('is_pdg') === 'true' ? true : searchParams.get('is_pdg') === 'false' ? false : undefined,
    }

    // Build where clause
    const where: any = {
      cms_status: 'published',
      language: { in: ENABLED_LANGUAGE_CODES },
      ...(filters.is_pdg !== undefined && {
        is_pdg_program_content: filters.is_pdg,
      }),
    }

    // Get total count and classified count
    const [total, classified] = await Promise.all([
      prisma.content_inventory.count({ where }),
      prisma.content_inventory.count({
        where: {
          ...where,
          content_mix_category: { not: null },
        },
      }),
    ])

    const unclassified = total - classified
    const percentage = total > 0 ? Math.round((classified / total) * 100) : 0

    return NextResponse.json({
      total,
      classified,
      unclassified,
      percentage,
    })
  } catch (error) {
    console.error('Classification stats API error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch classification stats',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
