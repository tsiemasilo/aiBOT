import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsCard } from "@/components/AnalyticsCard";
import { TrendingUp, Users, Heart, MessageCircle, Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// todo: remove mock functionality
const ENGAGEMENT_DATA = [
  { day: "Mon", engagement: 245 },
  { day: "Tue", engagement: 312 },
  { day: "Wed", engagement: 189 },
  { day: "Thu", engagement: 421 },
  { day: "Fri", engagement: 356 },
  { day: "Sat", engagement: 498 },
  { day: "Sun", engagement: 523 },
];

const TOP_POSTS = [
  { id: "1", likes: 1234, comments: 89, caption: "Summer vibes collection" },
  { id: "2", likes: 987, comments: 56, caption: "Behind the scenes" },
  { id: "3", likes: 876, comments: 43, caption: "New arrivals alert" },
];

export default function Analytics() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your Instagram performance and engagement
          </p>
        </div>
        <Select defaultValue="7days">
          <SelectTrigger className="w-40" data-testid="select-timeframe">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Total Reach"
          value="12.4K"
          icon={Eye}
          trend={{ value: 23, positive: true }}
        />
        <AnalyticsCard
          title="Engagement Rate"
          value="4.2%"
          icon={TrendingUp}
          trend={{ value: 8, positive: true }}
        />
        <AnalyticsCard
          title="New Followers"
          value={342}
          icon={Users}
          trend={{ value: 15, positive: true }}
        />
        <AnalyticsCard
          title="Avg. Likes"
          value={845}
          icon={Heart}
          trend={{ value: -3, positive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Engagement</CardTitle>
            <CardDescription>Your engagement trends over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {ENGAGEMENT_DATA.map((data) => (
                <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center h-48">
                    <div
                      className="w-full bg-primary rounded-t-md"
                      style={{ height: `${(data.engagement / 600) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{data.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Posts</CardTitle>
            <CardDescription>This week's best content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {TOP_POSTS.map((post, index) => (
                <div
                  key={post.id}
                  className="p-3 rounded-md border hover-elevate"
                  data-testid={`top-post-${index + 1}`}
                >
                  <p className="text-sm font-medium mb-2 line-clamp-1">
                    {post.caption}
                  </p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>{post.likes.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{post.comments}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Best Times to Post</CardTitle>
          <CardDescription>
            Based on your audience engagement patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { day: "Weekdays", time: "9:00 AM", score: "High" },
              { day: "Weekdays", time: "2:00 PM", score: "Medium" },
              { day: "Weekends", time: "7:00 PM", score: "Very High" },
              { day: "Weekends", time: "11:00 AM", score: "High" },
            ].map((slot, index) => (
              <div
                key={index}
                className="p-4 border rounded-md text-center"
                data-testid={`time-slot-${index}`}
              >
                <p className="text-sm font-medium">{slot.day}</p>
                <p className="text-2xl font-semibold my-2">{slot.time}</p>
                <p className="text-xs text-muted-foreground">{slot.score}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
