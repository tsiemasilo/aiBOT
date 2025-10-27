import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Loader2, Sparkles, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ContentType {
  type: string;
  percentage: number;
  color: string;
  examples: number;
}

interface AnalysisResult {
  contentTypes: ContentType[];
  hashtags: string[];
  avgPostsPerWeek: number;
  bestTime: string;
  username: string;
}

export function ContentStyleAnalyzer() {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: async (profileUrl: string) => {
      const response = await apiRequest("POST", "/api/analyze-profile", { profileUrl });
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      toast({
        title: "Analysis complete",
        description: `Successfully analyzed @${data.username || "username"}'s profile`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = () => {
    analyzeMutation.mutate(url);
  };

  const contentTypes: ContentType[] = analysisResult?.contentTypes || [
    { type: "Product Photos", percentage: 35, color: "bg-purple-500", examples: 18 },
    { type: "Lifestyle Shots", percentage: 28, color: "bg-orange-500", examples: 14 },
    { type: "Quotes & Text", percentage: 20, color: "bg-blue-500", examples: 10 },
    { type: "Behind the Scenes", percentage: 12, color: "bg-green-500", examples: 6 },
    { type: "User Generated", percentage: 5, color: "bg-pink-500", examples: 2 },
  ];

  const hashtags = analysisResult?.hashtags || ["#fashion", "#style", "#ootd", "#inspo", "#lifestyle", "#aesthetic", "#trend", "#vibes"];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Content Style Learning</CardTitle>
          </div>
          <CardDescription>
            Analyze an Instagram profile to learn their content style and automatically generate similar posts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-url">Instagram Profile URL</Label>
            <div className="flex gap-2">
              <Input
                id="profile-url"
                placeholder="https://instagram.com/username"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                data-testid="input-profile-url"
              />
              <Button 
                onClick={handleAnalyze} 
                disabled={!url || analyzeMutation.isPending} 
                data-testid="button-analyze"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              The automation will create similar content based on this profile's style
            </p>
          </div>
        </CardContent>
      </Card>

      {analysisResult && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Content Style Breakdown</CardTitle>
              <CardDescription>
                Analyzed 50 recent posts from @{analysisResult.username || "username"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {contentTypes.map((content) => (
                  <div key={content.type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{content.type}</span>
                      </div>
                      <span className="text-muted-foreground">{content.percentage}% ({content.examples} posts)</span>
                    </div>
                    <Progress value={content.percentage} className="h-2" />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-3">Popular Hashtags</p>
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag) => (
                    <Badge key={tag} variant="secondary" data-testid={`badge-hashtag-${tag.slice(1)}`}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-3">Posting Patterns</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">Avg. Posts/Week</p>
                    <p className="text-2xl font-semibold">{analysisResult.avgPostsPerWeek || 5.2}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">Best Time</p>
                    <p className="text-2xl font-semibold">{analysisResult.bestTime || "7:00 PM"}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/10 rounded-md border border-primary/20 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">AI Content Generation Active</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    When automation is enabled, the system will generate content similar to this profile's style, matching their posting frequency and hashtag usage.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
