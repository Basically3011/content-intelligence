import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface UpdateRequest {
  inventoryIds: string[]
  category?: string
  cmsAction?: string
  source?: string
  assignedBy?: string
}

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

export async function PATCH(request: NextRequest) {
  try {
    const body: UpdateRequest = await request.json()
    const { inventoryIds, category, cmsAction, source = 'manual', assignedBy = 'Bernhard' } = body

    // Validate required fields
    if (!inventoryIds || !Array.isArray(inventoryIds) || inventoryIds.length === 0) {
      return NextResponse.json(
        { error: 'inventoryIds is required and must be a non-empty array' },
        { status: 400 }
      )
    }

    if (!category && !cmsAction) {
      return NextResponse.json(
        { error: 'Either category or cmsAction must be provided' },
        { status: 400 }
      )
    }

    // Build dynamic update data
    const updateData: any = {}

    if (category) {
      updateData.content_mix_category = category
      updateData.content_mix_source = source
      updateData.content_mix_assigned_by = assignedBy
      updateData.content_mix_assigned_at = new Date()
    }

    if (cmsAction) {
      updateData.cms_actions = cmsAction
      updateData.cms_actions_updated_at = new Date()
    }

    // Update all items in a transaction
    const updateResult = await prisma.content_inventory.updateMany({
      where: {
        inventory_id: {
          in: inventoryIds,
        },
      },
      data: updateData,
    })

    // Fetch the updated items to return them
    const updatedItems = await prisma.content_inventory.findMany({
      where: {
        inventory_id: {
          in: inventoryIds,
        },
      },
      select: {
        inventory_id: true,
        node_id: true,
        ann_stage: true,
        language: true,
        title: true,
        url: true,
        content_type_machine: true,
        content_mix_category: true,
        content_mix_source: true,
        content_mix_assigned_by: true,
        content_mix_assigned_at: true,
        cms_actions: true,
        cms_actions_updated_at: true,
        is_pdg_program_content: true,
        is_content_gated: true,
        is_nurture_content: true,
        content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping: {
          select: {
            persona_primary_label: true,
            buying_stage: true,
            content_type_inferred: true,
            key_pain_point: true,
            rationale: true,
            model_name: true,
          },
        },
      },
    })

    // Serialize BigInt values
    const serialized = serializeBigInt({
      success: true,
      updatedCount: updateResult.count,
      items: updatedItems,
    })

    return NextResponse.json(serialized)
  } catch (error) {
    console.error('Classification update API error:', error)

    return NextResponse.json(
      {
        error: 'Failed to update classification data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
