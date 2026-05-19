import { ModulePage } from "@/components/dashboard/module-page";
import { dashboardModules } from "@/data/dashboard-modules";

export default function ExecutionPlaybookPage() {
  return <ModulePage module={dashboardModules["/student/execution/execution-playbook"]} />;
}
