import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"

interface JourneyGap {
  persona: string
  stage: string
  count: number
  priority: 'high' | 'medium' | 'low'
}

interface ContentJourneyGapsProps {
  gaps?: JourneyGap[]
  isLoading?: boolean
}

export function ContentJourneyGaps({
  gaps = [],
  isLoading = false
}: ContentJourneyGapsProps) {
  // Mock data for now
  const mockGaps: JourneyGap[] = [
    { persona: 'Marketing Manager', stage: 'Awareness', count: 12, priority: 'high' },
    { persona: 'Creative Director', stage: 'Consideration', count: 8, priority: 'high' },
    { persona: 'Brand Designer', stage: 'Decision', count: 5, priority: 'medium' },
    { persona: 'Product Manager', stage: 'Awareness', count: 7, priority: 'medium' },
    { persona: 'Developer', stage: 'Evaluation', count: 3, priority: 'low' },
  ]

  const displayGaps = gaps.length > 0 ? gaps : mockGaps

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-700 border-red-500/20'
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20'
      case 'low':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20'
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-warning" />
          <CardTitle>Content Journey Gaps</CardTitle>
        </div>
        <CardDescription>
          Missing or insufficient content across personas and buying stages
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading gaps...</div>
        ) : (
          <div className="space-y-3">
            {displayGaps.map((gap, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{gap.persona}</p>
                    <span className="text-xs text-muted-foreground">→</span>
                    <p className="text-sm text-muted-foreground">{gap.stage}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {gap.count} content pieces needed
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={getPriorityColor(gap.priority)}
                >
                  {gap.priority}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
