import { ScheduleConfig } from "@/components/ScheduleConfig";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Post } from "@/components/PostCard";

// todo: remove mock functionality
const MOCK_SCHEDULED_POSTS: Post[] = [
  {
    id: "1",
    imageUrl: "",
    caption: "Morning motivation post",
    scheduledDate: new Date(2025, 9, 30, 9, 0),
    status: "scheduled",
  },
  {
    id: "2",
    imageUrl: "",
    caption: "Afternoon update",
    scheduledDate: new Date(2025, 9, 30, 14, 0),
    status: "scheduled",
  },
];

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const postsForSelectedDate = MOCK_SCHEDULED_POSTS.filter(
    (post) =>
      selectedDate &&
      post.scheduledDate.toDateString() === selectedDate.toDateString()
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Schedule Manager</h1>
        <p className="text-muted-foreground mt-1">
          Configure your posting schedule and view upcoming posts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ScheduleConfig />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>Select a date to view posts</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Posts for {selectedDate.toLocaleDateString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {postsForSelectedDate.length > 0 ? (
                  <div className="space-y-2">
                    {postsForSelectedDate.map((post) => (
                      <div
                        key={post.id}
                        className="p-3 rounded-md border hover-elevate"
                        data-testid={`scheduled-post-${post.id}`}
                      >
                        <p className="text-sm font-medium line-clamp-1">
                          {post.caption}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {post.scheduledDate.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No posts scheduled
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
