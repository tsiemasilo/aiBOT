import { useState } from "react";
import { AutomationToggle } from "@/components/AutomationToggle";
import { ContentStyleAnalyzer } from "@/components/ContentStyleAnalyzer";
import { ScheduleConfig } from "@/components/ScheduleConfig";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Automation() {
  const [automationEnabled, setAutomationEnabled] = useState(false);

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Automation</h1>
          <p className="text-muted-foreground mt-1">
            Set up automatic posting with AI-generated content based on analyzed profiles
          </p>
        </div>

        {!automationEnabled && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Automation is currently disabled</AlertTitle>
            <AlertDescription>
              Enable automation below to start auto-posting. Make sure to configure your schedule and analyze a profile for content inspiration first.
            </AlertDescription>
          </Alert>
        )}

        <AutomationToggle 
          enabled={automationEnabled} 
          onToggle={setAutomationEnabled}
        />

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content" data-testid="tab-content-style">
              Content Style
            </TabsTrigger>
            <TabsTrigger value="schedule" data-testid="tab-schedule">
              Posting Schedule
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-6 mt-6">
            <ContentStyleAnalyzer />
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Automated Posting Schedule</h3>
                <p className="text-sm text-muted-foreground">
                  Configure when the automation should create and post content
                </p>
              </div>
              <ScheduleConfig />
            </div>
          </TabsContent>
        </Tabs>

        {automationEnabled && (
          <div className="p-6 bg-card border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">How Automation Works</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">1</span>
                <p>The system analyzes the content style from the Instagram profile you provided</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">2</span>
                <p>AI generates similar content matching the analyzed style, hashtags, and posting patterns</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">3</span>
                <p>Posts are automatically scheduled based on your configured posting times and frequency</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">4</span>
                <p>Content is published to your Instagram profile at the scheduled times</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
