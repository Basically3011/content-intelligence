'use client'

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChevronDown, BarChart3 } from "lucide-react"

const SCORE_OPTIONS = [
  { value: 'poor', label: 'Poor (0-2)', color: 'bg-red-500/10 text-red-700 border-red-500/20' },
  { value: 'fair', label: 'Fair (2-3)', color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20' },
  { value: 'good', label: 'Good (3+)', color: 'bg-green-500/10 text-green-700 border-green-500/20' },
]

const NOT_SCORED_OPTION = { value: 'not_scored', label: 'Not Scored', color: 'bg-gray-500/10 text-gray-700 border-gray-500/20' }

interface ScoreFilterProps {
  selectedScores: string[]
  onScoresChange: (scores: string[]) => void
  isLoading?: boolean
}

export function ScoreFilter({
  selectedScores,
  onScoresChange,
  isLoading = false
}: ScoreFilterProps) {
  const handleToggle = (score: string) => {
    if (selectedScores.includes(score)) {
      onScoresChange(selectedScores.filter(s => s !== score))
    } else {
      onScoresChange([...selectedScores, score])
    }
  }

  const handleClear = () => {
    onScoresChange([])
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 border-dashed"
          disabled={isLoading}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Score
          {selectedScores.length > 0 && (
            <>
              <div className="mx-2 h-4 w-[1px] bg-border" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                {selectedScores.length}
              </Badge>
            </>
          )}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Content Score</div>
            {selectedScores.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={handleClear}
              >
                Clear
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {SCORE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 px-2 py-2 rounded hover:bg-accent cursor-pointer"
              >
                <Checkbox
                  checked={selectedScores.includes(option.value)}
                  onCheckedChange={() => handleToggle(option.value)}
                />
                <span className="text-sm flex-1">{option.label}</span>
                <div className={`h-2 w-2 rounded-full ${option.color.split(' ')[0].replace('bg-', 'bg-').replace('/10', '')}`} />
              </label>
            ))}

            <Separator className="my-2" />

            <label
              className="flex items-center gap-2 px-2 py-2 rounded hover:bg-accent cursor-pointer"
            >
              <Checkbox
                checked={selectedScores.includes(NOT_SCORED_OPTION.value)}
                onCheckedChange={() => handleToggle(NOT_SCORED_OPTION.value)}
              />
              <span className="text-sm flex-1">{NOT_SCORED_OPTION.label}</span>
              <div className={`h-2 w-2 rounded-full ${NOT_SCORED_OPTION.color.split(' ')[0].replace('bg-', 'bg-').replace('/10', '')}`} />
            </label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
