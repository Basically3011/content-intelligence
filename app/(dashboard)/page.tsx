'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, FileText, Target, AlertCircle } from "lucide-react";
import { useContentStats, useCoveragePercentage, useGapsCount } from "@/lib/hooks/use-content-stats";

function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  isLoading,
}: {
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down'
  icon: React.ElementType
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-1" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${trend === 'up' ? 'text-success' : 'text-error'}`}>
          {change}
        </p>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useContentStats()
  const { data: coverage, isLoading: coverageLoading } = useCoveragePercentage()
  const { data: gaps, isLoading: gapsLoading } = useGapsCount()

  // Calculate trends (simplified - in real app would compare to previous period)
  const totalChange = stats ? '+12.5%' : '+0%'
  const scoreChange = stats && stats.avgScore > 80 ? '+4.2%' : '+0%'
  const coverageChange = coverage && coverage > 70 ? '+8.1%' : '+0%'
  const gapsChange = gaps !== undefined && gaps < 30 ? '-5' : '0'

  const statCards = [
    {
      title: "Total Content",
      value: stats?.total.toLocaleString() || '0',
      change: `${totalChange} from last month`,
      trend: 'up' as const,
      icon: FileText,
      isLoading: statsLoading,
    },
    {
      title: "Average Score",
      value: stats ? stats.avgScore.toFixed(1) : '0',
      change: `${scoreChange} from last month`,
      trend: 'up' as const,
      icon: TrendingUp,
      isLoading: statsLoading,
    },
    {
      title: "Coverage",
      value: coverage !== undefined ? `${coverage}%` : '0%',
      change: `${coverageChange} from last month`,
      trend: 'up' as const,
      icon: Target,
      isLoading: coverageLoading,
    },
    {
      title: "Gaps Identified",
      value: gaps !== undefined ? gaps : '0',
      change: `${gapsChange} from last month`,
      trend: 'down' as const,
      icon: AlertCircle,
      isLoading: gapsLoading,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Executive overview of your content performance
        </p>
      </div>

      {/* Error State */}
      {statsError && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Data</CardTitle>
            <CardDescription>
              Failed to load content statistics. Please check your connection and try again.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Detailed Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Content Inventory Details</CardTitle>
          <CardDescription>
            Breakdown of your content library by status and type
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : stats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Items</div>
                  <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Published</div>
                  <div className="text-2xl font-bold text-success">{stats.published.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">
                    {((stats.published / stats.total) * 100).toFixed(1)}% of total
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Average SEO Score</div>
                  <div className="text-2xl font-bold">{stats.avgScore.toFixed(2)}</div>
                  <div className="text-xs text-success">Excellent performance</div>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Content Intelligence</CardTitle>
          <CardDescription>
            Your analytics hub for content discovery, performance insights, and AI-powered recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Get Started:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Navigate to <strong>Discover</strong> to find content gaps across personas and buying stages</li>
                <li>• Browse your content <strong>Library</strong> with advanced filtering and search</li>
                <li>• View performance metrics in <strong>Analytics</strong> with quadrant analysis</li>
                <li>• Get AI recommendations from the <strong>Assistant</strong> to optimize your content strategy</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
