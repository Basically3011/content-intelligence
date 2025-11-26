'use client'

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CoverageFilters, type ContentMixFilter } from "./coverage-filters"

interface CoverageCell {
  persona: string
  stage: string
  count: number
}

interface CoverageHeatmapProps {
  personas: string[]
  stages: string[]
  data: CoverageCell[]
  languages: string[]
  contentMixCategories: string[]
  selectedLanguage?: string
  isPdg?: boolean
  contentMixFilter: ContentMixFilter
  onLanguageChange: (language: string | undefined) => void
  onPdgChange: (isPdg: boolean | undefined) => void
  onContentMixFilterChange: (filter: ContentMixFilter) => void
}

export function CoverageHeatmap({
  personas,
  stages,
  data,
  languages,
  contentMixCategories,
  selectedLanguage,
  isPdg,
  contentMixFilter,
  onLanguageChange,
  onPdgChange,
  onContentMixFilterChange,
}: CoverageHeatmapProps) {
  const router = useRouter()

  // Get count for a specific persona-stage combination
  const getCount = (persona: string, stage: string): number => {
    const cell = data.find(d => d.persona === persona && d.stage === stage)
    return cell?.count || 0
  }

  // Navigate to library with filters
  const handleCellClick = (persona: string, stage: string) => {
    const params = new URLSearchParams()
    params.set('persona', persona)
    params.set('stage', stage)
    if (selectedLanguage) {
      params.set('language', selectedLanguage)
    }
    if (isPdg !== undefined) {
      params.set('pdg', isPdg.toString())
    }
    // Content Mix Category filter
    if (contentMixFilter.categories.length > 0) {
      params.set('content_mix_categories', contentMixFilter.categories.join(','))
    }
    if (contentMixFilter.isNull) {
      params.set('content_mix_is_null', 'true')
    }
    if (contentMixFilter.isNotNull) {
      params.set('content_mix_is_not_null', 'true')
    }
    router.push(`/library?${params.toString()}`)
  }

  // Color scale based on count thresholds
  const getColorClass = (count: number): string => {
    if (count === 0) return 'bg-slate-200 text-slate-700'           // Gray - Critical (0)
    if (count <= 3) return 'bg-rose-200 text-rose-800'              // Rose/Red - Poor (1-3)
    if (count <= 7) return 'bg-amber-200 text-amber-800'            // Yellow - Fair (4-7)
    if (count <= 12) return 'bg-teal-200 text-teal-800'             // Teal - Good (8-12)
    if (count <= 30) return 'bg-emerald-200 text-emerald-800'       // Green - Great (13-30)
    return 'bg-orange-200 text-orange-800'                          // Orange - Excessive (31+)
  }

  // Calculate total assets
  const totalAssets = data.reduce((sum, cell) => sum + cell.count, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <CardTitle>Coverage Heatmap</CardTitle>
            <CardDescription>
              Content distribution across Personas and Buying Stages
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{totalAssets}</div>
            <div className="text-xs text-muted-foreground">Total Assets</div>
          </div>
        </div>
        <div className="mt-4">
          <CoverageFilters
            languages={languages}
            selectedLanguage={selectedLanguage}
            isPdg={isPdg}
            contentMixCategories={contentMixCategories}
            contentMixFilter={contentMixFilter}
            onLanguageChange={onLanguageChange}
            onPdgChange={onPdgChange}
            onContentMixFilterChange={onContentMixFilterChange}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-2">
            <thead>
              <tr>
                <th className="p-3 text-left font-semibold text-sm">
                  Persona
                </th>
                {stages.map((stage) => (
                  <th
                    key={stage}
                    className="p-3 text-center font-semibold text-sm min-w-[120px]"
                  >
                    {stage}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {personas.map((persona) => (
                <tr key={persona}>
                  <td className="p-3 font-medium text-sm align-middle">
                    {persona}
                  </td>
                  {stages.map((stage) => {
                    const count = getCount(persona, stage)
                    return (
                      <td
                        key={`${persona}-${stage}`}
                        className="p-0"
                      >
                        <div
                          className={`
                            ${getColorClass(count)}
                            p-4 text-center font-bold text-lg
                            rounded-lg shadow-sm
                            transition-all hover:shadow-md hover:scale-105 cursor-pointer
                          `}
                          title={`${persona} - ${stage}: ${count} items - Click to view in Library`}
                          onClick={() => handleCellClick(persona, stage)}
                        >
                          {count}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 items-center justify-center text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-200 rounded" />
            <span className="text-muted-foreground">0 (Critical Gap)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-rose-200 rounded" />
            <span className="text-muted-foreground">1-3 (Poor)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-200 rounded" />
            <span className="text-muted-foreground">4-7 (Fair)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-teal-200 rounded" />
            <span className="text-muted-foreground">8-12 (Good)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-200 rounded" />
            <span className="text-muted-foreground">13-30 (Great)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-200 rounded" />
            <span className="text-muted-foreground">31+ (Excessive)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function CoverageHeatmapSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-96 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
