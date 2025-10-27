import { EmptyState } from "../EmptyState";
import { Calendar } from "lucide-react";

export default function EmptyStateExample() {
  return (
    <EmptyState
      icon={Calendar}
      title="No scheduled posts yet"
      description="Start scheduling your Instagram posts to maintain a consistent presence on your profile."
      actionLabel="Create Your First Post"
      onAction={() => console.log("Create post clicked")}
    />
  );
}
