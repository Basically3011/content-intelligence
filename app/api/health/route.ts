import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Test database connection with a simple query
    await prisma.$queryRaw`SELECT 1`

    // Get basic stats from actual tables
    const contentCount = await prisma.content_inventory.count()
    const mappingCount = await prisma.content_persona_mapping.count()
    const scoringCount = await prisma.content_scoring.count()

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      tables: {
        content_inventory: contentCount,
        content_persona_mapping: mappingCount,
        content_scoring: scoringCount,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Database connection error:', error)

    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
