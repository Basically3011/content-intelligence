'use client'

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Compass, ListChecks, Lightbulb } from "lucide-react";
import { CoverageHeatmap, CoverageHeatmapSkeleton } from "@/components/features/discover/coverage-heatmap";
import { NurtureHeatmap, NurtureHeatmapSkeleton } from "@/components/features/discover/nurture-heatmap";
import { useCoverage } from "@/lib/hooks/use-coverage";
import { useNurtureCoverage } from "@/lib/hooks/use-nurture-coverage";
import { useQuery } from "@tanstack/react-query";

interface ContentMixFilter {
  categories: string[]
  isNull: boolean
  isNotNull: boolean
}

export default function DiscoverPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>()
  const [isPdg, setIsPdg] = useState<boolean | undefined>()
  const [contentMixFilter, setContentMixFilter] = useState<ContentMixFilter>({
    categories: [],
    isNull: false,
    isNotNull: false,
  })
  const [nurtureLanguage, setNurtureLanguage] = useState<string | undefined>()

  // Fetch available languages from filters API
  const { data: filtersData } = useQuery({
    queryKey: ['filters'],
    queryFn: async () => {
      const response = await fetch('/api/filters')
      if (!response.ok) throw new Error('Failed to fetch filters')
      return response.json()
    },
  })

  const { data: coverageData, isLoading: isCoverageLoading } = useCoverage({
    language: selectedLanguage,
    is_pdg: isPdg,
    content_mix_categories: contentMixFilter.categories.length > 0 ? contentMixFilter.categories : undefined,
    content_mix_is_null: contentMixFilter.isNull || undefined,
    content_mix_is_not_null: contentMixFilter.isNotNull || undefined,
  })

  const { data: nurtureData, isLoading: isNurtureLoading } = useNurtureCoverage({
    language: nurtureLanguage,
  })

  const upcomingFeatures = [
    {
      title: "Gap Analysis",
      description: "Prioritized list of content gaps with impact scores",
      icon: ListChecks,
      status: "coming-soon"
    },
    {
      title: "Campaign Builder",
      description: "Plan content sequences for target personas and journeys",
      icon: Lightbulb,
      status: "coming-soon"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Compass className="h-8 w-8 text-brand" />
          <h1 className="text-3xl font-bold">Discover</h1>
        </div>
        <p className="text-muted-foreground">
          Find content gaps and plan strategic campaigns
        </p>
      </div>

      {/* Coverage Heatmap */}
      {isCoverageLoading ? (
        <CoverageHeatmapSkeleton />
      ) : coverageData && filtersData?.languages ? (
        <CoverageHeatmap
          personas={coverageData.personas}
          stages={coverageData.stages}
          data={coverageData.data}
          languages={filtersData.languages}
          contentMixCategories={filtersData.contentMixCategories || []}
          selectedLanguage={selectedLanguage}
          isPdg={isPdg}
          contentMixFilter={contentMixFilter}
          onLanguageChange={setSelectedLanguage}
          onPdgChange={setIsPdg}
          onContentMixFilterChange={setContentMixFilter}
        />
      ) : null}

      {/* Nurture Heatmap */}
      {isNurtureLoading ? (
        <NurtureHeatmapSkeleton />
      ) : nurtureData && filtersData?.languages ? (
        <NurtureHeatmap
          personas={nurtureData.personas}
          stages={nurtureData.stages}
          data={nurtureData.data}
          languages={filtersData.languages}
          selectedLanguage={nurtureLanguage}
          onLanguageChange={setNurtureLanguage}
        />
      ) : null}

      {/* Upcoming Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {upcomingFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-8 w-8 text-brand" />
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    Coming Soon
                  </span>
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Strategic Content Planning</CardTitle>
          <CardDescription>
            The Discover section helps you identify where content is missing and plan targeted campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>Coverage Heatmap:</strong> Visualize content distribution across your target personas
              and buying stages. Red indicates gaps, green shows good coverage.
            </p>
            <p>
              <strong>Gap Analysis:</strong> Get a prioritized list of missing content with impact scores
              to help you focus on what matters most.
            </p>
            <p>
              <strong>Campaign Builder:</strong> Plan multi-touch content sequences for specific buyer
              journeys and save them as templates.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
