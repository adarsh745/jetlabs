import { redirect } from "next/navigation";
import { getDefaultDashboardPath } from "@/lib/auth/routing";
import { getSession, getSessionUserRole } from "@/lib/auth/session";

export default async function Home() {
  const session = await getSession();
  const role = getSessionUserRole(session);

  if (role) {
    redirect(getDefaultDashboardPath(role));
  }

  redirect("/login");
}
