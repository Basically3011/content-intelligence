'use client'

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Library, Grid3x3, List, AlertCircle } from "lucide-react";
import { useContentItems } from "@/lib/hooks/use-content-items";
import { useFilterOptions } from "@/lib/hooks/use-filter-options";
import { ContentCard, ContentCardSkeleton } from "@/components/features/library/content-card";
import { ContentFilters } from "@/components/features/library/content-filters";
import { ToggleFilters } from "@/components/features/library/toggle-filters";
import { Pagination } from "@/components/features/library/pagination";
import { DateRangeFilter, type DateField, type DateRangePreset, type DateRange, getDateRangeForPreset } from "@/components/features/library/date-range-filter";
import { PdgStageFilter } from "@/components/features/library/pdg-stage-filter";
import { ContentMixFilter } from "@/components/features/library/content-mix-filter";
import { ContentDetailSheet } from "@/components/features/library/content-detail-sheet";
import { PersonasPopover, StagesPopover, MultiSelectPopover } from "@/components/features/library/advanced-filters";
import type { ContentItem } from "@/lib/api-client";

type ViewMode = 'grid' | 'list'

export default function LibraryPage() {
  const searchParams = useSearchParams()

  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Advanced filters
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([])
  const [selectedStages, setSelectedStages] = useState<string[]>([])
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])

  // Toggle filters - Program Flags
  const [showGatedOnly, setShowGatedOnly] = useState(false)
  const [showNurtureOnly, setShowNurtureOnly] = useState(false)
  const [showPdgOnly, setShowPdgOnly] = useState(false)

  // Sorting
  const [sortBy, setSortBy] = useState<'cms_created_at' | 'cms_updated_at'>('cms_updated_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Date Range Filter
  const [dateField, setDateField] = useState<DateField>('cms_updated_at')
  const [datePreset, setDatePreset] = useState<DateRangePreset | undefined>()
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>()

  // PDG Stage Filter
  const [selectedPdgStages, setSelectedPdgStages] = useState<string[]>([])
  const [pdgStageIsNull, setPdgStageIsNull] = useState(false)
  const [pdgStageIsNotNull, setPdgStageIsNotNull] = useState(false)

  // Content Mix Category Filter
  const [selectedContentMixCategories, setSelectedContentMixCategories] = useState<string[]>([])
  const [contentMixIsNull, setContentMixIsNull] = useState(false)
  const [contentMixIsNotNull, setContentMixIsNotNull] = useState(false)

  const limit = 12

  // Read URL parameters and set filters on initial load
  useEffect(() => {
    const persona = searchParams.get('persona')
    const stage = searchParams.get('stage')
    const language = searchParams.get('language')
    const pdg = searchParams.get('pdg')
    const contentMixCategories = searchParams.get('content_mix_categories')
    const contentMixIsNullParam = searchParams.get('content_mix_is_null')
    const contentMixIsNotNullParam = searchParams.get('content_mix_is_not_null')

    if (persona) {
      setSelectedPersonas([persona])
    }
    if (stage) {
      setSelectedStages([stage])
    }
    if (language) {
      setSelectedLanguages([language])
    }
    if (pdg !== null) {
      setShowPdgOnly(pdg === 'true')
    }
    // Content Mix Category filters from URL
    if (contentMixCategories) {
      setSelectedContentMixCategories(contentMixCategories.split(','))
    }
    if (contentMixIsNullParam === 'true') {
      setContentMixIsNull(true)
    }
    if (contentMixIsNotNullParam === 'true') {
      setContentMixIsNotNull(true)
    }
  }, [searchParams])

  // Fetch filter options
  const { data: filterOptions, isLoading: filterOptionsLoading } = useFilterOptions()

  // Calculate actual date range from preset or custom
  const activeDateRange = datePreset
    ? (datePreset === 'custom' ? customDateRange : getDateRangeForPreset(datePreset))
    : undefined

  // Fetch content with all filters
  const { data, isLoading, error } = useContentItems({
    page,
    limit,
    search: search || undefined,
    personas: selectedPersonas.length > 0 ? selectedPersonas : undefined,
    buying_stages: selectedStages.length > 0 ? selectedStages : undefined,
    content_types: selectedContentTypes.length > 0 ? selectedContentTypes : undefined,
    languages: selectedLanguages.length > 0 ? selectedLanguages : undefined,

    // Program Flags (only pass if true to filter)
    is_gated: showGatedOnly ? true : undefined,
    is_nurture: showNurtureOnly ? true : undefined,
    is_pdg: showPdgOnly ? true : undefined,

    // Always show published content
    is_published: true,

    // Date Range
    date_field: activeDateRange ? dateField : undefined,
    date_from: activeDateRange?.from,
    date_to: activeDateRange?.to,

    // PDG Stage
    pdg_stages: selectedPdgStages.length > 0 ? selectedPdgStages : undefined,
    pdg_stage_is_null: pdgStageIsNull ? true : undefined,
    pdg_stage_is_not_null: pdgStageIsNotNull ? true : undefined,

    // Content Mix Category
    content_mix_categories: selectedContentMixCategories.length > 0 ? selectedContentMixCategories : undefined,
    content_mix_is_null: contentMixIsNull ? true : undefined,
    content_mix_is_not_null: contentMixIsNotNull ? true : undefined,

    // Sorting
    sort_by: sortBy,
    sort_order: sortOrder,
  })

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1) // Reset to first page on search
  }

  const handleClearSearch = () => {
    setSearch('')
    setPage(1)
  }

  const handleClearAllFilters = () => {
    setSelectedPersonas([])
    setSelectedStages([])
    setSelectedContentTypes([])
    setSelectedLanguages([])
    setShowGatedOnly(false)
    setShowNurtureOnly(false)
    setShowPdgOnly(false)
    setDatePreset(undefined)
    setCustomDateRange(undefined)
    setSelectedPdgStages([])
    setPdgStageIsNull(false)
    setPdgStageIsNotNull(false)
    setSelectedContentMixCategories([])
    setContentMixIsNull(false)
    setContentMixIsNotNull(false)
    setPage(1)
  }

  const handleClearDateRange = () => {
    setDatePreset(undefined)
    setCustomDateRange(undefined)
    setPage(1)
  }

  const handleItemClick = (item: ContentItem) => {
    setSelectedItem(item)
    setSheetOpen(true)
  }

  const handlePreviousItem = () => {
    if (!data || !selectedItem) return
    const currentIndex = data.items.findIndex(
      item => item.inventory_id === selectedItem.inventory_id
    )
    if (currentIndex > 0) {
      setSelectedItem(data.items[currentIndex - 1])
    }
  }

  const handleNextItem = () => {
    if (!data || !selectedItem) return
    const currentIndex = data.items.findIndex(
      item => item.inventory_id === selectedItem.inventory_id
    )
    if (currentIndex < data.items.length - 1) {
      setSelectedItem(data.items[currentIndex + 1])
    }
  }

  const currentItemIndex = data && selectedItem
    ? data.items.findIndex(item => item.inventory_id === selectedItem.inventory_id)
    : -1

  const hasPreviousItem = currentItemIndex > 0
  const hasNextItem = data ? currentItemIndex < data.items.length - 1 : false

  const hasActiveFilters =
    selectedPersonas.length > 0 ||
    selectedStages.length > 0 ||
    selectedContentTypes.length > 0 ||
    selectedLanguages.length > 0 ||
    showGatedOnly ||
    showNurtureOnly ||
    showPdgOnly ||
    datePreset !== undefined ||
    selectedPdgStages.length > 0 ||
    pdgStageIsNull ||
    pdgStageIsNotNull ||
    selectedContentMixCategories.length > 0 ||
    contentMixIsNull ||
    contentMixIsNotNull

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Library className="h-7 w-7 text-brand" />
          <div>
            <h1 className="text-2xl font-bold">Library</h1>
            <p className="text-sm text-muted-foreground">
              Browse and manage your content repository
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <ContentFilters
              search={search}
              onSearchChange={handleSearchChange}
              onClear={handleClearSearch}
            />

            {/* Filter Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Column 1: Taxonomy & Classification */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Taxonomy & Classification
                </h4>
                <div className="flex flex-wrap gap-2">
                  <MultiSelectPopover
                    label="ANN Content Type"
                    options={filterOptions?.contentTypes || []}
                    selected={selectedContentTypes}
                    onChange={(types) => {
                      setSelectedContentTypes(types)
                      setPage(1)
                    }}
                    isLoading={filterOptionsLoading}
                  />
                  <ContentMixFilter
                    categories={filterOptions?.contentMixCategories || []}
                    selectedCategories={selectedContentMixCategories}
                    isNull={contentMixIsNull}
                    isNotNull={contentMixIsNotNull}
                    onCategoriesChange={(categories) => {
                      setSelectedContentMixCategories(categories)
                      setPage(1)
                    }}
                    onIsNullChange={(isNull) => {
                      setContentMixIsNull(isNull)
                      setPage(1)
                    }}
                    onIsNotNullChange={(isNotNull) => {
                      setContentMixIsNotNull(isNotNull)
                      setPage(1)
                    }}
                    isLoading={filterOptionsLoading}
                  />
                  <ToggleFilters
                    showGatedOnly={showGatedOnly}
                    onShowGatedOnlyChange={(value) => {
                      setShowGatedOnly(value)
                      setPage(1)
                    }}
                    showNurtureOnly={showNurtureOnly}
                    onShowNurtureOnlyChange={(value) => {
                      setShowNurtureOnly(value)
                      setPage(1)
                    }}
                    showPdgOnly={showPdgOnly}
                    onShowPdgOnlyChange={(value) => {
                      setShowPdgOnly(value)
                      setPage(1)
                    }}
                  />
                  <PdgStageFilter
                    stages={filterOptions?.pdgStages || []}
                    selectedStages={selectedPdgStages}
                    isNull={pdgStageIsNull}
                    isNotNull={pdgStageIsNotNull}
                    onStagesChange={(stages) => {
                      setSelectedPdgStages(stages)
                      setPage(1)
                    }}
                    onIsNullChange={(isNull) => {
                      setPdgStageIsNull(isNull)
                      setPage(1)
                    }}
                    onIsNotNullChange={(isNotNull) => {
                      setPdgStageIsNotNull(isNotNull)
                      setPage(1)
                    }}
                    isLoading={filterOptionsLoading}
                  />
                  <MultiSelectPopover
                    label="Language"
                    options={filterOptions?.languages || []}
                    selected={selectedLanguages}
                    onChange={(langs) => {
                      setSelectedLanguages(langs)
                      setPage(1)
                    }}
                    isLoading={filterOptionsLoading}
                  />
                </div>
              </div>

              {/* Column 2: Persona & Stages */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Persona & Stages
                </h4>
                <div className="flex flex-wrap gap-2">
                  <PersonasPopover
                    label="Persona"
                    personas={filterOptions?.personas || []}
                    selected={selectedPersonas}
                    onChange={(personas) => {
                      setSelectedPersonas(personas)
                      setPage(1)
                    }}
                    isLoading={filterOptionsLoading}
                  />
                  <StagesPopover
                    label="Buying Stage"
                    stages={filterOptions?.stages || []}
                    selected={selectedStages}
                    onChange={(stages) => {
                      setSelectedStages(stages)
                      setPage(1)
                    }}
                    isLoading={filterOptionsLoading}
                  />
                </div>
              </div>

              {/* Column 3: Date */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Date
                </h4>
                <div className="flex flex-wrap gap-2">
                  <DateRangeFilter
                    selectedField={dateField}
                    selectedPreset={datePreset}
                    customRange={customDateRange}
                    onFieldChange={(field) => {
                      setDateField(field)
                      setPage(1)
                    }}
                    onPresetChange={(preset) => {
                      setDatePreset(preset)
                      setPage(1)
                    }}
                    onCustomRangeChange={(range) => {
                      setCustomDateRange(range)
                      setPage(1)
                    }}
                    onClear={handleClearDateRange}
                  />
                </div>
              </div>
            </div>

            {/* Clear All Filters */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllFilters}
                  className="text-xs"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Error Loading Content</CardTitle>
            </div>
            <CardDescription>
              Failed to load content items. Please try again.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Results Info */}
      {data && !isLoading && (
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div>
            Showing {data.items.length > 0 ? ((page - 1) * limit) + 1 : 0} - {Math.min(page * limit, data.total)} of {data.total.toLocaleString()} items
          </div>
          <div className="flex gap-2">
            {search && (
              <span>
                Search: <strong className="text-foreground">{search}</strong>
              </span>
            )}
            {hasActiveFilters && (
              <span>
                • <strong className="text-foreground">
                  {selectedPersonas.length + selectedStages.length + selectedContentTypes.length + selectedLanguages.length}
                </strong> filter{(selectedPersonas.length + selectedStages.length + selectedContentTypes.length + selectedLanguages.length) > 1 ? 's' : ''} active
              </span>
            )}
          </div>
        </div>
      )}

      {/* Content Grid/List */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
          {Array.from({ length: limit }).map((_, i) => (
            <ContentCardSkeleton key={i} viewMode={viewMode} />
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
          {data.items.map((item) => (
            <ContentCard
              key={item.inventory_id}
              item={item}
              viewMode={viewMode}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Library className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No content found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              {search || hasActiveFilters
                ? 'No content items match your filters. Try adjusting your search or filters.'
                : 'No content items available. Check your database connection.'}
            </p>
            {(search || hasActiveFilters) && (
              <div className="flex gap-2 mt-4">
                {search && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearSearch}
                  >
                    Clear search
                  </Button>
                )}
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllFilters}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <Pagination
              currentPage={page}
              totalPages={data.totalPages}
              onPageChange={setPage}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      )}

      {/* Content Detail Sheet */}
      <ContentDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        item={selectedItem}
        onPrevious={handlePreviousItem}
        onNext={handleNextItem}
        hasPrevious={hasPreviousItem}
        hasNext={hasNextItem}
      />
    </div>
  );
}
