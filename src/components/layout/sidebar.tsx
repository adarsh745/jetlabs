"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Orbit } from "lucide-react";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getNavigationForRole,
  isNavigationItemActive,
} from "@/lib/navigation";
import { useUIStore } from "@/store/ui-store";
import type { AppShellUser } from "@/types/aoip";

type SidebarProps = {
  user: AppShellUser;
};

type SidebarPanelProps = SidebarProps & {
  collapsed: boolean;
  onNavigate?: () => void;
};

function SidebarPanel({ user, collapsed, onNavigate }: SidebarPanelProps) {
  const pathname = usePathname();
  const sections = getNavigationForRole(user.role);

  return (
    <div className="flex h-full flex-col overflow-hidden border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl">
      <div
        className={cn(
          "flex h-20 items-center gap-4 border-b border-sidebar-border px-6",
          collapsed && "justify-center px-0",
        )}
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-card text-foreground">
          <Orbit className="size-5" />
        </div>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-[0.18em] text-foreground">
              SYNTRA
            </p>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              AOIP
            </p>
          </div>
        ) : null}
      </div>

      <div className="scrollbar-subtle flex-1 overflow-y-auto px-4 py-5">
        <nav className="space-y-6">
          {sections.map((section) => (
            <div key={section.label} className="space-y-2">
              {!collapsed ? (
                <p className="px-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  {section.label}
                </p>
              ) : null}

              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const active = isNavigationItemActive(pathname, item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={item.title}
                      onClick={onNavigate}
                      className={cn(
                        "group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 transition duration-200",
                        active
                          ? "border-border bg-card text-foreground shadow-[0_14px_34px_rgba(0,0,0,0.24)]"
                          : "text-muted-foreground hover:border-border/70 hover:bg-accent hover:text-foreground",
                        collapsed && "justify-center px-0",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-2xl border transition",
                          active
                            ? "border-border bg-muted text-foreground"
                            : "border-transparent bg-transparent text-muted-foreground group-hover:border-border/70 group-hover:bg-muted group-hover:text-foreground",
                        )}
                      >
                        <Icon className="size-4" />
                      </span>

                      {!collapsed ? (
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {item.title}
                          </span>
                          <span className="mt-1 block truncate text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        </span>
                      ) : null}

                      {!collapsed && item.badge ? (
                        <Badge variant={active ? "default" : "outline"}>{item.badge}</Badge>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className={cn("border-t border-sidebar-border p-4", collapsed && "px-3")}>
        {!collapsed ? (
          <div className="rounded-2xl border border-border bg-card px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">Execution cycle</p>
                <p className="mt-1 text-xs text-muted-foreground">Week 9 review window active</p>
              </div>
              <Badge variant="secondary">Live</Badge>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Badge variant="secondary">Live</Badge>
          </div>
        )}
      </div>
    </div>
  );
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden lg:block",
          sidebarCollapsed ? "w-24" : "w-72",
        )}
      >
        <SidebarPanel user={user} collapsed={sidebarCollapsed} />
      </aside>

      <AnimatePresence>
        {sidebarOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.button
              type="button"
              aria-label="Close sidebar"
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -28, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -28, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative z-10 h-full w-[86vw] max-w-80"
            >
              <SidebarPanel
                user={user}
                collapsed={false}
                onNavigate={() => setSidebarOpen(false)}
              />
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
