'use client'

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ChevronDown } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface PdgStageFilterProps {
  stages: string[]
  selectedStages: string[]
  isNull: boolean
  isNotNull: boolean
  onStagesChange: (stages: string[]) => void
  onIsNullChange: (isNull: boolean) => void
  onIsNotNullChange: (isNotNull: boolean) => void
  isLoading?: boolean
}

export function PdgStageFilter({
  stages,
  selectedStages,
  isNull,
  isNotNull,
  onStagesChange,
  onIsNullChange,
  onIsNotNullChange,
  isLoading,
}: PdgStageFilterProps) {
  const handleToggleStage = (stage: string) => {
    if (selectedStages.includes(stage)) {
      onStagesChange(selectedStages.filter(s => s !== stage))
    } else {
      onStagesChange([...selectedStages, stage])
    }
  }

  const handleClear = () => {
    onStagesChange([])
    onIsNullChange(false)
    onIsNotNullChange(false)
  }

  const hasActiveFilter = selectedStages.length > 0 || isNull || isNotNull

  const getDisplayLabel = () => {
    if (isNull) return 'PDG Stage: Is Null'
    if (isNotNull) return 'PDG Stage: Is Not Null'
    if (selectedStages.length > 0) {
      return selectedStages.length === 1
        ? `PDG Stage: ${selectedStages[0]}`
        : `PDG Stage (${selectedStages.length})`
    }
    return 'PDG Stage'
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="justify-between h-9">
          <span className="text-sm">{getDisplayLabel()}</span>
          {hasActiveFilter && (
            <Badge variant="secondary" className="ml-2">
              {isNull || isNotNull ? 1 : selectedStages.length}
            </Badge>
          )}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">PDG Stage</span>
            {hasActiveFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-auto p-0 text-xs"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              Loading...
            </div>
          ) : (
            <div className="space-y-1">
              {/* Regular Stage Options */}
              {stages.map((stage) => (
                <label
                  key={stage}
                  className="flex items-center gap-2 px-2 py-2 rounded hover:bg-accent cursor-pointer"
                >
                  <Checkbox
                    checked={selectedStages.includes(stage)}
                    onCheckedChange={() => handleToggleStage(stage)}
                    disabled={isNull || isNotNull}
                  />
                  <span className="text-sm flex-1">{stage}</span>
                </label>
              ))}

              {/* Divider */}
              <Separator className="my-2" />

              {/* Is Null Option */}
              <label className="flex items-center gap-2 px-2 py-2 rounded hover:bg-accent cursor-pointer">
                <Checkbox
                  checked={isNull}
                  onCheckedChange={(checked) => {
                    onIsNullChange(!!checked)
                    if (checked) {
                      onIsNotNullChange(false)
                      onStagesChange([])
                    }
                  }}
                />
                <span className="text-sm flex-1 font-medium">Is Null</span>
              </label>

              {/* Is Not Null Option */}
              <label className="flex items-center gap-2 px-2 py-2 rounded hover:bg-accent cursor-pointer">
                <Checkbox
                  checked={isNotNull}
                  onCheckedChange={(checked) => {
                    onIsNotNullChange(!!checked)
                    if (checked) {
                      onIsNullChange(false)
                      onStagesChange([])
                    }
                  }}
                />
                <span className="text-sm flex-1 font-medium">Is Not Null</span>
              </label>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
