import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AutomationToggle } from "@/components/AutomationToggle";
import { ProfileSelector } from "@/components/ProfileSelector";
import { ScheduleConfig } from "@/components/ScheduleConfig";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Instagram, CheckCircle2, Settings } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface AutomationSettings {
  enabled: boolean;
  profileUrl?: string | null;
  analyzedData?: any;
  lastAnalyzedAt?: string | null;
}

interface ConnectedAccount {
  id: string;
  platform: string;
  username: string;
  profileUrl?: string | null;
  profileImageUrl?: string | null;
  isActive: boolean;
  connectedAt: Date;
}

export default function Automation() {
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [, setLocation] = useLocation();

  const { data: automationSettings, isLoading } = useQuery<AutomationSettings>({
    queryKey: ["/api/automation"],
  });

  const { data: connectedAccounts = [] } = useQuery<ConnectedAccount[]>({
    queryKey: ["/api/accounts"],
  });

  useEffect(() => {
    if (automationSettings) {
      setAutomationEnabled(automationSettings.enabled || false);
    }
  }, [automationSettings]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading automation settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Automation</h1>
          <p className="text-muted-foreground mt-1">
            Automatically repost content from any Instagram profile with AI-paraphrased captions
          </p>
        </div>

        {connectedAccounts.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Instagram Account Connected</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>
                Connect your Instagram account to enable automated posting.
              </span>
              <Button variant="outline" size="sm" onClick={() => setLocation("/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Go to Settings
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {connectedAccounts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
              <CardDescription>
                These accounts will be used for automated posting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {connectedAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={account.profileImageUrl || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-orange-400 text-white">
                          <Instagram className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{account.username}</p>
                          {account.isActive && (
                            <Badge variant="default" className="gap-1 text-xs">
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Connected {new Date(account.connectedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setLocation("/settings")}>
                      Manage
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!automationEnabled && connectedAccounts.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Automation is currently disabled</AlertTitle>
            <AlertDescription>
              Enable automation below to start auto-posting. Make sure to configure your schedule and confirm a source profile first.
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
              Source Profile
            </TabsTrigger>
            <TabsTrigger value="schedule" data-testid="tab-schedule">
              Posting Schedule
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-6 mt-6">
            <ProfileSelector />
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
                <p>Select and confirm a source Instagram profile to repost content from</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">2</span>
                <p>The system randomly selects posts from the source profile's feed</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">3</span>
                <p>AI paraphrases the captions to match the source profile's style and lingo</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">4</span>
                <p>Content is automatically posted to your connected Instagram account at scheduled times</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
