import { ModulePage } from "@/components/dashboard/module-page";
import { dashboardModules } from "@/data/dashboard-modules";

export default function AchievementAnalyticsPage() {
  return <ModulePage module={dashboardModules["/faculty/intelligence/achievement-analytics"]} />;
}
