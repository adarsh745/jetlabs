import { ModulePage } from "@/components/dashboard/module-page";
import { dashboardModules } from "@/data/dashboard-modules";

export default function FacultyStudentsPage() {
  return <ModulePage module={dashboardModules["/faculty/management/students"]} />;
}
