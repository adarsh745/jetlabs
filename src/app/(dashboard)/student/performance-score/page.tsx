import { ModulePage } from "@/components/dashboard/module-page";
import { dashboardModules } from "@/data/dashboard-modules";

export default function StudentPerformanceScorePage() {
  return <ModulePage module={dashboardModules["/student/performance-score"]} />;
}
