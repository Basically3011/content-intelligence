# CMS Actions Implementation - Code Snippets

Diese Datei enthält alle Code-Änderungen, die für die vollständige CMS Actions Integration benötigt werden.

## 1. State-Variablen hinzufügen (nach Zeile 655)

```typescript
// CMS Actions filter state
const [cmsActionsIsNull, setCmsActionsIsNull] = useState(false)
const [cmsActionsIsNotNull, setCmsActionsIsNotNull] = useState(false)
const [selectedCmsActions, setSelectedCmsActions] = useState<string[]>([])

// Editing state for CMS Actions
const [editingCmsAction, setEditingCmsAction] = useState<string>('')
```

## 2. fetchClassificationData Signature erweitern (Zeile 132-155)

Füge Parameter hinzu:
```typescript
async function fetchClassificationData(
  // ... existing parameters
  contentMixFilter: {
    isNull?: boolean
    isNotNull?: boolean
    categories: string[]
  },
  cmsActionsFilter: {        // NEU
    isNull?: boolean
    isNotNull?: boolean
    actions: string[]
  },
  pdgFilter: PdgFilter,
  sortField: SortField | null,
  sortOrder: SortOrder
): Promise<ClassificationResponse> {
  // ... existing params code

  // Add CMS Actions filter params
  if (cmsActionsFilter.isNull) params.set('cms_actions_is_null', 'true')
  if (cmsActionsFilter.isNotNull) params.set('cms_actions_is_not_null', 'true')
  if (cmsActionsFilter.actions.length) params.set('cms_actions', cmsActionsFilter.actions.join(','))

  // ... rest of function
}
```

## 3. updateClassification Function erweitern (Zeile 188-208)

```typescript
async function updateClassification(
  inventoryIds: string[],
  category?: string,
  cmsAction?: string
) {
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
```

## 4. Query Keys erweitern (Zeile 702)

Füge zu queryKey array hinzu:
```typescript
const { data, isLoading, isError } = useQuery({
  queryKey: [
    'classification',
    // ... existing keys
    contentMixIsNull,
    contentMixIsNotNull,
    selectedContentMixCategories,
    cmsActionsIsNull,        // NEU
    cmsActionsIsNotNull,      // NEU
    selectedCmsActions,       // NEU
    selectedPdgFilter,
    sortField,
    sortOrder,
  ],
  queryFn: () =>
    fetchClassificationData(
      // ... existing params
      {
        isNull: contentMixIsNull,
        isNotNull: contentMixIsNotNull,
        categories: selectedContentMixCategories,
      },
      {                        // NEU
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
```

## 5. Active Filter Count erweitern (Zeile 858)

```typescript
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
  (cmsActionsIsNull ? 1 : 0) +          // NEU
  (cmsActionsIsNotNull ? 1 : 0) +       // NEU
  selectedCmsActions.length +            // NEU
  (selectedPdgFilter !== 'all' ? 1 : 0)
```

## 6. handleClearAllFilters erweitern (Zeile 871)

```typescript
const handleClearAllFilters = () => {
  // ... existing clears
  setContentMixIsNull(false)
  setContentMixIsNotNull(false)
  setSelectedContentMixCategories([])
  setCmsActionsIsNull(false)          // NEU
  setCmsActionsIsNotNull(false)       // NEU
  setSelectedCmsActions([])           // NEU
  setSelectedPdgFilter('all')
  setPage(1)
}
```

## 7. Bulk State Variablen (nach Zeile 648)

```typescript
const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
const [bulkCategory, setBulkCategory] = useState<string>('')
const [bulkCmsAction, setBulkCmsAction] = useState<string>('')  // NEU
```

## 8. Bulk Action Bar UI erweitern (Zeile 1117-1159)

```typescript
{selectedItems.size > 0 && (
  <Card className="bg-primary/5 border-primary/20">
    <CardContent className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            {selectedItems.size} {selectedItems.size === 1 ? 'item' : 'items'} selected
          </span>

          {/* Content Mix Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Set Category:</label>
            <Select value={bulkCategory} onValueChange={setBulkCategory}>
              <SelectTrigger className="w-[200px]">
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

          {/* CMS Actions Selector - NEU */}
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
```

## 9. Table Header - CMS Actions Column hinzufügen (nach Content Mix Header, ~Zeile 1324)

```typescript
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
```

## 10. Table Cell - CMS Actions Cell hinzufügen (nach Content Mix Cell, ~Zeile 1476)

```typescript
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
```

## 11. handleBulkUpdate erweitern (Zeile 981-984)

```typescript
const handleBulkUpdate = () => {
  if ((!bulkCategory && !bulkCmsAction) || selectedItems.size === 0) return
  showUpdatePreview(Array.from(selectedItems), bulkCategory, bulkCmsAction)
}
```

## 12. handleInlineUpdate erweitern (Zeile 986-988)

```typescript
const handleInlineUpdate = (inventoryId: string, category?: string, cmsAction?: string) => {
  showUpdatePreview([inventoryId], category, cmsAction)
}
```

## 13. showUpdatePreview erweitern (Zeile 952-957)

```typescript
const showUpdatePreview = (inventoryIds: string[], category?: string, cmsAction?: string) => {
  const sqlQuery = generateSqlQuery(inventoryIds, category, cmsAction)
  setPreviewData({ inventoryIds, category, cmsAction, sqlQuery })
  setShowPreview(true)
}
```

## 14. generateSqlQuery erweitern (Zeile 936-950)

```typescript
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
```

## 15. Preview Dialog State (Zeile 655-660)

```typescript
const [previewData, setPreviewData] = useState<{
  inventoryIds: string[]
  category?: string
  cmsAction?: string
  sqlQuery: string
} | null>(null)
```

## 16. executeUpdate erweitern (Zeile 960-979)

```typescript
const executeUpdate = () => {
  if (!previewData) return

  updateMutation.mutate({
    inventoryIds: previewData.inventoryIds,
    category: previewData.category,
    cmsAction: previewData.cmsAction,
  })

  setShowPreview(false)
  setPreviewData(null)

  if (previewData.inventoryIds.length > 1) {
    clearSelection()
    setBulkCategory('')
    setBulkCmsAction('')
  } else {
    setEditingItemId(null)
  }
}
```

## 17. updateMutation onMutate erweitern (Zeile 784-795)

```typescript
onMutate: async ({ inventoryIds, category, cmsAction }) => {
  // ... existing code

  queryClient.setQueryData(
    [/* full queryKey */],
    (old: ClassificationResponse | undefined) => {
      if (!old) return old
      return {
        ...old,
        items: old.items.map((item) =>
          inventoryIds.includes(item.inventory_id)
            ? {
                ...item,
                ...(category && { content_mix_category: category }),
                ...(cmsAction && { cms_actions: cmsAction })
              }
            : item
        ),
      }
    }
  )

  return { previousData }
},
```

## 18. ColSpan Updates

In allen `<TableCell colSpan={11}>` zu `<TableCell colSpan={12}>` ändern (da neue Spalte):
- Zeile 1330, 1339, 1346

## 19. SortField Type erweitern (Zeile 112)

```typescript
type SortField = 'node_id' | 'ann_stage' | 'language' | 'title' | 'persona' | 'stage' | 'content_type_machine' | 'content_mix_category' | 'cms_actions'
```

---

## Installation / Nächste Schritte

Diese Snippets müssen manuell in die entsprechenden Stellen in `page.tsx` eingefügt werden. Die Zeilennummern sind Richtwerte basierend auf der aktuellen Dateistruktur.
