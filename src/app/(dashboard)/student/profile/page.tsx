import { ModulePage } from "@/components/dashboard/module-page";
import { dashboardModules } from "@/data/dashboard-modules";

export default function StudentProfilePage() {
  return <ModulePage module={dashboardModules["/student/profile"]} />;
}
