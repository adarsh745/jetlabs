import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getDefaultDashboardPath } from "@/lib/auth/routing";
import { getSession, getSessionUserRole } from "@/lib/auth/session";

export default async function LoginPage() {
  const session = await getSession();
  const role = getSessionUserRole(session);

  if (role) {
    redirect(getDefaultDashboardPath(role));
  }

  return <LoginForm />;
}
