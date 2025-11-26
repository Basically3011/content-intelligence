# Verbleibende kritische Änderungen für CMS Actions

## Status
✅ Komponenten, State, fetchClassificationData Signatur und updateClassification sind fertig
⚠️ Folgende Änderungen müssen noch gemacht werden

## 1. previewData Interface (~Zeile 791)
```typescript
// ÄNDERN VON:
const [previewData, setPreviewData] = useState<{
  inventoryIds: string[]
  category: string
  sqlQuery: string
} | null>(null)

// ZU:
const [previewData, setPreviewData] = useState<{
  inventoryIds: string[]
  category?: string
  cmsAction?: string
  sqlQuery: string
} | null>(null)
```

## 2. query useQuery - queryKey erweitern (~Zeile 813)
```typescript
// IN queryKey array HINZUFÜGEN (nach selectedContentMixCategories):
cmsActionsIsNull,
cmsActionsIsNotNull,
selectedCmsActions,
```

## 3. query useQuery - queryFn Parameter (~Zeile 839)
```typescript
// queryFn call - HINZUFÜGEN nach contentMixFilter object:
{
  isNull: cmsActionsIsNull,
  isNotNull: cmsActionsIsNotNull,
  actions: selectedCmsActions,
},
```

## 4. updateMutation - mutationFn (~Zeile 860)
```typescript
// ÄNDERN VON:
mutationFn: ({ inventoryIds, category }: { inventoryIds: string[]; category: string }) =>
  updateClassification(inventoryIds, category),

// ZU:
mutationFn: ({ inventoryIds, category, cmsAction }: { inventoryIds: string[]; category?: string; cmsAction?: string }) =>
  updateClassification(inventoryIds, category, cmsAction),
```

## 5. updateMutation - onMutate (~Zeile 862)
```typescript
// ÄNDERN Parameter VON:
onMutate: async ({ inventoryIds, category }) => {

// ZU:
onMutate: async ({ inventoryIds, category, cmsAction }) => {
```

## 6. updateMutation - optimistic update (~Zeile 890)
```typescript
// IM return object ÄNDERN VON:
items: old.items.map((item) =>
  inventoryIds.includes(item.inventory_id)
    ? { ...item, content_mix_category: category }
    : item
),

// ZU:
items: old.items.map((item) =>
  inventoryIds.includes(item.inventory_id)
    ? {
        ...item,
        ...(category !== undefined && { content_mix_category: category }),
        ...(cmsAction !== undefined && { cms_actions: cmsAction })
      }
    : item
),
```

## 7. activeFilterCount (~Zeile 975)
```typescript
// HINZUFÜGEN:
(cmsActionsIsNull ? 1 : 0) +
(cmsActionsIsNotNull ? 1 : 0) +
selectedCmsActions.length +
```

## 8. handleClearAllFilters (~Zeile 988)
```typescript
// HINZUFÜGEN:
setCmsActionsIsNull(false)
setCmsActionsIsNotNull(false)
setSelectedCmsActions([])
```

## 9. generateSqlQuery (~Zeile 1057)
```typescript
// ÄNDERN Signatur VON:
const generateSqlQuery = (inventoryIds: string[], category: string): string => {

// ZU:
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

## 10. showUpdatePreview (~Zeile 1075)
```typescript
// ÄNDERN VON:
const showUpdatePreview = (inventoryIds: string[], category: string) => {
  const sqlQuery = generateSqlQuery(inventoryIds, category)
  setPreviewData({ inventoryIds, category, sqlQuery })
  setShowPreview(true)
}

// ZU:
const showUpdatePreview = (inventoryIds: string[], category?: string, cmsAction?: string) => {
  const sqlQuery = generateSqlQuery(inventoryIds, category, cmsAction)
  setPreviewData({ inventoryIds, category, cmsAction, sqlQuery })
  setShowPreview(true)
}
```

## 11. executeUpdate (~Zeile 1082)
```typescript
// ÄNDERN VON:
updateMutation.mutate({
  inventoryIds: previewData.inventoryIds,
  category: previewData.category,
})

// ZU:
updateMutation.mutate({
  inventoryIds: previewData.inventoryIds,
  category: previewData.category,
  cmsAction: previewData.cmsAction,
})

// UND HINZUFÜGEN nach setBulkCategory(''):
setBulkCmsAction('')
```

## 12. handleBulkUpdate (~Zeile 1105)
```typescript
// ÄNDERN VON:
const handleBulkUpdate = () => {
  if (!bulkCategory || selectedItems.size === 0) return
  showUpdatePreview(Array.from(selectedItems), bulkCategory)
}

// ZU:
const handleBulkUpdate = () => {
  if ((!bulkCategory && !bulkCmsAction) || selectedItems.size === 0) return
  showUpdatePreview(Array.from(selectedItems), bulkCategory, bulkCmsAction)
}
```

## 13. handleInlineUpdate (~Zeile 1110)
```typescript
// ÄNDERN VON:
const handleInlineUpdate = (inventoryId: string, category: string) => {
  showUpdatePreview([inventoryId], category)
}

// ZU:
const handleInlineUpdate = (inventoryId: string, category?: string, cmsAction?: string) => {
  showUpdatePreview([inventoryId], category, cmsAction)
}
```

## 14. Bulk Action Bar UI - NACH bulkCategory Select HINZUFÜGEN (~Zeile 1260)
```typescript
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
```

## 15. Bulk Action Button (~Zeile 1270)
```typescript
// ÄNDERN disabled VON:
disabled={!bulkCategory || updateMutation.isPending}

// ZU:
disabled={(!bulkCategory && !bulkCmsAction) || updateMutation.isPending}
```

## 16. Table Header - NACH Content Mix TableHead HINZUFÜGEN (~Zeile 1455)
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

## 17. Table Cell - NACH Content Mix TableCell HINZUFÜGEN (~Zeile 1611)
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

## 18. ColSpan Updates - ALLE ändern VON 11 ZU 12
```typescript
// Zeile ~1457, ~1466, ~1473:
<TableCell colSpan={12} ...
```

Diese Änderungen müssen manuell in der entsprechenden Datei vorgenommen werden.
