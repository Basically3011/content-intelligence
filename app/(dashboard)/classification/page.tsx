'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, ChevronDown, X, ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, Info } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

// Content Mix Categories
const CONTENT_MIX_OPTIONS = [
  'Blog/Article',
  'Case Study',
  'Datasheet',
  'Demo Video',
  'Guide/Ebook',
  'Infographic',
  'Landing Page',
  'Report/Research',
  'Video',
  'Webinar',
  'Event',
  'Whitepaper',
  'Podcast',
]

// CMS Actions
const CMS_ACTIONS_OPTIONS = [
  'keep',
  'update',
  'consolidate',
  'redirect',
  'archive',
  'review',
]

interface ClassificationItem {
  inventory_id: string
  node_id: string
  ann_stage: string | null
  language: string
  title: string | null
  url: string | null
  content_type_machine: string | null
  content_mix_category: string | null
  cms_actions: string | null
  is_pdg_program_content: boolean | null
  is_content_gated: boolean | null
  is_nurture_content: boolean | null
  content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping?: {
    persona_primary_label: string | null
    buying_stage: string | null
    content_type_inferred: string | null
    key_pain_point: string | null
    rationale: string | null
    model_name: string | null
  } | null
}

interface ClassificationResponse {
  items: ClassificationItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface ClassificationStats {
  total: number
  classified: number
  unclassified: number
  percentage: number
}

interface FilterOptions {
  personas: { persona: string; count: number }[]
  stages: { stage: string; count: number }[]
  contentTypes: string[]
  languages: string[]
  pdgStages: string[]
  contentMixCategories: string[]
}

type SortField = 'node_id' | 'ann_stage' | 'language' | 'title' | 'persona' | 'stage' | 'content_type_machine' | 'content_mix_category' | 'cms_actions'
type SortOrder = 'asc' | 'desc' | null
type PdgFilter = 'all' | 'only' | 'exclude'

async function fetchFilterOptions(): Promise<FilterOptions> {
  const response = await fetch('/api/filters')
  if (!response.ok) throw new Error('Failed to fetch filter options')
  return response.json()
}

async function fetchClassificationStats(pdgFilter: PdgFilter): Promise<ClassificationStats> {
  const params = new URLSearchParams()
  if (pdgFilter === 'only') params.set('is_pdg', 'true')
  if (pdgFilter === 'exclude') params.set('is_pdg', 'false')

  const response = await fetch(`/api/classification/stats?${params.toString()}`)
  if (!response.ok) throw new Error('Failed to fetch classification stats')
  return response.json()
}

async function fetchClassificationData(
  page: number,
  limit: number,
  inventoryIdSearch: string,
  nodeIdSearch: string,
  annStageSearch: string,
  contentTypeMachineSearch: string,
  contentTypeInferredFilter: {
    search: string
    isNull?: boolean
    isNotNull?: boolean
  },
  languages: string[],
  personas: string[],
  buyingStages: string[],
  contentMixFilter: {
    isNull?: boolean
    isNotNull?: boolean
    categories: string[]
  },
  cmsActionsFilter: {
    isNull?: boolean
    isNotNull?: boolean
    actions: string[]
  },
  pdgFilter: PdgFilter,
  sortField: SortField | null,
  sortOrder: SortOrder
): Promise<ClassificationResponse> {
  const params = new URLSearchParams()
  params.set('page', page.toString())
  params.set('limit', limit.toString())
  if (inventoryIdSearch) params.set('inventory_id', inventoryIdSearch)
  if (nodeIdSearch) params.set('node_id', nodeIdSearch)
  if (annStageSearch) params.set('ann_stage', annStageSearch)
  if (contentTypeMachineSearch) params.set('content_type_machine', contentTypeMachineSearch)
  if (contentTypeInferredFilter.search) params.set('content_type_inferred', contentTypeInferredFilter.search)
  if (contentTypeInferredFilter.isNull) params.set('content_type_inferred_is_null', 'true')
  if (contentTypeInferredFilter.isNotNull) params.set('content_type_inferred_is_not_null', 'true')
  if (personas.length) params.set('personas', personas.join(','))
  if (buyingStages.length) params.set('buying_stages', buyingStages.join(','))
  if (languages.length) params.set('languages', languages.join(','))

  if (contentMixFilter.isNull) params.set('content_mix_is_null', 'true')
  if (contentMixFilter.isNotNull) params.set('content_mix_is_not_null', 'true')
  if (contentMixFilter.categories.length) params.set('content_mix_categories', contentMixFilter.categories.join(','))

  // CMS Actions filter
  if (cmsActionsFilter.isNull) params.set('cms_actions_is_null', 'true')
  if (cmsActionsFilter.isNotNull) params.set('cms_actions_is_not_null', 'true')
  if (cmsActionsFilter.actions.length) params.set('cms_actions', cmsActionsFilter.actions.join(','))

  // PDG filter
  if (pdgFilter === 'only') params.set('is_pdg', 'true')
  if (pdgFilter === 'exclude') params.set('is_pdg', 'false')

  if (sortField && sortOrder) {
    params.set('sort_by', sortField)
    params.set('sort_order', sortOrder)
  }

  const response = await fetch(`/api/classification?${params.toString()}`)
  if (!response.ok) throw new Error('Failed to fetch classification data')
  return response.json()
}

async function updateClassification(inventoryIds: string[], category?: string, cmsAction?: string) {
  const response = await fetch('/api/classification/update', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inventoryIds,
      ...(category && { category }),
      ...(cmsAction && { cmsAction }),
      source: 'manual',
      assignedBy: 'User',
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update classification')
  }

  return response.json()
}

function ColumnFilterDropdown({
  title,
  options,
  selectedValues,
  onSelect,
  disabled = false,
}: {
  title: string
  options: string[]
  selectedValues: string[]
  onSelect: (values: string[]) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)

  const handleToggle = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value]
    onSelect(newValues)
  }

  const handleClear = () => {
    onSelect([])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-full justify-between font-medium"
        >
          <span className="truncate">{title}</span>
          <div className="flex items-center gap-1">
            {selectedValues.length > 0 && (
              <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {selectedValues.length}
              </Badge>
            )}
            <ChevronDown className="h-4 w-4" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-medium">Filter by {title}</span>
          {selectedValues.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleClear}
            >
              Clear
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2">
          {options.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No options available
            </div>
          ) : (
            <div className="space-y-2">
              {options.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-accent rounded px-2 py-1.5"
                >
                  <Checkbox
                    checked={selectedValues.includes(option)}
                    onCheckedChange={() => handleToggle(option)}
                  />
                  <span className="text-sm flex-1">{option}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function ContentMixFilterDropdown({
  categories,
  isNull,
  isNotNull,
  selectedCategories,
  onIsNullChange,
  onIsNotNullChange,
  onCategoriesChange,
  disabled = false,
}: {
  categories: string[]
  isNull: boolean
  isNotNull: boolean
  selectedCategories: string[]
  onIsNullChange: (value: boolean) => void
  onIsNotNullChange: (value: boolean) => void
  onCategoriesChange: (values: string[]) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)

  const handleToggleCategory = (value: string) => {
    const newValues = selectedCategories.includes(value)
      ? selectedCategories.filter(v => v !== value)
      : [...selectedCategories, value]
    onCategoriesChange(newValues)
  }

  const handleClear = () => {
    onIsNullChange(false)
    onIsNotNullChange(false)
    onCategoriesChange([])
  }

  const activeCount = (isNull ? 1 : 0) + (isNotNull ? 1 : 0) + selectedCategories.length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-full justify-between font-medium"
        >
          <span className="truncate">Content Mix</span>
          <div className="flex items-center gap-1">
            {activeCount > 0 && (
              <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {activeCount}
              </Badge>
            )}
            <ChevronDown className="h-4 w-4" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-medium">Filter by Content Mix</span>
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleClear}
            >
              Clear
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto p-2">
          <div className="space-y-2">
            {/* Special filters */}
            <div className="pb-2 border-b">
              <label className="flex items-center space-x-2 cursor-pointer hover:bg-accent rounded px-2 py-1.5">
                <Checkbox
                  checked={isNull}
                  onCheckedChange={(checked) => {
                    onIsNullChange(checked === true)
                    if (checked) onIsNotNullChange(false)
                  }}
                />
                <span className="text-sm flex-1 font-medium text-muted-foreground">Is NULL (Not classified)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer hover:bg-accent rounded px-2 py-1.5">
                <Checkbox
                  checked={isNotNull}
                  onCheckedChange={(checked) => {
                    onIsNotNullChange(checked === true)
                    if (checked) onIsNullChange(false)
                  }}
                />
                <span className="text-sm flex-1 font-medium text-muted-foreground">Is NOT NULL (Classified)</span>
              </label>
            </div>

            {/* Categories */}
            {categories.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No categories available
              </div>
            ) : (
              <>
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Categories:</div>
                {categories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-accent rounded px-2 py-1.5"
                  >
                    <Checkbox
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => handleToggleCategory(category)}
                    />
                    <span className="text-sm flex-1">{category}</span>
                  </label>
                ))}
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function CmsActionsFilterDropdown({
  isNull,
  isNotNull,
  selectedActions,
  onIsNullChange,
  onIsNotNullChange,
  onActionsChange,
  disabled = false,
}: {
  isNull: boolean
  isNotNull: boolean
  selectedActions: string[]
  onIsNullChange: (value: boolean) => void
  onIsNotNullChange: (value: boolean) => void
  onActionsChange: (values: string[]) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)

  const handleToggleAction = (value: string) => {
    const newValues = selectedActions.includes(value)
      ? selectedActions.filter(v => v !== value)
      : [...selectedActions, value]
    onActionsChange(newValues)
  }

  const handleClear = () => {
    onIsNullChange(false)
    onIsNotNullChange(false)
    onActionsChange([])
  }

  const activeCount = (isNull ? 1 : 0) + (isNotNull ? 1 : 0) + selectedActions.length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-full justify-between font-medium"
        >
          <span className="truncate">CMS Actions</span>
          <div className="flex items-center gap-1">
            {activeCount > 0 && (
              <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {activeCount}
              </Badge>
            )}
            <ChevronDown className="h-4 w-4" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-medium">Filter by CMS Actions</span>
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleClear}
            >
              Clear
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto p-2">
          <div className="space-y-2">
            {/* Special filters */}
            <div className="pb-2 border-b">
              <label className="flex items-center space-x-2 cursor-pointer hover:bg-accent rounded px-2 py-1.5">
                <Checkbox
                  checked={isNull}
                  onCheckedChange={(checked) => {
                    onIsNullChange(checked === true)
                    if (checked) onIsNotNullChange(false)
                  }}
                />
                <span className="text-sm flex-1 font-medium text-muted-foreground">Is NULL</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer hover:bg-accent rounded px-2 py-1.5">
                <Checkbox
                  checked={isNotNull}
                  onCheckedChange={(checked) => {
                    onIsNotNullChange(checked === true)
                    if (checked) onIsNullChange(false)
                  }}
                />
                <span className="text-sm flex-1 font-medium text-muted-foreground">Is NOT NULL</span>
              </label>
            </div>

            {/* Actions */}
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Actions:</div>
            {CMS_ACTIONS_OPTIONS.map((action) => (
              <label
                key={action}
                className="flex items-center space-x-2 cursor-pointer hover:bg-accent rounded px-2 py-1.5"
              >
                <Checkbox
                  checked={selectedActions.includes(action)}
                  onCheckedChange={() => handleToggleAction(action)}
                />
                <span className="text-sm flex-1 capitalize">{action}</span>
              </label>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function ContentTypeInferredFilterDropdown({
  searchValue,
  isNull,
  isNotNull,
  onSearchChange,
  onIsNullChange,
  onIsNotNullChange,
  disabled = false,
}: {
  searchValue: string
  isNull: boolean
  isNotNull: boolean
  onSearchChange: (value: string) => void
  onIsNullChange: (value: boolean) => void
  onIsNotNullChange: (value: boolean) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)

  const handleClear = () => {
    onSearchChange('')
    onIsNullChange(false)
    onIsNotNullChange(false)
  }

  const activeCount = (searchValue ? 1 : 0) + (isNull ? 1 : 0) + (isNotNull ? 1 : 0)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-full justify-between font-medium"
        >
          <span className="truncate">Content Type Inferred</span>
          <div className="flex items-center gap-1">
            {activeCount > 0 && (
              <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {activeCount}
              </Badge>
            )}
            <ChevronDown className="h-4 w-4" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-medium">Filter by Content Type Inferred</span>
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleClear}
            >
              Clear
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto p-3 space-y-3">
          {/* Text search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search (contains)</label>
            <div className="relative">
              <Input
                placeholder="Enter search term..."
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pr-8"
              />
              {searchValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-2"
                  onClick={() => onSearchChange('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Null filters */}
          <div className="space-y-1 border-t pt-2">
            <label className="flex items-center space-x-2 cursor-pointer hover:bg-accent rounded px-2 py-1.5">
              <Checkbox
                checked={isNull}
                onCheckedChange={(checked) => {
                  onIsNullChange(checked === true)
                  if (checked) onIsNotNullChange(false)
                }}
              />
              <span className="text-sm flex-1 font-medium text-muted-foreground">Is NULL</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer hover:bg-accent rounded px-2 py-1.5">
              <Checkbox
                checked={isNotNull}
                onCheckedChange={(checked) => {
                  onIsNotNullChange(checked === true)
                  if (checked) onIsNullChange(false)
                }}
              />
              <span className="text-sm flex-1 font-medium text-muted-foreground">Is NOT NULL</span>
            </label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function TextFilterDropdown({
  title,
  value,
  onChange,
}: {
  title: string
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-full justify-between font-medium"
        >
          <span className="truncate">{title}</span>
          <div className="flex items-center gap-1">
            {value && (
              <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                1
              </Badge>
            )}
            <ChevronDown className="h-4 w-4" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-3" align="start">
        <div className="space-y-2">
          <label className="text-sm font-medium">Search {title} (contains)</label>
          <div className="relative">
            <Input
              placeholder="Enter search term..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="pr-8"
            />
            {value && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => onChange('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function SortableColumnHeader({
  title,
  field,
  currentSortField,
  currentSortOrder,
  onSort,
}: {
  title: string
  field: SortField
  currentSortField: SortField | null
  currentSortOrder: SortOrder
  onSort: (field: SortField) => void
}) {
  const isActive = currentSortField === field

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2 font-medium hover:bg-transparent"
      onClick={() => onSort(field)}
    >
      <span>{title}</span>
      {isActive ? (
        currentSortOrder === 'asc' ? (
          <ArrowUp className="ml-1 h-3 w-3" />
        ) : (
          <ArrowDown className="ml-1 h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
      )}
    </Button>
  )
}

export default function ClassificationPage() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [inventoryIdSearch, setInventoryIdSearch] = useState('')
  const [nodeIdSearch, setNodeIdSearch] = useState('')
  const [annStageSearch, setAnnStageSearch] = useState('')
  const [contentTypeMachineSearch, setContentTypeMachineSearch] = useState('')
  const [contentTypeInferredSearch, setContentTypeInferredSearch] = useState('')
  const [contentTypeInferredIsNull, setContentTypeInferredIsNull] = useState(false)
  const [contentTypeInferredIsNotNull, setContentTypeInferredIsNotNull] = useState(false)
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([])
  const [selectedStages, setSelectedStages] = useState<string[]>([])
  const [contentMixIsNull, setContentMixIsNull] = useState(false)
  const [contentMixIsNotNull, setContentMixIsNotNull] = useState(false)
  const [selectedContentMixCategories, setSelectedContentMixCategories] = useState<string[]>([])
  const [cmsActionsIsNull, setCmsActionsIsNull] = useState(false)
  const [cmsActionsIsNotNull, setCmsActionsIsNotNull] = useState(false)
  const [selectedCmsActions, setSelectedCmsActions] = useState<string[]>([])
  const [selectedPdgFilter, setSelectedPdgFilter] = useState<PdgFilter>('all')
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)

  // Selection state for bulk actions
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [bulkCategory, setBulkCategory] = useState<string>('')
  const [bulkCmsAction, setBulkCmsAction] = useState<string>('')

  // Inline editing state
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<string>('')
  const [editingCmsAction, setEditingCmsAction] = useState<string>('')

  // Preview dialog state
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<{
    inventoryIds: string[]
    category?: string
    cmsAction?: string
    sqlQuery: string
  } | null>(null)

  // Content details sheet state
  const [showContentDetails, setShowContentDetails] = useState(false)
  const [selectedContentItem, setSelectedContentItem] = useState<ClassificationItem | null>(null)

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: filterOptions } = useQuery({
    queryKey: ['filter-options'],
    queryFn: fetchFilterOptions,
    staleTime: 1000 * 60 * 5,
  })

  const { data: stats } = useQuery({
    queryKey: ['classification-stats', selectedPdgFilter],
    queryFn: () => fetchClassificationStats(selectedPdgFilter),
    staleTime: 1000 * 60 * 1, // Refresh every minute
  })

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      'classification',
      page,
      limit,
      inventoryIdSearch,
      nodeIdSearch,
      annStageSearch,
      contentTypeMachineSearch,
      contentTypeInferredSearch,
      contentTypeInferredIsNull,
      contentTypeInferredIsNotNull,
      selectedLanguages,
      selectedPersonas,
      selectedStages,
      contentMixIsNull,
      contentMixIsNotNull,
      selectedContentMixCategories,
      cmsActionsIsNull,
      cmsActionsIsNotNull,
      selectedCmsActions,
      selectedPdgFilter,
      sortField,
      sortOrder,
    ],
    queryFn: () =>
      fetchClassificationData(
        page,
        limit,
        inventoryIdSearch,
        nodeIdSearch,
        annStageSearch,
        contentTypeMachineSearch,
        {
          search: contentTypeInferredSearch,
          isNull: contentTypeInferredIsNull,
          isNotNull: contentTypeInferredIsNotNull,
        },
        selectedLanguages,
        selectedPersonas,
        selectedStages,
        {
          isNull: contentMixIsNull,
          isNotNull: contentMixIsNotNull,
          categories: selectedContentMixCategories,
        },
        {
          isNull: cmsActionsIsNull,
          isNotNull: cmsActionsIsNotNull,
          actions: selectedCmsActions,
        },
        selectedPdgFilter,
        sortField,
        sortOrder
      ),
    staleTime: 1000 * 60 * 5,
  })

  const updateMutation = useMutation({
    mutationFn: ({ inventoryIds, category, cmsAction }: { inventoryIds: string[]; category?: string; cmsAction?: string }) =>
      updateClassification(inventoryIds, category, cmsAction),
    onMutate: async ({ inventoryIds, category, cmsAction }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['classification'] })

      // Snapshot previous value
      const previousData = queryClient.getQueryData([
        'classification',
        page,
        limit,
        inventoryIdSearch,
        nodeIdSearch,
        annStageSearch,
        contentTypeMachineSearch,
        contentTypeInferredSearch,
        contentTypeInferredIsNull,
        contentTypeInferredIsNotNull,
        selectedLanguages,
        selectedPersonas,
        selectedStages,
        contentMixIsNull,
        contentMixIsNotNull,
        selectedContentMixCategories,
        selectedPdgFilter,
        sortField,
        sortOrder,
      ])

      // Optimistically update the cache
      queryClient.setQueryData(
        [
          'classification',
          page,
          limit,
          inventoryIdSearch,
          nodeIdSearch,
          annStageSearch,
          contentTypeMachineSearch,
          contentTypeInferredSearch,
          contentTypeInferredIsNull,
          contentTypeInferredIsNotNull,
          selectedLanguages,
          selectedPersonas,
          selectedStages,
          contentMixIsNull,
          contentMixIsNotNull,
          selectedContentMixCategories,
          selectedPdgFilter,
          sortField,
          sortOrder,
        ],
        (old: ClassificationResponse | undefined) => {
          if (!old) return old
          return {
            ...old,
            items: old.items.map((item) =>
              inventoryIds.includes(item.inventory_id)
                ? {
                    ...item,
                    ...(category !== undefined && { content_mix_category: category }),
                    ...(cmsAction !== undefined && { cms_actions: cmsAction })
                  }
                : item
            ),
          }
        }
      )

      return { previousData }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          [
            'classification',
            page,
            limit,
            inventoryIdSearch,
            nodeIdSearch,
            annStageSearch,
            contentTypeMachineSearch,
            contentTypeInferredSearch,
            contentTypeInferredIsNull,
            contentTypeInferredIsNotNull,
            selectedLanguages,
            selectedPersonas,
            selectedStages,
            contentMixIsNull,
            contentMixIsNotNull,
            selectedContentMixCategories,
            selectedPdgFilter,
            sortField,
            sortOrder,
          ],
          context.previousData
        )
      }
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update classification',
        variant: 'destructive',
      })
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Classification updated',
        description: `Successfully updated ${variables.inventoryIds.length} ${variables.inventoryIds.length === 1 ? 'item' : 'items'}`,
      })
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['classification'] })
      queryClient.invalidateQueries({ queryKey: ['classification-stats'] })
    },
  })

  const activeFilterCount =
    (inventoryIdSearch ? 1 : 0) +
    (nodeIdSearch ? 1 : 0) +
    (annStageSearch ? 1 : 0) +
    (contentTypeMachineSearch ? 1 : 0) +
    selectedLanguages.length +
    selectedPersonas.length +
    selectedStages.length +
    (contentMixIsNull ? 1 : 0) +
    (contentMixIsNotNull ? 1 : 0) +
    selectedContentMixCategories.length +
    (cmsActionsIsNull ? 1 : 0) +
    (cmsActionsIsNotNull ? 1 : 0) +
    selectedCmsActions.length +
    (selectedPdgFilter !== 'all' ? 1 : 0)

  const handleClearAllFilters = () => {
    setInventoryIdSearch('')
    setNodeIdSearch('')
    setAnnStageSearch('')
    setContentTypeMachineSearch('')
    setSelectedLanguages([])
    setSelectedPersonas([])
    setSelectedStages([])
    setContentMixIsNull(false)
    setContentMixIsNotNull(false)
    setSelectedContentMixCategories([])
    setCmsActionsIsNull(false)
    setCmsActionsIsNotNull(false)
    setSelectedCmsActions([])
    setSelectedPdgFilter('all')
    setPage(1)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortOrder === 'asc') {
        setSortOrder('desc')
      } else if (sortOrder === 'desc') {
        setSortField(null)
        setSortOrder(null)
      }
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
    setPage(1)
  }

  // Selection handlers
  const toggleSelectItem = (inventoryId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(inventoryId)) {
        newSet.delete(inventoryId)
      } else {
        newSet.add(inventoryId)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (!data?.items) return

    const currentPageIds = data.items.map(item => item.inventory_id)
    const allSelected = currentPageIds.every(id => selectedItems.has(id))

    if (allSelected) {
      // Deselect all on current page
      setSelectedItems(prev => {
        const newSet = new Set(prev)
        currentPageIds.forEach(id => newSet.delete(id))
        return newSet
      })
    } else {
      // Select all on current page
      setSelectedItems(prev => {
        const newSet = new Set(prev)
        currentPageIds.forEach(id => newSet.add(id))
        return newSet
      })
    }
  }

  const isAllSelected = () => {
    if (!data?.items || data.items.length === 0) return false
    return data.items.every(item => selectedItems.has(item.inventory_id))
  }

  const clearSelection = () => {
    setSelectedItems(new Set())
  }

  // Generate SQL preview query
  const generateSqlQuery = (inventoryIds: string[], category?: string, cmsAction?: string): string => {
    const timestamp = new Date().toISOString()
    const idsString = inventoryIds.map(id => `'${id}'`).join(', ')

    const updates: string[] = []

    if (category) {
      updates.push(`  content_mix_category = '${category}'`)
      updates.push(`  content_mix_source = 'manual'`)
      updates.push(`  content_mix_assigned_by = 'Bernhard'`)
      updates.push(`  content_mix_assigned_at = '${timestamp}'`)
    }

    if (cmsAction) {
      updates.push(`  cms_actions = '${cmsAction}'`)
      updates.push(`  cms_actions_updated_at = '${timestamp}'`)
    }

    return `UPDATE content_inventory
SET
${updates.join(',\n')}
WHERE
  inventory_id IN (${idsString});

-- Affected rows: ${inventoryIds.length}`
  }

  // Show preview dialog
  const showUpdatePreview = (inventoryIds: string[], category?: string, cmsAction?: string) => {
    const sqlQuery = generateSqlQuery(inventoryIds, category, cmsAction)
    setPreviewData({ inventoryIds, category, cmsAction, sqlQuery })
    setShowPreview(true)
  }

  // Execute the actual update after confirmation
  const executeUpdate = () => {
    if (!previewData) return

    updateMutation.mutate({
      inventoryIds: previewData.inventoryIds,
      category: previewData.category,
      cmsAction: previewData.cmsAction,
    })

    // Close preview
    setShowPreview(false)
    setPreviewData(null)

    // Clear selection and reset bulk category after successful update
    if (previewData.inventoryIds.length > 1) {
      clearSelection()
      setBulkCategory('')
      setBulkCmsAction('')
    } else {
      setEditingItemId(null)
    }
  }

  const handleBulkUpdate = () => {
    if ((!bulkCategory && !bulkCmsAction) || selectedItems.size === 0) return
    showUpdatePreview(Array.from(selectedItems), bulkCategory, bulkCmsAction)
  }

  const handleInlineUpdate = (inventoryId: string, category?: string, cmsAction?: string) => {
    showUpdatePreview([inventoryId], category, cmsAction)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manual Classification</h1>
          <p className="text-muted-foreground mt-2">
            Classify content into strategic categories for portfolio analysis
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <div className="text-2xl font-bold">{data?.total.toLocaleString() || '0'}</div>
            <div className="text-xs text-muted-foreground">
              {activeFilterCount > 0 ? 'Filtered Assets' : 'Total Published Assets'}
            </div>
          </div>
          {activeFilterCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearAllFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear all filters ({activeFilterCount})
            </Button>
          )}
        </div>
      </div>

      {/* PDG Filter and Results Per Page */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">PDG Assets:</label>
              <div className="flex gap-2">
                <Button
                  variant={selectedPdgFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedPdgFilter('all')
                    setPage(1)
                  }}
                >
                  All
                </Button>
                <Button
                  variant={selectedPdgFilter === 'only' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedPdgFilter('only')
                    setPage(1)
                  }}
                >
                  PDG Only
                </Button>
                <Button
                  variant={selectedPdgFilter === 'exclude' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedPdgFilter('exclude')
                    setPage(1)
                  }}
                >
                  Exclude PDG
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Results per page:</label>
              <Select
                value={limit.toString()}
                onValueChange={(value) => {
                  setLimit(parseInt(value))
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="150">150</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classification Progress */}
      {stats && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Classification Progress</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats.classified.toLocaleString()} of {stats.total.toLocaleString()} assets classified
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="default" className="px-3">
                    Classified: {stats.classified.toLocaleString()}
                  </Badge>
                  <Badge variant="secondary" className="px-3">
                    Unclassified: {stats.unclassified.toLocaleString()}
                  </Badge>
                </div>
              </div>
              <div className="relative">
                <Progress value={stats.percentage} className="h-3" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-foreground mix-blend-difference">
                    {stats.percentage}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Action Bar */}
      {selectedItems.size > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedItems.size} {selectedItems.size === 1 ? 'item' : 'items'} selected
                </span>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground">Set Category:</label>
                  <Select value={bulkCategory} onValueChange={setBulkCategory}>
                    <SelectTrigger className="w-[280px]">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_MIX_OPTIONS.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground">Set CMS Action:</label>
                  <Select value={bulkCmsAction} onValueChange={setBulkCmsAction}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select action..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CMS_ACTIONS_OPTIONS.map((action) => (
                        <SelectItem key={action} value={action}>
                          <span className="capitalize">{action}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleBulkUpdate}
                  disabled={(!bulkCategory && !bulkCmsAction) || updateMutation.isPending}
                  size="sm"
                >
                  {updateMutation.isPending ? 'Applying...' : 'Apply'}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-lg border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b">
                  {/* Checkbox Column */}
                  <TableHead className="h-12 px-2 w-[50px]">
                    <Checkbox
                      checked={isAllSelected()}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="h-12 px-2 w-[90px]">
                    <TextFilterDropdown
                      title="Inventory ID"
                      value={inventoryIdSearch}
                      onChange={setInventoryIdSearch}
                    />
                  </TableHead>
                  <TableHead className="h-12 px-2 w-[80px]">
                    <div className="flex items-center gap-1">
                      <TextFilterDropdown
                        title="Node ID"
                        value={nodeIdSearch}
                        onChange={setNodeIdSearch}
                      />
                      <SortableColumnHeader
                        title=""
                        field="node_id"
                        currentSortField={sortField}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                      />
                    </div>
                  </TableHead>
                  <TableHead className="h-12 px-2 w-[90px]">
                    <div className="flex items-center gap-1">
                      <TextFilterDropdown
                        title="PDG Stage"
                        value={annStageSearch}
                        onChange={setAnnStageSearch}
                      />
                      <SortableColumnHeader
                        title=""
                        field="ann_stage"
                        currentSortField={sortField}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                      />
                    </div>
                  </TableHead>
                  <TableHead className="h-12 px-2 w-[70px]">
                    <div className="flex items-center gap-1">
                      <ColumnFilterDropdown
                        title="Lang"
                        options={filterOptions?.languages || []}
                        selectedValues={selectedLanguages}
                        onSelect={setSelectedLanguages}
                        disabled={!filterOptions}
                      />
                      <SortableColumnHeader
                        title=""
                        field="language"
                        currentSortField={sortField}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                      />
                    </div>
                  </TableHead>
                  <TableHead className="h-12 px-2">
                    <SortableColumnHeader
                      title="Title"
                      field="title"
                      currentSortField={sortField}
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead className="h-12 px-2 w-[220px]">
                    <div className="flex items-center gap-1">
                      <ColumnFilterDropdown
                        title="Persona"
                        options={filterOptions?.personas.map(p => p.persona) || []}
                        selectedValues={selectedPersonas}
                        onSelect={setSelectedPersonas}
                        disabled={!filterOptions}
                      />
                      <SortableColumnHeader
                        title=""
                        field="persona"
                        currentSortField={sortField}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                      />
                    </div>
                  </TableHead>
                  <TableHead className="h-12 px-2 w-[180px]">
                    <div className="flex items-center gap-1">
                      <ColumnFilterDropdown
                        title="Stage"
                        options={filterOptions?.stages.map(s => s.stage) || []}
                        selectedValues={selectedStages}
                        onSelect={setSelectedStages}
                        disabled={!filterOptions}
                      />
                      <SortableColumnHeader
                        title=""
                        field="stage"
                        currentSortField={sortField}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                      />
                    </div>
                  </TableHead>
                  <TableHead className="h-12 px-2 w-[200px]">
                    <div className="flex items-center gap-1">
                      <TextFilterDropdown
                        title="Content Type"
                        value={contentTypeMachineSearch}
                        onChange={setContentTypeMachineSearch}
                      />
                      <SortableColumnHeader
                        title=""
                        field="content_type_machine"
                        currentSortField={sortField}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                      />
                    </div>
                  </TableHead>
                  <TableHead className="h-12 px-2 w-[220px]">
                    <ContentTypeInferredFilterDropdown
                      searchValue={contentTypeInferredSearch}
                      isNull={contentTypeInferredIsNull}
                      isNotNull={contentTypeInferredIsNotNull}
                      onSearchChange={setContentTypeInferredSearch}
                      onIsNullChange={setContentTypeInferredIsNull}
                      onIsNotNullChange={setContentTypeInferredIsNotNull}
                    />
                  </TableHead>
                  <TableHead className="h-12 px-2 w-[240px]">
                    <div className="flex items-center gap-1">
                      <ContentMixFilterDropdown
                        categories={filterOptions?.contentMixCategories || []}
                        isNull={contentMixIsNull}
                        isNotNull={contentMixIsNotNull}
                        selectedCategories={selectedContentMixCategories}
                        onIsNullChange={setContentMixIsNull}
                        onIsNotNullChange={setContentMixIsNotNull}
                        onCategoriesChange={setSelectedContentMixCategories}
                        disabled={!filterOptions}
                      />
                      <SortableColumnHeader
                        title=""
                        field="content_mix_category"
                        currentSortField={sortField}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                      />
                    </div>
                  </TableHead>
                  <TableHead className="h-12 px-2 w-[200px]">
                    <CmsActionsFilterDropdown
                      isNull={cmsActionsIsNull}
                      isNotNull={cmsActionsIsNotNull}
                      selectedActions={selectedCmsActions}
                      onIsNullChange={setCmsActionsIsNull}
                      onIsNotNullChange={setCmsActionsIsNotNull}
                      onActionsChange={setSelectedCmsActions}
                    />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={12} className="h-24 text-center">
                      <div className="flex items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {isError && (
                  <TableRow>
                    <TableCell colSpan={12} className="h-24 text-center text-destructive">
                      Error loading data. Please try again.
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && !isError && data?.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={12} className="h-24 text-center text-muted-foreground">
                      No content found
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && !isError && data?.items.map((item) => {
                  const persona = item.content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping
                  return (
                    <TableRow key={item.inventory_id} className="hover:bg-muted/50">
                      {/* Checkbox Cell */}
                      <TableCell className="h-16 px-2">
                        <Checkbox
                          checked={selectedItems.has(item.inventory_id)}
                          onCheckedChange={() => toggleSelectItem(item.inventory_id)}
                          aria-label={`Select ${item.title || item.node_id}`}
                        />
                      </TableCell>
                      <TableCell className="h-16 px-4 font-mono text-xs">
                        {item.inventory_id}
                      </TableCell>
                      <TableCell className="h-16 px-4 font-mono text-xs">
                        {item.node_id}
                      </TableCell>
                      <TableCell className="h-16 px-4">
                        {item.ann_stage ? (
                          <span className="text-sm">{item.ann_stage}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="h-16 px-4">
                        <Badge variant="outline">{item.language.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell className="h-16 px-4 max-w-[300px]">
                        <div className="flex items-center gap-2">
                          <span className="truncate flex-1">
                            {item.title || <span className="text-muted-foreground text-xs">No title</span>}
                          </span>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {item.url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                  window.open(item.url!, '_blank', 'noopener,noreferrer')
                                }}
                                title="Open in new window"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => {
                                setSelectedContentItem(item)
                                setShowContentDetails(true)
                              }}
                              title="View content details"
                            >
                              <Info className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="h-16 px-4">
                        {persona?.persona_primary_label ? (
                          <span className="text-sm">{persona.persona_primary_label}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell className="h-16 px-4">
                        {persona?.buying_stage ? (
                          <Badge variant="secondary">{persona.buying_stage}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="h-16 px-4">
                        {item.content_type_machine ? (
                          <span className="text-sm">{item.content_type_machine}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="h-16 px-4">
                        {persona?.content_type_inferred ? (
                          <span className="text-sm">{persona.content_type_inferred}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="h-16 px-4">
                        {editingItemId === item.inventory_id ? (
                          <Select
                            value={editingCategory}
                            onValueChange={(value) => {
                              handleInlineUpdate(item.inventory_id, value)
                            }}
                            disabled={updateMutation.isPending}
                          >
                            <SelectTrigger className="w-[280px]">
                              <SelectValue placeholder="Select category..." />
                            </SelectTrigger>
                            <SelectContent>
                              {CONTENT_MIX_OPTIONS.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div
                            className="cursor-pointer hover:bg-accent/50 rounded px-2 py-1 -mx-2 -my-1"
                            onClick={() => {
                              setEditingItemId(item.inventory_id)
                              setEditingCategory(item.content_mix_category || '')
                            }}
                          >
                            {item.content_mix_category ? (
                              <Badge>{item.content_mix_category}</Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">Not classified</span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="h-16 px-4">
                        {editingItemId === item.inventory_id && editingCmsAction !== undefined ? (
                          <Select
                            value={editingCmsAction}
                            onValueChange={(value) => {
                              handleInlineUpdate(item.inventory_id, undefined, value)
                            }}
                            disabled={updateMutation.isPending}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select action..." />
                            </SelectTrigger>
                            <SelectContent>
                              {CMS_ACTIONS_OPTIONS.map((action) => (
                                <SelectItem key={action} value={action}>
                                  <span className="capitalize">{action}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div
                            className="cursor-pointer hover:bg-accent/50 rounded px-2 py-1 -mx-2 -my-1"
                            onClick={() => {
                              setEditingItemId(item.inventory_id)
                              setEditingCmsAction(item.cms_actions || '')
                            }}
                          >
                            {item.cms_actions ? (
                              <Badge variant="outline" className="capitalize">{item.cms_actions}</Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">Not set</span>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.total)} of {data.total} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="text-sm font-medium">
                  Page {page} of {data.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SQL Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Confirm Update</DialogTitle>
            <DialogDescription>
              Review the SQL query that will be executed. This will update{' '}
              <span className="font-semibold">{previewData?.inventoryIds.length || 0}</span>{' '}
              {previewData?.inventoryIds.length === 1 ? 'item' : 'items'}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-y-auto min-h-0">
            <div>
              <label className="text-sm font-medium">SQL Query:</label>
              <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap break-words">
                {previewData?.sqlQuery}
              </pre>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowPreview(false)
                setPreviewData(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={executeUpdate}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Updating...' : 'Confirm & Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Content Details Sheet */}
      <Sheet open={showContentDetails} onOpenChange={setShowContentDetails}>
        <SheetContent side="right" className="w-[800px] sm:w-[900px] sm:max-w-[50vw] overflow-y-auto">
          {selectedContentItem && (
            <>
              <SheetHeader className="space-y-4 pb-6">
                <div className="space-y-2">
                  <SheetTitle className="text-2xl font-bold leading-tight">
                    {selectedContentItem.title || 'Untitled Content'}
                  </SheetTitle>
                  {selectedContentItem.url && (
                    <a
                      href={selectedContentItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                    >
                      {selectedContentItem.url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedContentItem.is_pdg_program_content && (
                    <Badge variant="default">PDG</Badge>
                  )}
                  {selectedContentItem.is_content_gated && (
                    <Badge variant="secondary">Gated</Badge>
                  )}
                  {selectedContentItem.is_nurture_content && (
                    <Badge variant="secondary">Nurture</Badge>
                  )}
                  {selectedContentItem.content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping?.persona_primary_label && (
                    <Badge variant="outline">
                      {selectedContentItem.content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping.persona_primary_label}
                    </Badge>
                  )}
                  {selectedContentItem.content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping?.buying_stage && (
                    <Badge variant="outline">
                      {selectedContentItem.content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping.buying_stage}
                    </Badge>
                  )}
                  {selectedContentItem.content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping?.model_name && (
                    <Badge variant="outline">
                      {selectedContentItem.content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping.model_name}
                    </Badge>
                  )}
                </div>
              </SheetHeader>

              <div className="space-y-6">
                {/* Content Information */}
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide">Content Information</h3>

                    {selectedContentItem.content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping?.key_pain_point && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Key Pain Points</h4>
                        <p className="text-sm leading-relaxed">
                          {selectedContentItem.content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping.key_pain_point}
                        </p>
                      </div>
                    )}

                    {selectedContentItem.content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping?.rationale && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Rationale</h4>
                        <p className="text-sm leading-relaxed">
                          {selectedContentItem.content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping.rationale}
                        </p>
                      </div>
                    )}

                    {selectedContentItem.content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping?.content_type_inferred && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Content Type Inferred</h4>
                        <p className="text-sm">
                          {selectedContentItem.content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping.content_type_inferred}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Additional Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Node ID</span>
                    <span className="font-mono">{selectedContentItem.node_id}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Inventory ID</span>
                    <span className="font-mono">{selectedContentItem.inventory_id}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Language</span>
                    <Badge variant="outline">{selectedContentItem.language.toUpperCase()}</Badge>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">PDG Stage</span>
                    <span>{selectedContentItem.ann_stage || '-'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Content Type (Machine)</span>
                    <span>{selectedContentItem.content_type_machine || '-'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Content Mix Category</span>
                    {selectedContentItem.content_mix_category ? (
                      <Badge>{selectedContentItem.content_mix_category}</Badge>
                    ) : (
                      <span className="text-muted-foreground">Not classified</span>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
