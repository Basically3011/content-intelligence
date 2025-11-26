import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface SeoStatsCardProps {
  title: string
  stats: {
    label: string
    value: string | number
  }[]
  icon: LucideIcon
  className?: string
  isLoading?: boolean
}

export function SeoStatsCard({
  title,
  stats,
  icon: Icon,
  className,
  isLoading = false
}: SeoStatsCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : (
              <div className="space-y-2">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                    <span className="text-sm font-bold">{stat.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
