import { ModulePage } from "@/components/dashboard/module-page";
import { dashboardModules } from "@/data/dashboard-modules";

export default function FacultyPerformanceScorePage() {
  return <ModulePage module={dashboardModules["/faculty/intelligence/performance-score"]} />;
}
