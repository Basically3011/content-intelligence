import { useQuery } from '@tanstack/react-query'
import { fetchContentItems } from '@/lib/api-client'

interface UseContentItemsParams {
  page?: number
  limit?: number
  search?: string
  personas?: string[]
  buying_stages?: string[]
  content_types?: string[]
  languages?: string[]

  // Content Status toggles
  is_gated?: boolean
  is_nurture?: boolean
  is_pdg?: boolean

  // CMS Status
  is_published?: boolean

  // Quality Flags
  has_low_content?: boolean
  has_low_readability?: boolean
  has_title_issues?: boolean
  has_url_issues?: boolean

  // PDG Stage Filters
  pdg_stages?: string[]
  pdg_stage_is_null?: boolean
  pdg_stage_is_not_null?: boolean

  // Content Mix Category Filters
  content_mix_categories?: string[]
  content_mix_is_null?: boolean
  content_mix_is_not_null?: boolean

  // Date Range Filters
  date_field?: 'cms_created_at' | 'cms_updated_at'
  date_from?: string
  date_to?: string

  // Score Range Filters
  score_ranges?: string[]

  // Sorting
  sort_by?: 'cms_created_at' | 'cms_updated_at'
  sort_order?: 'asc' | 'desc'
}

export function useContentItems(params: UseContentItemsParams = {}) {
  return useQuery({
    queryKey: ['content', 'items', params],
    queryFn: () => fetchContentItems(params),
    placeholderData: (previousData) => previousData, // Keep old data while fetching new page
  })
}
