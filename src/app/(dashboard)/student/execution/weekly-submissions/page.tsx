import { ModulePage } from "@/components/dashboard/module-page";
import { dashboardModules } from "@/data/dashboard-modules";

export default function WeeklySubmissionsPage() {
  return <ModulePage module={dashboardModules["/student/execution/weekly-submissions"]} />;
}
