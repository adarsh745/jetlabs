import { ModulePage } from "@/components/dashboard/module-page";
import { dashboardModules } from "@/data/dashboard-modules";

export default function TeamContributionPage() {
  return <ModulePage module={dashboardModules["/faculty/monitoring/team-contribution"]} />;
}
