import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Calendar, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

export interface Post {
  id: string;
  imageUrl: string;
  caption: string;
  scheduledDate: Date;
  status: "scheduled" | "posted" | "failed";
}

interface PostCardProps {
  post: Post;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onReschedule?: (id: string) => void;
}

export function PostCard({ post, onEdit, onDelete, onReschedule }: PostCardProps) {
  const statusColors = {
    scheduled: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    posted: "bg-green-500/10 text-green-600 dark:text-green-400",
    failed: "bg-red-500/10 text-red-600 dark:text-red-400",
  };

  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`card-post-${post.id}`}>
      <div className="relative aspect-square">
        <div
          className="h-full w-full bg-gradient-to-br from-purple-400 to-orange-400"
          style={{
            backgroundImage: post.imageUrl ? `url(${post.imageUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute top-2 right-2">
          <Badge className={statusColors[post.status]} data-testid={`badge-status-${post.status}`}>
            {post.status}
          </Badge>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <p className="text-sm text-white line-clamp-2">{post.caption}</p>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1" data-testid={`text-date-${post.id}`}>
            <Calendar className="h-4 w-4" />
            <span>{format(post.scheduledDate, "MMM dd, yyyy")}</span>
          </div>
          <div className="flex items-center gap-1" data-testid={`text-time-${post.id}`}>
            <Clock className="h-4 w-4" />
            <span>{format(post.scheduledDate, "hh:mm a")}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => onEdit?.(post.id)} data-testid={`button-edit-${post.id}`}>
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid={`button-menu-${post.id}`}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onReschedule?.(post.id)} data-testid={`menu-reschedule-${post.id}`}>
                Reschedule
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(post.id)} className="text-destructive" data-testid={`menu-delete-${post.id}`}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
