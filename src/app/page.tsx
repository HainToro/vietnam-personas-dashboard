import fs from "fs/promises";
import path from "path";
import { AnalyticsOverviewPayload } from "@/types/analytics";
import { OverviewDashboard } from "@/components/analytics/OverviewDashboard";

async function loadAnalyticsData(): Promise<AnalyticsOverviewPayload> {
  const filePath = path.join(process.cwd(), "public", "data", "analytics_overview.json");
  const rawContent = await fs.readFile(filePath, "utf-8");
  return JSON.parse(rawContent) as AnalyticsOverviewPayload;
}

export default async function HomePage() {
  const data = await loadAnalyticsData();

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <OverviewDashboard initialData={data} />
    </main>
  );
}
