import { NextRequest, NextResponse } from 'next/server'
import { getClassificationItems } from '@/lib/api/content'

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

    // Get content items with filters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const filters = {
      inventory_id: searchParams.get('inventory_id') || undefined,
      node_id: searchParams.get('node_id') || undefined,
      ann_stage: searchParams.get('ann_stage') || undefined,
      content_type_machine: searchParams.get('content_type_machine') || undefined,
      content_type_inferred: searchParams.get('content_type_inferred') || undefined,
      content_type_inferred_is_null: searchParams.get('content_type_inferred_is_null') === 'true' ? true : undefined,
      content_type_inferred_is_not_null: searchParams.get('content_type_inferred_is_not_null') === 'true' ? true : undefined,
      personas: searchParams.get('personas')?.split(',') || undefined,
      buying_stages: searchParams.get('buying_stages')?.split(',') || undefined,
      languages: searchParams.get('languages')?.split(',') || undefined,

      // PDG filter
      is_pdg: searchParams.get('is_pdg') === 'true' ? true : searchParams.get('is_pdg') === 'false' ? false : undefined,

      // Content mix filters
      content_mix_is_null: searchParams.get('content_mix_is_null') === 'true' ? true : undefined,
      content_mix_is_not_null: searchParams.get('content_mix_is_not_null') === 'true' ? true : undefined,
      content_mix_categories: searchParams.get('content_mix_categories')?.split(',') || undefined,

      // CMS Actions filters
      cms_actions_is_null: searchParams.get('cms_actions_is_null') === 'true' ? true : undefined,
      cms_actions_is_not_null: searchParams.get('cms_actions_is_not_null') === 'true' ? true : undefined,
      cms_actions: searchParams.get('cms_actions')?.split(',') || undefined,

      // Sorting
      sort_by: searchParams.get('sort_by') as 'node_id' | 'ann_stage' | 'language' | 'title' | 'persona' | 'stage' | 'content_type_machine' | 'content_mix_category' | undefined,
      sort_order: searchParams.get('sort_order') as 'asc' | 'desc' | undefined,
    }

    const result = await getClassificationItems(filters, page, limit)

    // Serialize BigInt values
    const serialized = serializeBigInt(result)

    return NextResponse.json(serialized)
  } catch (error) {
    console.error('Classification API error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch classification data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
