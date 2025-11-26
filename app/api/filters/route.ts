import { NextResponse } from 'next/server'
import { getAllFilterOptions } from '@/lib/api/filters'

export async function GET() {
  try {
    const options = await getAllFilterOptions()

    return NextResponse.json(options)
  } catch (error) {
    console.error('Filters API error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch filter options',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
