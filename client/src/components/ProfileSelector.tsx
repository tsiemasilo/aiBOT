import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Loader2, CheckCircle2, Instagram, Users, ImageIcon, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useEmblaCarousel from 'embla-carousel-react';

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
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' });

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

  const formatNumber = (num?: number) => {
    if (num === undefined) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const renderInstagramProfile = (profile: ProfilePreview, isConfirmedView: boolean = false) => (
    <div className="space-y-4">
      {isConfirmedView && (
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700 dark:text-green-400">
            Source profile confirmed
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-gradient-to-b from-muted/50 to-background p-6 rounded-xl border">
        <div className="flex flex-col items-center gap-4 mb-6">
          <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
            <AvatarImage src={profile.profilePicUrl} />
            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-orange-400 text-white text-2xl">
              <Instagram className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>

          <div className="text-center space-y-1">
            <h4 className="font-bold text-xl" data-testid={isConfirmedView ? "text-confirmed-username" : "text-preview-username"}>
              {profile.username}
            </h4>
            {profile.fullName && (
              <p className="text-sm text-muted-foreground font-medium">{profile.fullName}</p>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-8 mb-6 py-4 border-y">
          <div className="text-center">
            <div className="font-bold text-lg" data-testid="text-posts-count">{formatNumber(profile.postsCount)}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Posts</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg" data-testid="text-followers-count">{formatNumber(profile.followersCount)}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Followers</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg" data-testid="text-following-count">{formatNumber(profile.followingCount)}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Following</div>
          </div>
        </div>

        {profile.bio && (
          <div className="text-sm text-center mb-4 px-4">
            <p className="line-clamp-3">{profile.bio}</p>
          </div>
        )}

        {isConfirmedView && (
          <Badge variant="default" className="w-full justify-center gap-1 py-2">
            <CheckCircle2 className="h-4 w-4" />
            Confirmed Source
          </Badge>
        )}
      </div>

      {profile.recentPosts && profile.recentPosts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Recent Posts
            </h4>
            <span className="text-xs text-muted-foreground">
              {profile.recentPosts.length} posts available
            </span>
          </div>

          <div className="overflow-hidden rounded-lg border" ref={emblaRef}>
            <div className="flex gap-1">
              {profile.recentPosts.map((post, index) => (
                <div 
                  key={index} 
                  className="flex-[0_0_33.333%] min-w-0"
                  data-testid={`preview-post-${index}`}
                >
                  <div className="aspect-square bg-muted overflow-hidden">
                    {post.imageUrl && (
                      <img 
                        src={post.imageUrl} 
                        alt={`Post ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Swipe to see more posts from this profile
          </p>
        </div>
      )}
    </div>
  );

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
                <div className="pt-4 border-t space-y-4">
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

                  {renderInstagramProfile(profilePreview)}

                  <Alert>
                    <AlertDescription>
                      Confirming this profile will allow the automation to randomly select and repost content from @{profilePreview.username} to your connected Instagram account.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
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

              {confirmedProfile && renderInstagramProfile(confirmedProfile, true)}

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
