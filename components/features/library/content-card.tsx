'use client'

import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { ContentItem } from "@/lib/api-client"
import { getContentImageUrl } from "@/lib/utils"
import { FileText, Lock, Award, Sprout } from "lucide-react"

interface ContentCardProps {
  item: ContentItem
  onClick?: () => void
  viewMode?: 'grid' | 'list'
}

export function ContentCard({ item, onClick, viewMode = 'grid' }: ContentCardProps) {
  const imageUrl = getContentImageUrl(item)
  const persona = item.content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping?.persona_primary_label
  const stage = item.content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping?.buying_stage
  const overallScore = item.content_scoring_content_inventory_active_scoring_idTocontent_scoring?.score_overall_weighted

  // Get score label and color
  const getScoreInfo = (score: string | null) => {
    if (!score) return null
    const numScore = parseFloat(score)
    if (numScore >= 3) return { label: 'Good', variant: 'default' as const, color: 'bg-green-500/10 text-green-700 border-green-500/20' }
    if (numScore >= 2) return { label: 'Fair', variant: 'secondary' as const, color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20' }
    return { label: 'Poor', variant: 'destructive' as const, color: 'bg-red-500/10 text-red-700 border-red-500/20' }
  }

  const scoreInfo = getScoreInfo(overallScore)

  // Content status badges with icons
  const contentStatusBadges = []
  if (item.is_content_gated) {
    contentStatusBadges.push({ label: 'Gated', variant: 'secondary' as const, icon: Lock })
  }
  if (item.is_nurture_content) {
    contentStatusBadges.push({ label: 'Nurture', variant: 'secondary' as const, icon: Sprout })
  }
  if (item.is_pdg_program_content) {
    contentStatusBadges.push({ label: 'PDG', variant: 'secondary' as const, icon: Award })
  }

  // List View
  if (viewMode === 'list') {
    return (
      <Card
        className="hover:shadow-lg transition-all cursor-pointer group"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex gap-4 items-start">
            {/* Thumbnail */}
            <div className="relative w-20 h-16 flex-shrink-0 rounded overflow-hidden bg-muted">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={item.title || 'Content thumbnail'}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-base line-clamp-1 group-hover:text-brand transition-colors">
                  {item.title || 'Untitled'}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2 mb-2">
                {item.content_type_machine && (
                  <Badge variant="secondary" className="text-xs">
                    {item.content_type_machine}
                  </Badge>
                )}
                {item.language && (
                  <Badge variant="outline" className="text-xs">
                    {item.language}
                  </Badge>
                )}
                {persona && (
                  <Badge variant="outline" className="text-xs">
                    {persona}
                  </Badge>
                )}
                {stage && (
                  <Badge variant="outline" className="text-xs">
                    {stage}
                  </Badge>
                )}
                {scoreInfo && (
                  <Badge variant="outline" className={`text-xs ${scoreInfo.color} flex-shrink-0`}>
                    {scoreInfo.label}
                  </Badge>
                )}
                {contentStatusBadges.map((badge) => {
                  const Icon = badge.icon
                  return (
                    <Badge key={badge.label} variant={badge.variant} className="text-xs gap-1">
                      <Icon className="h-3 w-3" />
                      {badge.label}
                    </Badge>
                  )
                })}
              </div>

              <p className="text-xs text-muted-foreground truncate">
                {item.url}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Grid View
  return (
    <Card
      className="hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
      onClick={onClick}
    >
      {/* Image Header */}
      <div className="relative w-full h-48 bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.title || 'Content image'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
      </div>

      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-lg line-clamp-2 group-hover:text-brand transition-colors">
            {item.title || 'Untitled'}
          </CardTitle>
        </div>

        <div className="flex flex-wrap gap-2">
          {item.content_type_machine && (
            <Badge variant="secondary">
              {item.content_type_machine}
            </Badge>
          )}
          {item.language && (
            <Badge variant="outline">
              {item.language}
            </Badge>
          )}
          {scoreInfo && (
            <Badge variant="outline" className={scoreInfo.color}>
              {scoreInfo.label}
            </Badge>
          )}
          {contentStatusBadges.map((badge) => {
            const Icon = badge.icon
            return (
              <Badge key={badge.label} variant={badge.variant} className="gap-1">
                <Icon className="h-3 w-3" />
                {badge.label}
              </Badge>
            )
          })}
        </div>

        <CardDescription className="text-sm truncate mt-2">
          {item.url}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {persona && (
            <div className="text-sm">
              <span className="text-muted-foreground">Persona:</span>{' '}
              <span className="font-medium">{persona}</span>
            </div>
          )}
          {stage && (
            <div className="text-sm">
              <span className="text-muted-foreground">Stage:</span>{' '}
              <span className="font-medium">{stage}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function ContentCardSkeleton({ viewMode = 'grid' }: { viewMode?: 'grid' | 'list' }) {
  if (viewMode === 'list') {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Skeleton className="w-20 h-16 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <Skeleton className="w-full h-48" />
      <CardHeader>
        <Skeleton className="h-6 w-3/4 mb-4" />
        <div className="flex gap-2 mb-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
    </Card>
  )
}
