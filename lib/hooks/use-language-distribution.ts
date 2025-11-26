import { useQuery } from '@tanstack/react-query'
import { fetchLanguageDistribution } from '@/lib/api-client'

export function useLanguageDistribution() {
  return useQuery({
    queryKey: ['language', 'distribution'],
    queryFn: fetchLanguageDistribution,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })
}
