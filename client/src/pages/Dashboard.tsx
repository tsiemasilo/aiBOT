import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AnalyticsCard } from "@/components/AnalyticsCard";
import { PostCard, Post } from "@/components/PostCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { EmptyState } from "@/components/EmptyState";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import { Calendar as CalendarIcon, Clock, CheckCircle, ImageIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import emptyStateImage from "@assets/generated_images/Empty_state_calendar_illustration_0d8d2e82.png";

export default function Dashboard() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
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
            Manage your Instagram posting schedule
          </p>
        </div>
        <CreatePostDialog 
          trigger={
            <Button data-testid="button-create-post">
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          }
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
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
              title="No scheduled posts yet"
              description="Start scheduling your Instagram posts to maintain a consistent presence on your profile."
              actionLabel="Create Your First Post"
              onAction={() => setCreateDialogOpen(true)}
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
