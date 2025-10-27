import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Zap, CheckCircle2, Clock } from "lucide-react";

interface AutomationToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function AutomationToggle({ enabled, onToggle }: AutomationToggleProps) {
  return (
    <Card className={enabled ? "border-primary" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className={`h-5 w-5 ${enabled ? "text-primary" : "text-muted-foreground"}`} />
            <CardTitle>Auto-Posting</CardTitle>
          </div>
          <Badge variant={enabled ? "default" : "secondary"} data-testid="badge-automation-status">
            {enabled ? "Active" : "Inactive"}
          </Badge>
        </div>
        <CardDescription>
          Automatically post content based on your schedule and analyzed profiles
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted rounded-md">
          <div className="space-y-0.5">
            <Label htmlFor="automation-toggle" className="text-base font-medium">
              Enable Automation
            </Label>
            <p className="text-sm text-muted-foreground">
              {enabled 
                ? "Posts will be automatically created and scheduled" 
                : "Turn on to start automatic posting"}
            </p>
          </div>
          <Switch
            id="automation-toggle"
            checked={enabled}
            onCheckedChange={onToggle}
            data-testid="switch-automation"
          />
        </div>

        {enabled && (
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-md border border-primary/20">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Automation is running</p>
                <p className="text-xs text-muted-foreground mt-1">
                  New posts will be automatically generated and scheduled based on your settings
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Next post will be generated in 2 hours</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
