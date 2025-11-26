'use client'

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ChevronDown } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface ContentMixFilterProps {
  categories: string[]
  selectedCategories: string[]
  isNull: boolean
  isNotNull: boolean
  onCategoriesChange: (categories: string[]) => void
  onIsNullChange: (isNull: boolean) => void
  onIsNotNullChange: (isNotNull: boolean) => void
  isLoading?: boolean
}

export function ContentMixFilter({
  categories,
  selectedCategories,
  isNull,
  isNotNull,
  onCategoriesChange,
  onIsNullChange,
  onIsNotNullChange,
  isLoading,
}: ContentMixFilterProps) {
  const handleToggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter(c => c !== category))
    } else {
      onCategoriesChange([...selectedCategories, category])
    }
  }

  const handleClear = () => {
    onCategoriesChange([])
    onIsNullChange(false)
    onIsNotNullChange(false)
  }

  const hasActiveFilter = selectedCategories.length > 0 || isNull || isNotNull

  const getDisplayLabel = () => {
    if (isNull) return 'Adj. Content Type: Is Null'
    if (isNotNull) return 'Adj. Content Type: Is Not Null'
    if (selectedCategories.length > 0) {
      return selectedCategories.length === 1
        ? `Adj. Content Type: ${selectedCategories[0]}`
        : `Adj. Content Type (${selectedCategories.length})`
    }
    return 'Adj. Content Type'
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="justify-between h-9">
          <span className="text-sm">{getDisplayLabel()}</span>
          {hasActiveFilter && (
            <Badge variant="secondary" className="ml-2">
              {isNull || isNotNull ? 1 : selectedCategories.length}
            </Badge>
          )}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">Adj. Content Type</span>
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
              {/* Regular Category Options */}
              {categories.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-2 px-2 py-2 rounded hover:bg-accent cursor-pointer"
                >
                  <Checkbox
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => handleToggleCategory(category)}
                    disabled={isNull || isNotNull}
                  />
                  <span className="text-sm flex-1">{category}</span>
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
                      onCategoriesChange([])
                    }
                  }}
                />
                <span className="text-sm flex-1 font-medium">Is Null (not categorized)</span>
              </label>

              {/* Is Not Null Option */}
              <label className="flex items-center gap-2 px-2 py-2 rounded hover:bg-accent cursor-pointer">
                <Checkbox
                  checked={isNotNull}
                  onCheckedChange={(checked) => {
                    onIsNotNullChange(!!checked)
                    if (checked) {
                      onIsNullChange(false)
                      onCategoriesChange([])
                    }
                  }}
                />
                <span className="text-sm flex-1 font-medium">Is Not Null (categorized)</span>
              </label>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
