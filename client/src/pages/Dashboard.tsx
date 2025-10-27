import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AnalyticsCard } from "@/components/AnalyticsCard";
import { PostCard, Post } from "@/components/PostCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { EmptyState } from "@/components/EmptyState";
import { Calendar as CalendarIcon, Clock, CheckCircle, ImageIcon, Sparkles, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import emptyStateImage from "@assets/generated_images/Empty_state_calendar_illustration_0d8d2e82.png";

interface QueuedPost {
  id: string;
  imageUrl: string;
  caption: string;
  sourceUsername: string;
  status: string;
  scheduledDate: Date;
  postData?: {
    timestamp?: number;
    likes?: number;
    comments?: number;
  };
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: posts = [], isLoading: isLoadingPosts } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    select: (data) => data.map(post => ({
      ...post,
      scheduledDate: new Date(post.scheduledDate)
    }))
  });

  const { data: queuedPosts = [], isLoading: isLoadingQueued } = useQuery<QueuedPost[]>({
    queryKey: ["/api/queued-posts"],
    select: (data) => data.map((post: any) => ({
      ...post,
      scheduledDate: new Date(post.scheduledDate)
    }))
  });

  const { data: automationSettings } = useQuery<{
    isProfileConfirmed?: boolean;
    sourceProfileData?: any;
  }>({
    queryKey: ["/api/automation"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post deleted",
        description: "The post has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEditPost = (id: string) => {
    console.log("Edit post:", id);
  };

  const handleDeletePost = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleReschedulePost = (id: string) => {
    console.log("Reschedule post:", id);
  };

  const isProfileConfirmed = automationSettings?.isProfileConfirmed;
  const sourceUsername = automationSettings?.sourceProfileData?.username;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Automated Instagram posting powered by AI
          </p>
        </div>
        <Button onClick={() => setLocation("/automation")} data-testid="button-setup-automation">
          <Sparkles className="h-4 w-4 mr-2" />
          Setup Automation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Scheduled Posts"
          value={posts.length}
          icon={CalendarIcon}
          trend={{ value: 12, positive: true }}
        />
        <AnalyticsCard
          title="Posted This Week"
          value={8}
          icon={CheckCircle}
          trend={{ value: 5, positive: true }}
        />
        <AnalyticsCard
          title="Queued Posts"
          value={queuedPosts.length}
          icon={Bot}
        />
        <AnalyticsCard
          title="Queue Time"
          value="2.5h"
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue={isProfileConfirmed ? "queued" : "manual"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="queued" data-testid="tab-queued">
                <Bot className="h-4 w-4 mr-2" />
                Automated Queue ({queuedPosts.length})
              </TabsTrigger>
              <TabsTrigger value="manual" data-testid="tab-manual">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Manual Posts ({posts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="queued" className="space-y-4 mt-4">
              {isProfileConfirmed && sourceUsername ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">Automated Queue</h2>
                      <p className="text-sm text-muted-foreground">
                        Posts randomly selected from @{sourceUsername}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setLocation("/automation")} data-testid="button-manage-automation">
                      Manage
                    </Button>
                  </div>

                  {isLoadingQueued ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Loading queued posts...</p>
                    </div>
                  ) : queuedPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {queuedPosts.map((queuedPost) => (
                        <Card key={queuedPost.id} className="overflow-hidden" data-testid={`card-queued-${queuedPost.id}`}>
                          <div className="aspect-square relative">
                            <img
                              src={queuedPost.imageUrl}
                              alt="Queued post"
                              className="w-full h-full object-cover"
                            />
                            <Badge className="absolute top-2 right-2 gap-1" data-testid={`badge-queued-${queuedPost.id}`}>
                              <Bot className="h-3 w-3" />
                              Automated
                            </Badge>
                          </div>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm font-medium">
                                From @{queuedPost.sourceUsername}
                              </CardTitle>
                              <span className="text-xs text-muted-foreground">
                                {queuedPost.scheduledDate.toLocaleDateString()}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {queuedPost.caption}
                            </p>
                            {queuedPost.postData && (
                              <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                                {queuedPost.postData.likes !== undefined && (
                                  <span>❤️ {queuedPost.postData.likes?.toLocaleString()}</span>
                                )}
                                {queuedPost.postData.comments !== undefined && (
                                  <span>💬 {queuedPost.postData.comments?.toLocaleString()}</span>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      image={emptyStateImage}
                      title="No queued posts available"
                      description="The automation is configured but no posts are available from the source profile."
                      actionLabel="Refresh Queue"
                      onAction={() => queryClient.invalidateQueries({ queryKey: ["/api/queued-posts"] })}
                    />
                  )}
                </>
              ) : (
                <EmptyState
                  image={emptyStateImage}
                  title="No automated posts yet"
                  description="Set up automation and confirm a source profile to see queued posts that will be automatically posted."
                  actionLabel="Setup Automation"
                  onAction={() => setLocation("/automation")}
                />
              )}
            </TabsContent>

            <TabsContent value="manual" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Manual Posts</h2>
                <Button variant="outline" size="sm" onClick={() => setLocation("/create")} data-testid="button-create-post">
                  Create Post
                </Button>
              </div>

              {isLoadingPosts ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading posts...</p>
                </div>
              ) : posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onEdit={handleEditPost}
                      onDelete={handleDeletePost}
                      onReschedule={handleReschedulePost}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  image={emptyStateImage}
                  title="No manual posts yet"
                  description="Create your first post manually to schedule content for your Instagram account."
                  actionLabel="Create Post"
                  onAction={() => setLocation("/create")}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
