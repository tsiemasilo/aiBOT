import { ContentStyleAnalyzer } from "@/components/ContentStyleAnalyzer";

export default function Analyzer() {
  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Profile Analyzer</h1>
          <p className="text-muted-foreground mt-1">
            Analyze Instagram profiles to get content inspiration and insights
          </p>
        </div>

        <ContentStyleAnalyzer />
      </div>
    </div>
  );
}
