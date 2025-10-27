import { CreatePostDialog } from "../CreatePostDialog";
import { Button } from "@/components/ui/button";

export default function CreatePostDialogExample() {
  return (
    <CreatePostDialog
      trigger={<Button>Create Post</Button>}
    />
  );
}
