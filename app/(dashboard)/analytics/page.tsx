'use client'

import { StatsCard } from "@/components/features/analytics/stats-card"
import { SeoStatsCard } from "@/components/features/analytics/seo-stats-card"
import { ContentScoringCard } from "@/components/features/analytics/content-scoring-card"
import { ContentJourneyGaps } from "@/components/features/analytics/content-journey-gaps"
import { LanguageGaps } from "@/components/features/analytics/language-gaps"
import { TrendingUp, FileText, Users, Target, Search, Star } from "lucide-react"
import { useContentStats, useSeoStats, useContentScoringStats } from "@/lib/hooks/use-content-stats"

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useContentStats()
  const { data: seoStats, isLoading: seoLoading } = useSeoStats()
  const { data: scoringStats, isLoading: scoringLoading } = useContentScoringStats()

  const notPublished = stats ? stats.total - stats.published : 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="h-8 w-8 text-brand" />
          <h1 className="text-3xl font-bold">Analytics</h1>
        </div>
        <p className="text-muted-foreground">
          Performance insights and content health metrics
        </p>
      </div>

      {/* Header Stats - 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="No. Published Assets"
          value={isLoading ? "..." : stats?.published.toLocaleString() || "0"}
          description={isLoading ? "Loading..." : `Total ${stats?.total.toLocaleString() || 0} Assets, ${notPublished.toLocaleString()} not published`}
          icon={FileText}
        />
        <SeoStatsCard
          title="SEO"
          icon={Search}
          isLoading={seoLoading}
          stats={[
            { label: "Assets ohne top10 ranking", value: seoStats?.noTop10.toLocaleString() || "0" },
            { label: "Pages top10 ranking", value: seoStats?.top10Pages.toLocaleString() || "0" },
            { label: "Pages top30 ranking", value: seoStats?.top30Pages.toLocaleString() || "0" },
          ]}
        />
        <ContentScoringCard
          title="Content Scoring"
          icon={Star}
          isLoading={scoringLoading}
          avgScore={scoringLoading ? "..." : scoringStats?.avgScore.toFixed(2) || "0"}
          stats={[
            { label: "# of assets fair", value: scoringStats?.fairCount.toLocaleString() || "0" },
            { label: "# of assets poor", value: scoringStats?.poorCount.toLocaleString() || "0" },
          ]}
        />
      </div>

      {/* Content Journey Gaps & Language Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContentJourneyGaps />
        <LanguageGaps />
      </div>
    </div>
  )
}
