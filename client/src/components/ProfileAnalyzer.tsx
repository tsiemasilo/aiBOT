import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ContentType {
  type: string;
  percentage: number;
  color: string;
}

export function ProfileAnalyzer() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  
  const contentTypes: ContentType[] = [
    { type: "Product Photos", percentage: 35, color: "bg-purple-500" },
    { type: "Lifestyle Shots", percentage: 28, color: "bg-orange-500" },
    { type: "Quotes & Text", percentage: 20, color: "bg-blue-500" },
    { type: "Behind the Scenes", percentage: 12, color: "bg-green-500" },
    { type: "User Generated", percentage: 5, color: "bg-pink-500" },
  ];

  const handleAnalyze = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAnalyzed(true);
      console.log("Analyzing profile:", url);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Analyzer</CardTitle>
          <CardDescription>
            Analyze an Instagram profile to get content inspiration
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
              <Button onClick={handleAnalyze} disabled={!url || loading} data-testid="button-analyze">
                {loading ? (
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
          </div>
        </CardContent>
      </Card>

      {analyzed && (
        <Card>
          <CardHeader>
            <CardTitle>Content Breakdown</CardTitle>
            <CardDescription>
              Based on the last 50 posts from @username
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {contentTypes.map((content) => (
                <div key={content.type} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{content.type}</span>
                    <span className="text-muted-foreground">{content.percentage}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${content.color}`}
                      style={{ width: `${content.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-3">Popular Hashtags</p>
              <div className="flex flex-wrap gap-2">
                {["#fashion", "#style", "#ootd", "#inspo", "#lifestyle", "#aesthetic"].map((tag) => (
                  <Badge key={tag} variant="secondary" data-testid={`badge-hashtag-${tag.slice(1)}`}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-3">Best Posting Times</p>
              <div className="grid grid-cols-3 gap-2">
                <Badge variant="outline">9:00 AM</Badge>
                <Badge variant="outline">2:00 PM</Badge>
                <Badge variant="outline">7:00 PM</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
