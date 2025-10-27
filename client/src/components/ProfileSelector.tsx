import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Loader2, CheckCircle2, Instagram, Users, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProfilePreview {
  username: string;
  fullName?: string;
  bio?: string;
  profilePicUrl?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  recentPosts?: Array<{
    imageUrl?: string;
    caption?: string;
    timestamp?: string;
  }>;
}

export function ProfileSelector() {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [profilePreview, setProfilePreview] = useState<ProfilePreview | null>(null);

  const { data: automationSettings } = useQuery<{
    sourceProfileUrl?: string;
    isProfileConfirmed?: boolean;
    sourceProfileData?: any;
  }>({
    queryKey: ["/api/automation"],
  });

  const searchProfileMutation = useMutation({
    mutationFn: async (profileUrl: string) => {
      const response = await apiRequest("POST", "/api/search-profile", { url: profileUrl });
      return response.json();
    },
    onSuccess: (data) => {
      setProfilePreview(data);
      toast({
        title: "Profile found",
        description: `Found @${data.username}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to find profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const confirmProfileMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/confirm-profile", { 
        url,
        profileData: profilePreview 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automation"] });
      toast({
        title: "Profile confirmed",
        description: "This profile will be used as the source for automated posts",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to confirm profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (!url) return;
    searchProfileMutation.mutate(url);
  };

  const handleConfirm = () => {
    confirmProfileMutation.mutate();
  };

  const isConfirmed = automationSettings?.isProfileConfirmed;
  const confirmedProfile = automationSettings?.sourceProfileData;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Source Profile</CardTitle>
          <CardDescription>
            Select an Instagram profile to repost content from
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConfirmed ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="source-profile-url">Instagram Profile URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="source-profile-url"
                    placeholder="https://instagram.com/username"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    data-testid="input-source-profile-url"
                  />
                  <Button 
                    onClick={handleSearch} 
                    disabled={!url || searchProfileMutation.isPending}
                    data-testid="button-search-profile"
                  >
                    {searchProfileMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {profilePreview && (
                <div className="pt-4 border-t">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Profile Preview</h3>
                      <Button 
                        onClick={handleConfirm}
                        disabled={confirmProfileMutation.isPending}
                        data-testid="button-confirm-profile"
                      >
                        {confirmProfileMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Confirming
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Confirm Profile
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={profilePreview.profilePicUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-orange-400 text-white text-xl">
                          <Instagram className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div>
                          <h4 className="font-semibold text-lg" data-testid="text-preview-username">
                            @{profilePreview.username}
                          </h4>
                          {profilePreview.fullName && (
                            <p className="text-sm text-muted-foreground">{profilePreview.fullName}</p>
                          )}
                        </div>
                        {profilePreview.bio && (
                          <p className="text-sm">{profilePreview.bio}</p>
                        )}
                        <div className="flex gap-4 text-sm">
                          {profilePreview.postsCount !== undefined && (
                            <div className="flex items-center gap-1">
                              <ImageIcon className="h-4 w-4" />
                              <span className="font-semibold">{profilePreview.postsCount}</span>
                              <span className="text-muted-foreground">posts</span>
                            </div>
                          )}
                          {profilePreview.followersCount !== undefined && (
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span className="font-semibold">{profilePreview.followersCount.toLocaleString()}</span>
                              <span className="text-muted-foreground">followers</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {profilePreview.recentPosts && profilePreview.recentPosts.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Recent Posts Preview</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {profilePreview.recentPosts.slice(0, 6).map((post, index) => (
                            <div 
                              key={index} 
                              className="aspect-square bg-muted rounded-md overflow-hidden"
                              data-testid={`preview-post-${index}`}
                            >
                              {post.imageUrl && (
                                <img 
                                  src={post.imageUrl} 
                                  alt={`Post ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Alert>
                      <AlertDescription>
                        Confirming this profile will allow the automation to randomly select and repost content from @{profilePreview.username} to your connected Instagram account.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700 dark:text-green-400">
                  Source profile confirmed
                </AlertDescription>
              </Alert>

              <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={confirmedProfile?.profilePicUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-orange-400 text-white text-xl">
                    <Instagram className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div>
                    <h4 className="font-semibold text-lg" data-testid="text-confirmed-username">
                      @{confirmedProfile?.username}
                    </h4>
                    {confirmedProfile?.fullName && (
                      <p className="text-sm text-muted-foreground">{confirmedProfile.fullName}</p>
                    )}
                  </div>
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Confirmed
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    queryClient.setQueryData(["/api/automation"], {
                      ...automationSettings,
                      isProfileConfirmed: false,
                    });
                    setProfilePreview(null);
                    setUrl("");
                  }}
                  data-testid="button-change-profile"
                >
                  Change Profile
                </Button>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h4 className="font-medium mb-2">How it works</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Random posts will be selected from @{confirmedProfile?.username}'s feed</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Captions will be paraphrased to match their style and lingo</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Content will be posted to your connected Instagram account automatically</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
