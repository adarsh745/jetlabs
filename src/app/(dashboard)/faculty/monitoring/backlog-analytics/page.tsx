import { ModulePage } from "@/components/dashboard/module-page";
import { dashboardModules } from "@/data/dashboard-modules";

export default function BacklogAnalyticsPage() {
  return <ModulePage module={dashboardModules["/faculty/monitoring/backlog-analytics"]} />;
}
