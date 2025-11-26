import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

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

export async function GET() {
  try {
    // Check how many scoring records exist with strengths/weaknesses
    // Use raw query for JSON null checking since Prisma's JSON filters are complex
    const withStrengths = await prisma.content_scoring.count({
      where: {
        audit_primary_strengths: { not: Prisma.DbNull }
      }
    })

    const withWeaknesses = await prisma.content_scoring.count({
      where: {
        audit_critical_weaknesses: { not: Prisma.DbNull }
      }
    })

    const withSummary = await prisma.content_scoring.count({
      where: {
        audit_executive_summary: { not: null }
      }
    })

    // Get a sample record with data
    const sample = await prisma.content_scoring.findFirst({
      where: {
        OR: [
          { audit_primary_strengths: { not: Prisma.DbNull } },
          { audit_critical_weaknesses: { not: Prisma.DbNull } }
        ]
      },
      select: {
        scoring_id: true,
        audit_executive_summary: true,
        audit_primary_strengths: true,
        audit_critical_weaknesses: true,
      }
    })

    return NextResponse.json(serializeBigInt({
      counts: {
        withStrengths,
        withWeaknesses,
        withSummary,
        total: await prisma.content_scoring.count()
      },
      sample
    }))
  } catch (error) {
    console.error('Test scoring error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
