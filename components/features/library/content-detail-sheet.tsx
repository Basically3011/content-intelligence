'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { X, ExternalLink, ChevronLeft, ChevronRight, Calendar, Globe, FileText, Tag, Package, MessageSquare, Hash, BarChart3, AlignLeft, TrendingUp, AlertTriangle, Lightbulb, Lock, Award, Sprout } from "lucide-react"
import { ContentItem } from "@/lib/api-client"
import { StageProgress } from "./stage-progress"
import { ScoreGauge } from "./score-gauge"
import { ContentFlagTile } from "./content-flag-tile"

interface ContentDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ContentItem | null
  onPrevious?: () => void
  onNext?: () => void
  hasPrevious?: boolean
  hasNext?: boolean
}

export function ContentDetailSheet({
  open,
  onOpenChange,
  item,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}: ContentDetailSheetProps) {
  if (!item) return null

  const persona = item.content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping?.persona_primary_label
  const stage = item.content_persona_mapping_content_inventory_active_persona_mapping_idTocontent_persona_mapping?.buying_stage

  // Get scoring data
  const scoring = item.content_scoring_content_inventory_active_scoring_idTocontent_scoring
  const hasScoring = !!(scoring?.score_clarity || scoring?.score_conversion || scoring?.score_relevance || scoring?.score_structure)

  // Parse strengths and weaknesses (they come as { "items": [...] })
  const parseJsonField = (field: any): string[] => {
    if (!field) return []

    // If it's already an array
    if (Array.isArray(field)) return field

    // If it's an object with items property
    if (typeof field === 'object' && field.items && Array.isArray(field.items)) {
      return field.items
    }

    // If it's a string, try to parse it
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field)
        if (Array.isArray(parsed)) return parsed
        if (parsed.items && Array.isArray(parsed.items)) return parsed.items
      } catch {
        return []
      }
    }

    return []
  }

  const primaryStrengths = parseJsonField(scoring?.audit_primary_strengths)
  const criticalWeaknesses = parseJsonField(scoring?.audit_critical_weaknesses)
  const recommendations = parseJsonField(scoring?.audit_recommendations)
  const hasStrengthsOrWeaknesses = primaryStrengths.length > 0 || criticalWeaknesses.length > 0
  const hasRecommendations = recommendations.length > 0

  // Format dates
  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Status badge variant
  const getStatusVariant = (status: string | null) => {
    if (status === 'published') return 'default'
    if (status === 'draft') return 'secondary'
    return 'outline'
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[700px] overflow-y-auto">
        {/* Header */}
        <SheetHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-8">
              <SheetTitle className="text-xl leading-tight">
                {item.title || 'Untitled'}
              </SheetTitle>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mt-1"
                >
                  <Globe className="h-3 w-3" />
                  {new URL(item.url).pathname}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Badges */}
          <div className="flex flex-wrap gap-2">
            {persona && (
              <Badge variant="outline" className="gap-1">
                <Tag className="h-3 w-3" />
                {persona}
              </Badge>
            )}
            {item.cms_status && (
              <Badge variant={getStatusVariant(item.cms_status)}>
                {item.cms_status}
              </Badge>
            )}
            {item.is_pdg_program_content && (
              <Badge variant="secondary" className="gap-1">
                <Award className="h-3 w-3" />
                PDG Program Content
              </Badge>
            )}
            {item.is_content_gated && (
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                Gated
              </Badge>
            )}
            {item.is_nurture_content && (
              <Badge variant="secondary" className="gap-1">
                <Sprout className="h-3 w-3" />
                Nurture
              </Badge>
            )}
          </div>
        </SheetHeader>

        <Separator className="my-6" />

        {/* Buying Stage Progress */}
        {stage && (
          <>
            <StageProgress currentStage={stage} />
            <Separator className="my-6" />
          </>
        )}

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Content Scoring Card */}
          {hasScoring && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Content Scoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Score Gauges */}
                <div className="grid grid-cols-4 gap-6">
                  <ScoreGauge
                    label="Clarity"
                    score={scoring?.score_clarity ? parseFloat(scoring.score_clarity) : null}
                    size="md"
                  />
                  <ScoreGauge
                    label="Conversion"
                    score={scoring?.score_conversion ? parseFloat(scoring.score_conversion) : null}
                    size="md"
                  />
                  <ScoreGauge
                    label="Relevance"
                    score={scoring?.score_relevance ? parseFloat(scoring.score_relevance) : null}
                    size="md"
                  />
                  <ScoreGauge
                    label="Structure"
                    score={scoring?.score_structure ? parseFloat(scoring.score_structure) : null}
                    size="md"
                  />
                </div>

                {/* Content Quality Flags */}
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <ContentFlagTile
                    label="Wall of Text"
                    value={scoring?.flag_is_wall_of_text ?? null}
                    isPositive={false}
                  />
                  <ContentFlagTile
                    label="Transactional CTA"
                    value={scoring?.flag_has_transactional_cta ?? null}
                    isPositive={true}
                  />
                  <ContentFlagTile
                    label="Mixed Pronouns"
                    value={scoring?.flag_has_mixed_pronouns ?? null}
                    isPositive={false}
                  />
                  <ContentFlagTile
                    label="Company Centric"
                    value={scoring?.flag_is_company_centric ?? null}
                    isPositive={false}
                  />
                  <ContentFlagTile
                    label="Case Study Metrics"
                    value={scoring?.flag_has_case_study_metrics ?? null}
                    isPositive={true}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary Card */}
          {scoring?.audit_executive_summary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlignLeft className="h-4 w-4" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-relaxed text-foreground">
                  {scoring.audit_executive_summary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Strengths & Weaknesses Card */}
          {hasStrengthsOrWeaknesses && (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Primary Strengths */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <h3 className="font-semibold text-sm text-foreground">Primary Strengths</h3>
                    </div>
                    {primaryStrengths.length > 0 ? (
                      <ul className="space-y-2">
                        {primaryStrengths.map((strength: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-green-600 mt-0.5">•</span>
                            <span className="text-foreground leading-relaxed">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No strengths identified</p>
                    )}
                  </div>

                  {/* Critical Weaknesses */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <h3 className="font-semibold text-sm text-foreground">Critical Weaknesses</h3>
                    </div>
                    {criticalWeaknesses.length > 0 ? (
                      <ul className="space-y-2">
                        {criticalWeaknesses.map((weakness: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-orange-600 mt-0.5">•</span>
                            <span className="text-foreground leading-relaxed">{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No weaknesses identified</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations Card */}
          {hasRecommendations && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {recommendations.map((recommendation: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <span className="text-blue-600 mt-0.5">→</span>
                      <span className="text-foreground leading-relaxed flex-1">
                        {recommendation}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Metadata Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  Content Type
                </div>
                <div className="text-sm">
                  {item.content_type_machine || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  Language
                </div>
                <div className="text-sm">
                  {item.language || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created
                </div>
                <div className="text-sm">
                  {formatDate(item.cms_created_at)}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Updated
                </div>
                <div className="text-sm">
                  {formatDate(item.cms_updated_at)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Taxonomy Card */}
          {(item.ann_products?.length > 0 ||
            item.ann_solutions?.length > 0 ||
            item.ann_conversation_tracks?.length > 0 ||
            item.ann_stage ||
            item.serial_number) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Taxonomy & Classification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* PDG Stage & Serial Number */}
                <div className="grid grid-cols-2 gap-4">
                  {item.ann_stage && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-2">
                        PDG Stage
                      </div>
                      <Badge variant="secondary">{item.ann_stage}</Badge>
                    </div>
                  )}
                  {item.serial_number && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        Serial Number
                      </div>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {item.serial_number}
                      </code>
                    </div>
                  )}
                </div>

                {/* Products */}
                {item.ann_products && item.ann_products.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      Products
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.ann_products.map((product, idx) => (
                        <Badge key={idx} variant="outline">
                          {product}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Solutions */}
                {item.ann_solutions && item.ann_solutions.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      Solutions
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.ann_solutions.map((solution, idx) => (
                        <Badge key={idx} variant="outline">
                          {solution}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conversation Tracks */}
                {item.ann_conversation_tracks && item.ann_conversation_tracks.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      Conversation Tracks
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.ann_conversation_tracks.map((track, idx) => (
                        <Badge key={idx} variant="outline">
                          {track}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <Separator className="my-6" />

        {/* Footer Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevious}
              disabled={!hasPrevious}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNext}
              disabled={!hasNext}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          {item.url && (
            <Button
              variant="default"
              size="sm"
              asChild
            >
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                View Live
                <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
