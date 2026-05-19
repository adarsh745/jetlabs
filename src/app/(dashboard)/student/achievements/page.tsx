import { ModulePage } from "@/components/dashboard/module-page";
import { dashboardModules } from "@/data/dashboard-modules";

export default function StudentAchievementsPage() {
  return <ModulePage module={dashboardModules["/student/achievements"]} />;
}
