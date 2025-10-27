import { AnalyticsCard } from "../AnalyticsCard";
import { Calendar } from "lucide-react";

export default function AnalyticsCardExample() {
  return (
    <div className="max-w-xs p-4">
      <AnalyticsCard
        title="Scheduled Posts"
        value={24}
        icon={Calendar}
        trend={{ value: 12, positive: true }}
      />
    </div>
  );
}
