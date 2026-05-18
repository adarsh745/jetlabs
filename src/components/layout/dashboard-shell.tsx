"use client";

import Link from "next/link";
import { startTransition, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { signOutFromSession } from "@/services/auth-service";
import type { UserRole } from "@/types/auth";
import {
  LayoutDashboard,
  Compass,
  Upload,
  FileText,
  BookOpen,
  Users,
  ClipboardList,
  BarChart3,
  Trophy,
  Bell,
  Search,
  Moon,
  LogOut,
  LoaderCircle,
  Sparkles,
  GraduationCap,
  Activity,
  HeartPulse,
  Zap,
  BookOpenCheck,
  Presentation,
  BookX,
  Gauge,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

const STUDENT_NAV: NavItem[] = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/problems", label: "Problem Marketplace", icon: Compass },
  {
    href: "/student/submissions",
    label: "Weekly Submissions",
    icon: Upload,
    badge: "1",
  },
  { href: "/student/paper", label: "IEEE Paper", icon: FileText },
  { href: "/student/literature", label: "Literature Review", icon: BookOpen },
  { href: "/student/final", label: "Final Submission", icon: Trophy },
  {
    href: "/student/playbooks",
    label: "Execution Playbooks",
    icon: BookOpenCheck,
  },
  { href: "/student/viva", label: "Viva Readiness", icon: Presentation },
  { href: "/student/achievements", label: "Achievements", icon: Trophy },
  { href: "/student/performance", label: "Performance Score", icon: Gauge },
  { href: "/student/profile", label: "My Profile", icon: GraduationCap },
];

const FACULTY_NAV: NavItem[] = [
  { href: "/faculty", label: "Dashboard", icon: LayoutDashboard },
  { href: "/faculty/students", label: "Students", icon: GraduationCap },
  { href: "/faculty/teams", label: "Teams & Batches", icon: Users },
  {
    href: "/faculty/reviews",
    label: "Review Queue",
    icon: ClipboardList,
    badge: "22",
  },
  { href: "/faculty/quick-review", label: "Quick Review", icon: Zap },
  { href: "/faculty/health", label: "Project Health", icon: HeartPulse },
  {
    href: "/faculty/contribution",
    label: "Team Contribution",
    icon: Activity,
  },
  { href: "/faculty/viva", label: "Viva Readiness", icon: Presentation },
  { href: "/faculty/backlogs", label: "Backlog Analytics", icon: BookX },
  {
    href: "/faculty/achievements",
    label: "Achievement Analytics",
    icon: Trophy,
  },
  { href: "/faculty/performance", label: "Performance Score", icon: Gauge },
  { href: "/faculty/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/faculty/problems", label: "Problem Library", icon: Compass },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
];

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  STUDENT: STUDENT_NAV,
  FACULTY: FACULTY_NAV,
  ADMIN: ADMIN_NAV,
};

const ROLE_LABELS: Record<UserRole, string> = {
  STUDENT: "Student",
  FACULTY: "Faculty",
  ADMIN: "Administrator",
};

type DashboardShellProps = {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email: string;
    role: UserRole;
  };
};

function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const items = NAV_BY_ROLE[user.role];
  const displayName = user.name?.trim() || user.email;
  const subtitle = `${ROLE_LABELS[user.role]} · ${user.email}`;

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

    startTransition(() => {
      router.replace("/login");
      router.refresh();
    });
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <span className="font-medium">Syntra</span>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="size-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge ? (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {item.badge}
                  </Badge>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2.5">
            <Avatar className="size-8">
              <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm">{displayName}</div>
              <div className="truncate text-xs text-muted-foreground">
                {subtitle}
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSignOut}
              disabled={isSigningOut}
              aria-label="Sign out"
            >
              {isSigningOut ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-border px-6">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 pl-9"
              placeholder="Search problems, teams, papers..."
            />
          </div>
          <div className="flex-1" />
          <Button size="icon" variant="ghost">
            <Moon className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" className="relative">
            <Bell className="size-4" />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-destructive" />
          </Button>
        </header>

        <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
