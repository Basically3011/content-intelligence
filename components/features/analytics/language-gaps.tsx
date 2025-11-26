import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Globe } from "lucide-react"
import { useLanguageDistribution } from "@/lib/hooks/use-language-distribution"

export function LanguageGaps() {
  const { data: languages, isLoading } = useLanguageDistribution()

  const displayLanguages = languages || []
  const total = displayLanguages.reduce((sum, lang) => sum + lang.count, 0)

  const getLanguageColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
    ]
    return colors[index % colors.length]
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-info" />
          <CardTitle>Language Distribution</CardTitle>
        </div>
        <CardDescription>
          Content coverage across different languages
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading language data...</div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {displayLanguages.map((lang, index) => (
                <div key={lang.language} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${getLanguageColor(index)}`} />
                      <span className="font-medium">{lang.language}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{lang.count} items</span>
                      <span className="font-medium min-w-[3ch] text-right">{lang.percentage}%</span>
                    </div>
                  </div>
                  <Progress value={lang.percentage} className="h-2" />
                </div>
              ))}
            </div>

            <div className="pt-3 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Total Content</span>
                <span className="text-muted-foreground">{total} items</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
