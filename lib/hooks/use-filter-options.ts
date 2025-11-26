import { useQuery } from '@tanstack/react-query'
import { fetchFilterOptions } from '@/lib/api-client'

export function useFilterOptions() {
  return useQuery({
    queryKey: ['filters', 'options'],
    queryFn: fetchFilterOptions,
    staleTime: 10 * 60 * 1000, // 10 minutes - these don't change often
  })
}
