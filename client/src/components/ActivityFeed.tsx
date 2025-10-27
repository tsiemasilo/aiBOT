import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock, Edit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  type: "posted" | "scheduled" | "failed" | "edited";
  message: string;
  timestamp: Date;
}

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: "1",
    type: "posted",
    message: "Post published successfully",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: "2",
    type: "scheduled",
    message: "New post scheduled for tomorrow",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: "3",
    type: "edited",
    message: "Post caption updated",
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
  },
  {
    id: "4",
    type: "posted",
    message: "Post published successfully",
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
  },
];

export function ActivityFeed() {
  const getIcon = (type: Activity["type"]) => {
    switch (type) {
      case "posted":
        return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case "edited":
        return <Edit className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest posting activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {MOCK_ACTIVITIES.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-md hover-elevate"
              data-testid={`activity-${activity.id}`}
            >
              <div className="mt-0.5">{getIcon(activity.type)}</div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{activity.message}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
