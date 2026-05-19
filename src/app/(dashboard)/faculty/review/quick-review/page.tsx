import { ModulePage } from "@/components/dashboard/module-page";
import { dashboardModules } from "@/data/dashboard-modules";

export default function QuickReviewPage() {
  return <ModulePage module={dashboardModules["/faculty/review/quick-review"]} />;
}
