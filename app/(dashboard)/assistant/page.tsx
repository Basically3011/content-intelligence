import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Lightbulb, MessageSquare, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AssistantPage() {
  const recommendations = [
    {
      title: "Optimize CTO content for Decision stage",
      priority: "high",
      effort: "medium",
      impact: "high",
      description: "Analysis shows a gap in Decision-stage content for CTOs. Creating comparison guides could improve conversion."
    },
    {
      title: "Refresh outdated product documentation",
      priority: "medium",
      effort: "high",
      impact: "medium",
      description: "12 articles haven't been updated in over 6 months and show declining engagement."
    },
    {
      title: "Boost promotion for hidden gems",
      priority: "medium",
      effort: "low",
      impact: "medium",
      description: "23 high-scoring articles have low traffic. Consider email campaigns or social promotion."
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-brand" />
          <h1 className="text-3xl font-bold">AI Assistant</h1>
        </div>
        <p className="text-muted-foreground">
          AI-powered recommendations and content insights
        </p>
      </div>

      {/* Quick Ask */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-brand" />
            <CardTitle>Ask About Your Content</CardTitle>
          </div>
          <CardDescription>
            Get instant answers about your content strategy, performance, and opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <textarea
              placeholder="Try asking: 'What content should I create for CTOs in the awareness stage?' or 'Which articles need updating?'"
              className="w-full min-h-[100px] p-3 border rounded-lg resize-none"
            />
            <Button className="w-full">
              <Sparkles className="h-4 w-4 mr-2" />
              Ask Assistant
            </Button>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium mb-3">Example questions:</p>
            <div className="space-y-2">
              {[
                "What are my biggest content gaps?",
                "Which articles perform best for CMO persona?",
                "Show me outdated content that needs refresh",
                "What topics should I cover next?"
              ].map((question) => (
                <Button
                  key={question}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-brand" />
          <h2 className="text-xl font-semibold">Smart Recommendations</h2>
        </div>

        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                        {rec.priority.toUpperCase()} PRIORITY
                      </Badge>
                      <Badge variant="outline">Effort: {rec.effort}</Badge>
                      <Badge variant="outline">Impact: {rec.impact}</Badge>
                    </div>
                    <CardTitle className="text-lg">{rec.title}</CardTitle>
                  </div>
                  <TrendingUp className="h-5 w-5 text-brand flex-shrink-0" />
                </div>
                <CardDescription className="text-sm mt-2">
                  {rec.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button size="sm">View Details</Button>
                  <Button size="sm" variant="outline">Dismiss</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle>How the Assistant Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>Smart Analysis:</strong> AI analyzes your content patterns, gaps, and performance trends</p>
            <p>• <strong>Prioritized Actions:</strong> Recommendations are ranked by priority, effort, and potential impact</p>
            <p>• <strong>Natural Language:</strong> Ask questions in plain English about your content strategy</p>
            <p>• <strong>Context-Aware:</strong> Suggestions are based on your specific content inventory and goals</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
