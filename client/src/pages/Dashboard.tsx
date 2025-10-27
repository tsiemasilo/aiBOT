import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AnalyticsCard } from "@/components/AnalyticsCard";
import { PostCard, Post } from "@/components/PostCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { EmptyState } from "@/components/EmptyState";
import { Calendar as CalendarIcon, Clock, CheckCircle, ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import emptyStateImage from "@assets/generated_images/Empty_state_calendar_illustration_0d8d2e82.png";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    select: (data) => data.map(post => ({
      ...post,
      scheduledDate: new Date(post.scheduledDate)
    }))
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
          title="Drafts"
          value={3}
          icon={ImageIcon}
        />
        <AnalyticsCard
          title="Queue Time"
          value="2.5h"
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Upcoming Posts</h2>
            <Button variant="outline" size="sm" data-testid="button-view-all">
              View All
            </Button>
          </div>
          {isLoading ? (
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
              title="No automated posts yet"
              description="Set up automation to automatically generate and schedule Instagram posts based on analyzed content patterns."
              actionLabel="Setup Automation"
              onAction={() => setLocation("/automation")}
            />
          )}
        </div>

        <div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
