import { ModulePage } from "@/components/dashboard/module-page";
import { dashboardModules } from "@/data/dashboard-modules";

export default function FinalSubmissionPage() {
  return <ModulePage module={dashboardModules["/student/execution/final-submission"]} />;
}
