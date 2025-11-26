'use client'

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ChevronDown } from "lucide-react"

interface ContentMixFilter {
  categories: string[]
  isNull: boolean
  isNotNull: boolean
}

interface CoverageFiltersProps {
  languages: string[]
  selectedLanguage?: string
  isPdg?: boolean
  contentMixCategories: string[]
  contentMixFilter: ContentMixFilter
  onLanguageChange: (language: string | undefined) => void
  onPdgChange: (isPdg: boolean | undefined) => void
  onContentMixFilterChange: (filter: ContentMixFilter) => void
}

export function CoverageFilters({
  languages,
  selectedLanguage,
  isPdg,
  contentMixCategories,
  contentMixFilter,
  onLanguageChange,
  onPdgChange,
  onContentMixFilterChange,
}: CoverageFiltersProps) {
  const handleCategoryToggle = (category: string) => {
    const newCategories = contentMixFilter.categories.includes(category)
      ? contentMixFilter.categories.filter(c => c !== category)
      : [...contentMixFilter.categories, category]

    onContentMixFilterChange({
      categories: newCategories,
      isNull: false,
      isNotNull: false,
    })
  }

  const handleIsNullToggle = (checked: boolean) => {
    onContentMixFilterChange({
      categories: [],
      isNull: checked,
      isNotNull: false,
    })
  }

  const handleIsNotNullToggle = (checked: boolean) => {
    onContentMixFilterChange({
      categories: [],
      isNull: false,
      isNotNull: checked,
    })
  }

  const handleClearContentMix = () => {
    onContentMixFilterChange({
      categories: [],
      isNull: false,
      isNotNull: false,
    })
  }

  const hasContentMixFilter = contentMixFilter.categories.length > 0 || contentMixFilter.isNull || contentMixFilter.isNotNull
  const contentMixLabel = contentMixFilter.isNull
    ? 'Is Null'
    : contentMixFilter.isNotNull
      ? 'Is Not Null'
      : contentMixFilter.categories.length > 0
        ? `${contentMixFilter.categories.length} selected`
        : null
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Language Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 text-sm h-9">
            Language
            {selectedLanguage && (
              <span className="ml-1 font-semibold">{selectedLanguage}</span>
            )}
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3" align="start">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase mb-3">
              Select Language
            </div>
            <label
              className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted cursor-pointer"
            >
              <Checkbox
                checked={selectedLanguage === undefined}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onLanguageChange(undefined)
                  }
                }}
              />
              <span className="text-sm">All Languages</span>
            </label>
            <div className="border-t pt-2 mt-2 space-y-1">
              {languages.map((lang) => (
                <label
                  key={lang}
                  className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted cursor-pointer"
                >
                  <Checkbox
                    checked={selectedLanguage === lang}
                    onCheckedChange={(checked) => {
                      onLanguageChange(checked ? lang : undefined)
                    }}
                  />
                  <span className="text-sm">{lang}</span>
                </label>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* PDG Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 text-sm h-9">
            PDG
            {isPdg !== undefined && (
              <span className="ml-1 font-semibold">{isPdg ? 'Yes' : 'No'}</span>
            )}
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-3" align="start">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase mb-3">
              PDG Content
            </div>
            <label
              className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted cursor-pointer"
            >
              <Checkbox
                checked={isPdg === undefined}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onPdgChange(undefined)
                  }
                }}
              />
              <span className="text-sm">All Content</span>
            </label>
            <div className="border-t pt-2 mt-2 space-y-1">
              <label
                className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted cursor-pointer"
              >
                <Checkbox
                  checked={isPdg === true}
                  onCheckedChange={(checked) => {
                    onPdgChange(checked ? true : undefined)
                  }}
                />
                <span className="text-sm">PDG Only</span>
              </label>
              <label
                className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted cursor-pointer"
              >
                <Checkbox
                  checked={isPdg === false}
                  onCheckedChange={(checked) => {
                    onPdgChange(checked ? false : undefined)
                  }}
                />
                <span className="text-sm">Non-PDG Only</span>
              </label>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Content Mix Category Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 text-sm h-9">
            Content Mix
            {contentMixLabel && (
              <span className="ml-1 font-semibold">{contentMixLabel}</span>
            )}
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase mb-3">
              Content Mix Category
            </div>

            {/* All / Clear */}
            <label
              className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted cursor-pointer"
            >
              <Checkbox
                checked={!hasContentMixFilter}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleClearContentMix()
                  }
                }}
              />
              <span className="text-sm">All</span>
            </label>

            {/* Is Null / Is Not Null */}
            <div className="border-t pt-2 mt-2 space-y-1">
              <label
                className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted cursor-pointer"
              >
                <Checkbox
                  checked={contentMixFilter.isNull}
                  onCheckedChange={(checked) => handleIsNullToggle(!!checked)}
                />
                <span className="text-sm">Is Null (not categorized)</span>
              </label>
              <label
                className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted cursor-pointer"
              >
                <Checkbox
                  checked={contentMixFilter.isNotNull}
                  onCheckedChange={(checked) => handleIsNotNullToggle(!!checked)}
                />
                <span className="text-sm">Is Not Null (categorized)</span>
              </label>
            </div>

            {/* Category multi-select */}
            <div className="border-t pt-2 mt-2 space-y-1 max-h-48 overflow-y-auto">
              <div className="text-xs text-muted-foreground mb-2">Select categories:</div>
              {contentMixCategories.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted cursor-pointer"
                >
                  <Checkbox
                    checked={contentMixFilter.categories.includes(category)}
                    onCheckedChange={() => handleCategoryToggle(category)}
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {(selectedLanguage !== undefined || isPdg !== undefined || hasContentMixFilter) && (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-9"
          onClick={() => {
            onLanguageChange(undefined)
            onPdgChange(undefined)
            handleClearContentMix()
          }}
        >
          Clear Filters
        </Button>
      )}
    </div>
  )
}

export type { ContentMixFilter }
