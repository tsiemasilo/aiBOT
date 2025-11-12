import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Instagram, Plus, Trash2, CheckCircle2, AlertCircle, RefreshCw, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { EmptyState } from "@/components/EmptyState";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { formatDistanceToNow } from "date-fns";

interface ConnectedAccount {
  id: string;
  platform: string;
  username: string;
  accessToken?: string | null;
  instagramBusinessAccountId?: string | null;
  tokenExpiresAt?: Date | null;
  metadata?: any;
  profileUrl?: string | null;
  profileImageUrl?: string | null;
  isActive: boolean;
  connectedAt: Date;
  lastSyncedAt?: Date | null;
}

export default function Settings() {
  const { toast } = useToast();

  const { data: accounts = [], isLoading } = useQuery<ConnectedAccount[]>({
    queryKey: ["/api/accounts"],
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const error = params.get('error');

    if (connected === 'true') {
      toast({
        title: "Instagram Connected",
        description: "Your Instagram Business account has been successfully connected!",
      });
      window.history.replaceState({}, '', '/settings');
    } else if (error) {
      toast({
        title: "Connection Failed",
        description: decodeURIComponent(error),
        variant: "destructive",
      });
      window.history.replaceState({}, '', '/settings');
    }
  }, [toast]);

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
    window.location.href = '/auth/instagram';
  };

  const handleReconnect = () => {
    window.location.href = '/auth/instagram';
  };

  const isTokenExpired = (account: ConnectedAccount) => {
    if (!account.tokenExpiresAt) return false;
    return new Date(account.tokenExpiresAt) < new Date();
  };

  const getTokenExpiryInfo = (account: ConnectedAccount) => {
    if (!account.tokenExpiresAt) return null;
    const expiresAt = new Date(account.tokenExpiresAt);
    const now = new Date();
    
    if (expiresAt < now) {
      return { expired: true, text: "Token expired" };
    }
    
    return { 
      expired: false, 
      text: `Expires ${formatDistanceToNow(expiresAt, { addSuffix: true })}` 
    };
  };

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your connected Instagram Business accounts
          </p>
        </div>

        <Alert variant="default">
          <Info className="h-4 w-4" />
          <AlertTitle>Instagram Business Account Required</AlertTitle>
          <AlertDescription>
            To use this app, you need an Instagram Business Account connected to a Facebook Page. 
            Make sure you have converted your Instagram account to a Business account and linked it to a Facebook Page before connecting.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>
                  Manage your Instagram Business accounts for posting
                </CardDescription>
              </div>
              <Button 
                onClick={handleConnect}
                data-testid="button-connect-instagram"
              >
                <Plus className="h-4 w-4 mr-2" />
                Connect Instagram
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading accounts...</p>
              </div>
            ) : accounts.length > 0 ? (
              <div className="space-y-4">
                {accounts.map((account) => {
                  const tokenInfo = getTokenExpiryInfo(account);
                  const expired = isTokenExpired(account);
                  
                  return (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={account.profileImageUrl || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-400 to-orange-400 text-white">
                            <Instagram className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{account.username}</h3>
                            {expired ? (
                              <Badge variant="destructive" className="gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Expired
                              </Badge>
                            ) : account.isActive ? (
                              <Badge variant="default" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          <div className="space-y-1 mt-1">
                            <p className="text-sm text-muted-foreground">
                              Connected {new Date(account.connectedAt).toLocaleDateString()}
                            </p>
                            {account.instagramBusinessAccountId && (
                              <p className="text-xs text-muted-foreground">
                                Business ID: {account.instagramBusinessAccountId}
                              </p>
                            )}
                            {tokenInfo && (
                              <p className={`text-xs ${expired ? 'text-destructive' : 'text-muted-foreground'}`}>
                                {tokenInfo.text}
                              </p>
                            )}
                            {account.lastSyncedAt && (
                              <p className="text-xs text-muted-foreground">
                                Last synced {formatDistanceToNow(new Date(account.lastSyncedAt), { addSuffix: true })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {expired && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReconnect}
                            data-testid="button-reconnect-account"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reconnect
                          </Button>
                        )}
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
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Instagram}
                title="No accounts connected"
                description="Connect your Instagram Business account to start posting automatically"
                actionLabel="Connect Instagram"
                onAction={handleConnect}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
