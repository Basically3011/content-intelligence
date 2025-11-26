'use client'

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export interface StageWithCount {
  stage: string
  count: number
}

export interface PersonaWithCount {
  persona: string
  count: number
}

interface AdvancedFiltersProps {
  // Personas
  personas: PersonaWithCount[]
  selectedPersonas: string[]
  onPersonasChange: (personas: string[]) => void

  // Stages
  stages: StageWithCount[]
  selectedStages: string[]
  onStagesChange: (stages: string[]) => void

  // Content Types
  contentTypes: string[]
  selectedContentTypes: string[]
  onContentTypesChange: (types: string[]) => void

  // Languages
  languages: string[]
  selectedLanguages: string[]
  onLanguagesChange: (languages: string[]) => void

  // Loading state
  isLoading?: boolean

  // Clear all
  onClearAll: () => void
}

export function PersonasPopover({
  label,
  personas,
  selected,
  onChange,
  isLoading,
}: {
  label: string
  personas: PersonaWithCount[]
  selected: string[]
  onChange: (values: string[]) => void
  isLoading?: boolean
}) {
  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const handleClear = () => {
    onChange([])
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="justify-between h-9">
          {label}
          {selected.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selected.length}
            </Badge>
          )}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">{label}</span>
            {selected.length > 0 && (
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
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : personas.length > 0 ? (
            <div className="space-y-1">
              {personas.map((item) => (
                <label
                  key={item.persona}
                  className="flex items-center gap-2 px-2 py-2 rounded hover:bg-accent cursor-pointer"
                >
                  <Checkbox
                    checked={selected.includes(item.persona)}
                    onCheckedChange={() => handleToggle(item.persona)}
                  />
                  <span className="text-sm flex-1">{item.persona}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.count}
                  </Badge>
                </label>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              No options available
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function StagesPopover({
  label,
  stages,
  selected,
  onChange,
  isLoading,
}: {
  label: string
  stages: StageWithCount[]
  selected: string[]
  onChange: (values: string[]) => void
  isLoading?: boolean
}) {
  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const handleClear = () => {
    onChange([])
  }

  // Primary stages in specific order
  const primaryStages = ['Awareness', 'Explore', 'Evaluate', 'Decision']

  // Sort stages: primary first in order, then others alphabetically
  const sortedStages = [...stages].sort((a, b) => {
    const aIndex = primaryStages.indexOf(a.stage)
    const bIndex = primaryStages.indexOf(b.stage)

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    }
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    return a.stage.localeCompare(b.stage)
  })

  const primaryStagesList = sortedStages.filter(s => primaryStages.includes(s.stage))
  const otherStagesList = sortedStages.filter(s => !primaryStages.includes(s.stage))

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="justify-between h-9">
          {label}
          {selected.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selected.length}
            </Badge>
          )}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">{label}</span>
            {selected.length > 0 && (
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
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : stages.length > 0 ? (
            <div className="space-y-1">
              {/* Primary Stages */}
              {primaryStagesList.map((item) => (
                <label
                  key={item.stage}
                  className="flex items-center gap-2 px-2 py-2 rounded hover:bg-accent cursor-pointer"
                >
                  <Checkbox
                    checked={selected.includes(item.stage)}
                    onCheckedChange={() => handleToggle(item.stage)}
                  />
                  <span className="text-sm flex-1">{item.stage}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.count}
                  </Badge>
                </label>
              ))}

              {/* Divider */}
              {otherStagesList.length > 0 && (
                <Separator className="my-2" />
              )}

              {/* Other Stages */}
              {otherStagesList.map((item) => (
                <label
                  key={item.stage}
                  className="flex items-center gap-2 px-2 py-2 rounded hover:bg-accent cursor-pointer"
                >
                  <Checkbox
                    checked={selected.includes(item.stage)}
                    onCheckedChange={() => handleToggle(item.stage)}
                  />
                  <span className="text-sm flex-1">{item.stage}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.count}
                  </Badge>
                </label>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              No options available
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function MultiSelectPopover({
  label,
  options,
  selected,
  onChange,
  isLoading,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (values: string[]) => void
  isLoading?: boolean
}) {
  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const handleClear = () => {
    onChange([])
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="justify-between h-9">
          {label}
          {selected.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selected.length}
            </Badge>
          )}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">{label}</span>
            {selected.length > 0 && (
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
        <div className="max-h-64 overflow-y-auto p-2">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : options.length > 0 ? (
            <div className="space-y-1">
              {options.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 px-2 py-2 rounded hover:bg-accent cursor-pointer"
                >
                  <Checkbox
                    checked={selected.includes(option)}
                    onCheckedChange={() => handleToggle(option)}
                  />
                  <span className="text-sm flex-1">{option}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              No options available
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function AdvancedFilters({
  personas,
  selectedPersonas,
  onPersonasChange,
  stages,
  selectedStages,
  onStagesChange,
  contentTypes,
  selectedContentTypes,
  onContentTypesChange,
  languages,
  selectedLanguages,
  onLanguagesChange,
  isLoading,
  onClearAll,
}: AdvancedFiltersProps) {
  const hasActiveFilters =
    selectedPersonas.length > 0 ||
    selectedStages.length > 0 ||
    selectedContentTypes.length > 0 ||
    selectedLanguages.length > 0

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <PersonasPopover
        label="Persona"
        personas={personas}
        selected={selectedPersonas}
        onChange={onPersonasChange}
        isLoading={isLoading}
      />

      <StagesPopover
        label="Buying Stage"
        stages={stages}
        selected={selectedStages}
        onChange={onStagesChange}
        isLoading={isLoading}
      />

      <MultiSelectPopover
        label="ANN Content Type"
        options={contentTypes}
        selected={selectedContentTypes}
        onChange={onContentTypesChange}
        isLoading={isLoading}
      />

      <MultiSelectPopover
        label="Language"
        options={languages}
        selected={selectedLanguages}
        onChange={onLanguagesChange}
        isLoading={isLoading}
      />

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-9"
        >
          <X className="h-4 w-4 mr-1" />
          Clear All Filters
        </Button>
      )}
    </div>
  )
}
