"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Command,
  LogOut,
  Menu,
  PanelLeft,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDefaultDashboardPath } from "@/lib/auth/routing";
import { cn } from "@/lib/utils";
import {
  getActiveNavigationItem,
  getBreadcrumbs,
  getProfileHref,
  getSearchPlaceholder,
  ROLE_LABELS,
} from "@/lib/navigation";
import { signOutFromSession } from "@/services/auth-service";
import { useUIStore } from "@/store/ui-store";
import type { AppShellUser } from "@/types/aoip";

type NavbarProps = {
  user: AppShellUser;
};

function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const toggleSidebarCollapsed = useUIStore(
    (state) => state.toggleSidebarCollapsed,
  );
  const activeItem = getActiveNavigationItem(user.role, pathname);
  const breadcrumbs = getBreadcrumbs(user.role, pathname);
  const displayName = user.name?.trim() || user.email;
  const searchPlaceholder = getSearchPlaceholder(user.role, pathname);

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    const result = await signOutFromSession();

    if (!result.success) {
      setIsSigningOut(false);
      toast.error(result.message);
      return;
    }

    router.replace("/auth/login");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/88 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-[1680px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={toggleSidebar}
            aria-label="Open navigation"
          >
            <Menu className="size-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden lg:inline-flex"
            onClick={toggleSidebarCollapsed}
            aria-label="Toggle sidebar width"
          >
            <PanelLeft className="size-4" />
          </Button>
        </div>

        <div className="min-w-0 flex-1">
          <nav className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
              <div key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                {crumb.href ? (
                  <Link className="transition hover:text-foreground" href={crumb.href}>
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 ? <span>/</span> : null}
              </div>
            ))}
          </nav>

          <div className="mt-1 flex flex-wrap items-center gap-3">
            <p className="truncate text-sm font-semibold text-foreground">
              {activeItem?.title ?? "Workspace"}
            </p>
            <Badge variant="secondary">{ROLE_LABELS[user.role]} workspace</Badge>
            {activeItem?.description ? (
              <p className="hidden truncate text-sm text-muted-foreground xl:block">
                {activeItem.description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="hidden w-[360px] xl:block">
          <div className="relative">
            <Input className="pl-11" placeholder={searchPlaceholder} />
            <Command className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <Button type="button" variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>

        <details className="group relative">
          <summary
            className={cn(
              "list-none cursor-pointer rounded-2xl border border-border bg-card px-3 py-2 transition hover:bg-accent [&::-webkit-details-marker]:hidden",
            )}
          >
            <div className="inline-flex items-center gap-3 text-left">
              <Avatar className="size-10 border border-border">
                <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
              </Avatar>
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-sm font-medium text-foreground">
                  {displayName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
              <ChevronDown className="size-4 text-muted-foreground transition group-open:rotate-180" />
            </div>
          </summary>

          <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-border bg-card p-3 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
            <div className="rounded-2xl border border-border bg-muted px-4 py-4">
              <div className="flex items-start gap-3">
                <Avatar className="size-12 border border-border">
                  <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {displayName}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="secondary">{ROLE_LABELS[user.role]}</Badge>
                    <Badge variant="outline">Secure session</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <Link
                href={getProfileHref(user.role)}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <UserCircle2 className="size-4" />
                <span>Open profile workspace</span>
              </Link>
              <Link
                href={getDefaultDashboardPath(user.role)}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <ShieldCheck className="size-4" />
                <span>Return to role dashboard</span>
              </Link>
            </div>

            <div className="mt-3 border-t border-border pt-3">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                <LogOut className="size-4" />
                {isSigningOut ? "Signing out..." : "Sign out"}
              </Button>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
