import { LucideIcon } from "lucide-react";

// Navigation
export interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

// Content Item
export interface PersonaMapping {
  primary_persona?: string;
  secondary_personas?: string[];
  buying_stage?: string;
  content_type?: string;
}

export interface ContentScoring {
  overall_score?: number;
  quality_score?: number;
  completeness_score?: number;
  freshness_score?: number;
}

export interface ContentItem {
  inventory_id: number;
  language_node_id: string;
  title: string;
  url: string;
  persona_mapping?: PersonaMapping;
  scoring?: ContentScoring;
  seo_score?: number;
  engagement_score?: number;
  created_at?: Date;
  updated_at?: Date;
  status?: 'published' | 'draft' | 'archived';
  language?: string;
  content_type?: string;
}

// Analytics
export interface CoverageData {
  persona: string;
  buying_stage: string;
  content_count: number;
  coverage_percentage: number;
}

export interface GapAnalysis {
  persona: string;
  buying_stage: string;
  priority: 'high' | 'medium' | 'low';
  impact_score: number;
  missing_content_types: string[];
}

export interface HealthMetrics {
  total_content: number;
  average_score: number;
  coverage_percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface PerformanceQuadrant {
  quadrant: 'stars' | 'rising' | 'hidden' | 'needswork';
  items: ContentItem[];
}

// Filters
export interface ContentFilters {
  search?: string;
  personas?: string[];
  buying_stages?: string[];
  languages?: string[];
  score_min?: number;
  score_max?: number;
  content_types?: string[];

  // Content Status toggles
  is_gated?: boolean;
  is_nurture?: boolean;
  is_pdg?: boolean;

  // CMS Status
  is_published?: boolean;

  // Quality Flags
  has_low_content?: boolean;
  has_low_readability?: boolean;
  has_title_issues?: boolean;
  has_url_issues?: boolean;

  // PDG Stage Filter
  pdg_stages?: string[];
  pdg_stage_is_null?: boolean;
  pdg_stage_is_not_null?: boolean;

  // Content Mix Category Filter
  content_mix_categories?: string[];
  content_mix_is_null?: boolean;
  content_mix_is_not_null?: boolean;

  // Score Range Filters
  score_ranges?: string[]; // 'poor', 'fair', 'good'

  // Date Range Filters
  date_field?: 'cms_created_at' | 'cms_updated_at';
  date_from?: string; // ISO date string
  date_to?: string;   // ISO date string

  // Sorting
  sort_by?: 'cms_created_at' | 'cms_updated_at';
  sort_order?: 'asc' | 'desc';
}

// Recommendations
export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  reasoning: string;
  action_items: string[];
}

// Campaign
export interface Campaign {
  id: string;
  name: string;
  target_persona: string;
  buying_journey: string[];
  content_items: Record<string, ContentItem[]>;
  created_at: Date;
}
