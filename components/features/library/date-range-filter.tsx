'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export type DateField = 'cms_created_at' | 'cms_updated_at'

export type DateRangePreset =
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'last_quarter'
  | 'this_year'
  | 'last_year'
  | 'custom'

export interface DateRange {
  from: string // ISO date string
  to: string   // ISO date string
}

interface DateRangeFilterProps {
  selectedField: DateField
  selectedPreset?: DateRangePreset
  customRange?: DateRange
  onFieldChange: (field: DateField) => void
  onPresetChange: (preset: DateRangePreset) => void
  onCustomRangeChange: (range: DateRange) => void
  onClear: () => void
}

// Helper functions to calculate date ranges
function getStartOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function getStartOfMonth(date: Date): Date {
  const d = new Date(date)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

function getStartOfQuarter(date: Date): Date {
  const d = new Date(date)
  const currentMonth = d.getMonth()
  const quarterStartMonth = Math.floor(currentMonth / 3) * 3
  d.setMonth(quarterStartMonth)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

function getStartOfYear(date: Date): Date {
  const d = new Date(date)
  d.setMonth(0)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

function toISODate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function getDateRangeForPreset(preset: DateRangePreset): DateRange | null {
  const now = new Date()
  const today = toISODate(now)

  switch (preset) {
    case 'this_week': {
      const start = getStartOfWeek(now)
      return { from: toISODate(start), to: today }
    }
    case 'last_week': {
      const thisWeekStart = getStartOfWeek(now)
      const lastWeekStart = new Date(thisWeekStart)
      lastWeekStart.setDate(lastWeekStart.getDate() - 7)
      const lastWeekEnd = new Date(thisWeekStart)
      lastWeekEnd.setDate(lastWeekEnd.getDate() - 1)
      return { from: toISODate(lastWeekStart), to: toISODate(lastWeekEnd) }
    }
    case 'this_month': {
      const start = getStartOfMonth(now)
      return { from: toISODate(start), to: today }
    }
    case 'last_month': {
      const lastMonth = new Date(now)
      lastMonth.setMonth(lastMonth.getMonth() - 1)
      const start = getStartOfMonth(lastMonth)
      const end = new Date(getStartOfMonth(now))
      end.setDate(end.getDate() - 1)
      return { from: toISODate(start), to: toISODate(end) }
    }
    case 'this_quarter': {
      const start = getStartOfQuarter(now)
      return { from: toISODate(start), to: today }
    }
    case 'last_quarter': {
      const thisQuarterStart = getStartOfQuarter(now)
      const lastQuarterStart = new Date(thisQuarterStart)
      lastQuarterStart.setMonth(lastQuarterStart.getMonth() - 3)
      const lastQuarterEnd = new Date(thisQuarterStart)
      lastQuarterEnd.setDate(lastQuarterEnd.getDate() - 1)
      return { from: toISODate(lastQuarterStart), to: toISODate(lastQuarterEnd) }
    }
    case 'this_year': {
      const start = getStartOfYear(now)
      return { from: toISODate(start), to: today }
    }
    case 'last_year': {
      const lastYear = new Date(now)
      lastYear.setFullYear(lastYear.getFullYear() - 1)
      const start = getStartOfYear(lastYear)
      const end = new Date(getStartOfYear(now))
      end.setDate(end.getDate() - 1)
      return { from: toISODate(start), to: toISODate(end) }
    }
    case 'custom':
      return null
    default:
      return null
  }
}

const presetLabels: Record<DateRangePreset, string> = {
  this_week: 'This Week',
  last_week: 'Last Week',
  this_month: 'This Month',
  last_month: 'Last Month',
  this_quarter: 'This Quarter',
  last_quarter: 'Last Quarter',
  this_year: 'This Year',
  last_year: 'Last Year',
  custom: 'Custom Range',
}

const fieldLabels: Record<DateField, string> = {
  cms_created_at: 'Created',
  cms_updated_at: 'Updated',
}

export function DateRangeFilter({
  selectedField,
  selectedPreset,
  customRange,
  onFieldChange,
  onPresetChange,
  onCustomRangeChange,
  onClear,
}: DateRangeFilterProps) {
  const [showCustomInputs, setShowCustomInputs] = useState(false)
  const [tempFrom, setTempFrom] = useState(customRange?.from || '')
  const [tempTo, setTempTo] = useState(customRange?.to || '')

  const handlePresetSelect = (preset: DateRangePreset) => {
    if (preset === 'custom') {
      setShowCustomInputs(true)
      onPresetChange(preset)
    } else {
      setShowCustomInputs(false)
      onPresetChange(preset)
    }
  }

  const handleCustomApply = () => {
    if (tempFrom && tempTo) {
      onCustomRangeChange({ from: tempFrom, to: tempTo })
      setShowCustomInputs(false)
    }
  }

  const getDisplayText = () => {
    if (!selectedPreset) return 'Date Range'

    const fieldLabel = fieldLabels[selectedField]
    const presetLabel = presetLabels[selectedPreset]

    if (selectedPreset === 'custom' && customRange) {
      return `${fieldLabel}: ${customRange.from} - ${customRange.to}`
    }

    return `${fieldLabel}: ${presetLabel}`
  }

  const hasActiveFilter = selectedPreset !== undefined

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "justify-between h-9 gap-2",
            hasActiveFilter && "border-primary"
          )}
        >
          <Calendar className="h-4 w-4" />
          <span className="text-sm">{getDisplayText()}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        {/* Field Selection */}
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm">Date Field</span>
            {hasActiveFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="h-auto p-0 text-xs"
              >
                Clear
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedField === 'cms_created_at' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFieldChange('cms_created_at')}
              className="flex-1"
            >
              Created
            </Button>
            <Button
              variant={selectedField === 'cms_updated_at' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFieldChange('cms_updated_at')}
              className="flex-1"
            >
              Updated
            </Button>
          </div>
        </div>

        {/* Presets */}
        {!showCustomInputs ? (
          <div className="p-2">
            <div className="space-y-1">
              {(Object.keys(presetLabels) as DateRangePreset[]).map((preset) => {
                const range = preset !== 'custom' ? getDateRangeForPreset(preset) : null
                return (
                  <button
                    key={preset}
                    onClick={() => handlePresetSelect(preset)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded text-sm hover:bg-accent transition-colors",
                      selectedPreset === preset && "bg-accent font-medium"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{presetLabels[preset]}</span>
                      {range && (
                        <span className="text-xs text-muted-foreground">
                          {range.from} - {range.to}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                From Date
              </label>
              <input
                type="date"
                value={tempFrom}
                onChange={(e) => setTempFrom(e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                To Date
              </label>
              <input
                type="date"
                value={tempTo}
                onChange={(e) => setTempTo(e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCustomInputs(false)
                  setTempFrom(customRange?.from || '')
                  setTempTo(customRange?.to || '')
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCustomApply}
                disabled={!tempFrom || !tempTo}
                className="flex-1"
              >
                Apply
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
