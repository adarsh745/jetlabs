import { ModulePage } from "@/components/dashboard/module-page";
import { dashboardModules } from "@/data/dashboard-modules";

export default function FacultyTeamsBatchesPage() {
  return <ModulePage module={dashboardModules["/faculty/management/teams-batches"]} />;
}
