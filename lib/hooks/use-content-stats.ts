import { useQuery } from '@tanstack/react-query'
import { fetchContentStats, fetchCoveragePercentage, fetchGapsCount, fetchSeoStats, fetchContentScoringStats } from '@/lib/api-client'

export function useContentStats() {
  return useQuery({
    queryKey: ['content', 'stats'],
    queryFn: fetchContentStats,
  })
}

export function useSeoStats() {
  return useQuery({
    queryKey: ['seo', 'stats'],
    queryFn: fetchSeoStats,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })
}

export function useContentScoringStats() {
  return useQuery({
    queryKey: ['scoring', 'stats'],
    queryFn: fetchContentScoringStats,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })
}

export function useCoveragePercentage() {
  return useQuery({
    queryKey: ['coverage', 'percentage'],
    queryFn: fetchCoveragePercentage,
  })
}

export function useGapsCount() {
  return useQuery({
    queryKey: ['gaps', 'count'],
    queryFn: fetchGapsCount,
  })
}
