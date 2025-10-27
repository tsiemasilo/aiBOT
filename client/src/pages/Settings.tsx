import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Instagram, Plus, Trash2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { EmptyState } from "@/components/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface ConnectedAccount {
  id: string;
  platform: string;
  username: string;
  profileUrl?: string | null;
  profileImageUrl?: string | null;
  isActive: boolean;
  connectedAt: Date;
  lastSyncedAt?: Date | null;
}

export default function Settings() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const { toast } = useToast();

  const { data: accounts = [], isLoading } = useQuery<ConnectedAccount[]>({
    queryKey: ["/api/accounts"],
  });

  const connectMutation = useMutation({
    mutationFn: async (accountData: { username: string; profileUrl?: string }) => {
      const response = await apiRequest("POST", "/api/accounts", {
        platform: "instagram",
        username: accountData.username,
        profileUrl: accountData.profileUrl || `https://instagram.com/${accountData.username}`,
        isActive: true,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      toast({
        title: "Account Connected",
        description: "Your Instagram account has been connected successfully.",
      });
      setDialogOpen(false);
      setUsername("");
      setProfileUrl("");
    },
    onError: (error) => {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      toast({
        title: "Account Disconnected",
        description: "Your Instagram account has been disconnected.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to disconnect account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleConnect = () => {
    if (!username.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter your Instagram username.",
        variant: "destructive",
      });
      return;
    }

    connectMutation.mutate({ 
      username: username.trim(),
      profileUrl: profileUrl.trim() || undefined,
    });
  };

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your connected accounts and automation settings
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Instagram Account Required</AlertTitle>
          <AlertDescription>
            Connect your Instagram account to enable automated posting. For now, this stores your account information. 
            In a production environment, this would use Instagram's official API with OAuth authentication.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>
                  Manage your social media accounts for automation
                </CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-connect-account">
                    <Plus className="h-4 w-4 mr-2" />
                    Connect Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Connect Instagram Account</DialogTitle>
                    <DialogDescription>
                      Enter your Instagram username to connect your account
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Instagram Username</Label>
                      <Input
                        id="username"
                        placeholder="your_username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        data-testid="input-username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profileUrl">Profile URL (Optional)</Label>
                      <Input
                        id="profileUrl"
                        placeholder="https://instagram.com/your_username"
                        value={profileUrl}
                        onChange={(e) => setProfileUrl(e.target.value)}
                        data-testid="input-profile-url"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleConnect}
                      disabled={connectMutation.isPending}
                      data-testid="button-confirm-connect"
                    >
                      {connectMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        "Connect Account"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading accounts...</p>
              </div>
            ) : accounts.length > 0 ? (
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={account.profileImageUrl || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-orange-400 text-white">
                          <Instagram className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{account.username}</h3>
                          {account.isActive ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Connected {new Date(account.connectedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(account.id)}
                      disabled={deleteMutation.isPending}
                      data-testid="button-disconnect-account"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Instagram}
                title="No accounts connected"
                description="Connect your Instagram account to start automating your posts"
                actionLabel="Connect Instagram"
                onAction={() => setDialogOpen(true)}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
