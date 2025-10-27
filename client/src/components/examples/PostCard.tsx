import { PostCard } from "../PostCard";

export default function PostCardExample() {
  const mockPost = {
    id: "1",
    imageUrl: "",
    caption: "Excited to share our new collection! Check out the link in bio for exclusive deals. #fashion #newcollection #style",
    scheduledDate: new Date(2025, 9, 30, 14, 30),
    status: "scheduled" as const,
  };

  return (
    <div className="max-w-sm p-4">
      <PostCard
        post={mockPost}
        onEdit={(id) => console.log("Edit post:", id)}
        onDelete={(id) => console.log("Delete post:", id)}
        onReschedule={(id) => console.log("Reschedule post:", id)}
      />
    </div>
  );
}
