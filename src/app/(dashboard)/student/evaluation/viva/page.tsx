import { ModulePage } from "@/components/dashboard/module-page";
import { dashboardModules } from "@/data/dashboard-modules";

export default function StudentVivaPage() {
  return <ModulePage module={dashboardModules["/student/evaluation/viva"]} />;
}
