'use client'

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface NurtureCoverageCell {
  persona: string
  stage: string
  count: number
}

interface NurtureHeatmapProps {
  personas: string[]
  stages: string[]
  data: NurtureCoverageCell[]
  languages: string[]
  selectedLanguage?: string
  onLanguageChange: (language: string | undefined) => void
}

export function NurtureHeatmap({
  personas,
  stages,
  data,
  languages,
  selectedLanguage,
  onLanguageChange,
}: NurtureHeatmapProps) {
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
    params.set('is_nurture', 'true')
    if (selectedLanguage) {
      params.set('language', selectedLanguage)
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
            <CardTitle>Nurture Heatmap</CardTitle>
            <CardDescription>
              Nurture content distribution across Personas and Buying Stages
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{totalAssets}</div>
            <div className="text-xs text-muted-foreground">Total Assets</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Language</Label>
              <Select
                value={selectedLanguage || "all"}
                onValueChange={(value) => onLanguageChange(value === "all" ? undefined : value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Languages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
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
                          title={`${persona} - ${stage}: ${count} nurture items - Click to view in Library`}
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

export function NurtureHeatmapSkeleton() {
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
