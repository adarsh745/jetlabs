import { ModulePage } from "@/components/dashboard/module-page";
import { dashboardModules } from "@/data/dashboard-modules";

export default function IEEEPaperPage() {
  return <ModulePage module={dashboardModules["/student/research/ieee-paper"]} />;
}
