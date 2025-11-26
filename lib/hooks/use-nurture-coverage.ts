import { useQuery } from '@tanstack/react-query'

interface NurtureCoverageCell {
  persona: string
  stage: string
  count: number
}

interface NurtureCoverageMatrix {
  personas: string[]
  stages: string[]
  data: NurtureCoverageCell[]
}

interface NurtureCoverageFilters {
  language?: string
}

export function useNurtureCoverage(filters?: NurtureCoverageFilters) {
  return useQuery<NurtureCoverageMatrix>({
    queryKey: ['nurture-coverage', filters],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (filters?.language) {
        params.append('language', filters.language)
      }

      const url = `/api/nurture-coverage${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch nurture coverage data')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
