import { useQuery } from '@tanstack/react-query'

interface CoverageCell {
  persona: string
  stage: string
  count: number
}

interface CoverageMatrix {
  personas: string[]
  stages: string[]
  data: CoverageCell[]
}

interface CoverageFilters {
  is_pdg?: boolean
  language?: string
  content_mix_categories?: string[]
  content_mix_is_null?: boolean
  content_mix_is_not_null?: boolean
}

export function useCoverage(filters?: CoverageFilters) {
  return useQuery<CoverageMatrix>({
    queryKey: ['coverage', filters],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (filters?.is_pdg !== undefined) {
        params.append('is_pdg', filters.is_pdg.toString())
      }

      if (filters?.language) {
        params.append('language', filters.language)
      }

      if (filters?.content_mix_categories && filters.content_mix_categories.length > 0) {
        params.append('content_mix_categories', filters.content_mix_categories.join(','))
      }

      if (filters?.content_mix_is_null) {
        params.append('content_mix_is_null', 'true')
      }

      if (filters?.content_mix_is_not_null) {
        params.append('content_mix_is_not_null', 'true')
      }

      const url = `/api/coverage${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch coverage data')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
