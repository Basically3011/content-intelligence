'use client'

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown } from "lucide-react"

interface ToggleFiltersProps {
  // Content Status (Program Flags)
  showGatedOnly: boolean
  onShowGatedOnlyChange: (value: boolean) => void
  showNurtureOnly: boolean
  onShowNurtureOnlyChange: (value: boolean) => void
  showPdgOnly: boolean
  onShowPdgOnlyChange: (value: boolean) => void
}

export function ToggleFilters({
  showGatedOnly,
  onShowGatedOnlyChange,
  showNurtureOnly,
  onShowNurtureOnlyChange,
  showPdgOnly,
  onShowPdgOnlyChange,
}: ToggleFiltersProps) {
  const contentStatusCount = [showGatedOnly, showNurtureOnly, showPdgOnly].filter(Boolean).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="justify-between h-9">
          Program Flags
          {contentStatusCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {contentStatusCount}
            </Badge>
          )}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-3 border-b">
          <span className="font-semibold text-sm">Program Flags</span>
        </div>
        <div className="p-2 space-y-1">
          <label className="flex items-center gap-2 px-2 py-2 rounded hover:bg-accent cursor-pointer">
            <Checkbox
              checked={showGatedOnly}
              onCheckedChange={onShowGatedOnlyChange}
            />
            <span className="text-sm flex-1">Gated Content</span>
          </label>
          <label className="flex items-center gap-2 px-2 py-2 rounded hover:bg-accent cursor-pointer">
            <Checkbox
              checked={showNurtureOnly}
              onCheckedChange={onShowNurtureOnlyChange}
            />
            <span className="text-sm flex-1">Nurture Content</span>
          </label>
          <label className="flex items-center gap-2 px-2 py-2 rounded hover:bg-accent cursor-pointer">
            <Checkbox
              checked={showPdgOnly}
              onCheckedChange={onShowPdgOnlyChange}
            />
            <span className="text-sm flex-1">PDG Program</span>
          </label>
        </div>
      </PopoverContent>
    </Popover>
  )
}
