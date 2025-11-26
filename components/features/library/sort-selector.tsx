'use client'

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, Check } from "lucide-react"

interface SortSelectorProps {
  sortBy: 'cms_created_at' | 'cms_updated_at'
  sortOrder: 'asc' | 'desc'
  onSortByChange: (value: 'cms_created_at' | 'cms_updated_at') => void
  onSortOrderChange: (value: 'asc' | 'desc') => void
}

const sortOptions = [
  { value: 'cms_created_at', label: 'Created Date' },
  { value: 'cms_updated_at', label: 'Updated Date' },
] as const

export function SortSelector({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
}: SortSelectorProps) {
  const currentSortLabel = sortOptions.find(opt => opt.value === sortBy)?.label || 'Sort'

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-sm h-9">
          <ArrowUpDown className="h-3.5 w-3.5" />
          {currentSortLabel}
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="start">
        <div className="space-y-3">
          {/* Sort By */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              Sort By
            </Label>
            <div className="space-y-0.5">
              {sortOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={sortBy === option.value ? 'secondary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start h-8 text-sm"
                  onClick={() => onSortByChange(option.value)}
                >
                  <Check
                    className={`mr-2 h-3.5 w-3.5 ${
                      sortBy === option.value ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Sort Order */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              Order
            </Label>
            <div className="flex gap-1.5">
              <Button
                variant={sortOrder === 'desc' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 gap-1.5 h-8 text-xs"
                onClick={() => onSortOrderChange('desc')}
              >
                <ArrowDown className="h-3 w-3" />
                Newest
              </Button>
              <Button
                variant={sortOrder === 'asc' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 gap-1.5 h-8 text-xs"
                onClick={() => onSortOrderChange('asc')}
              >
                <ArrowUp className="h-3 w-3" />
                Oldest
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
