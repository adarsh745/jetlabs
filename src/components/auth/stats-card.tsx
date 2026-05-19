import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatsCardProps = {
  icon: LucideIcon;
  value: string;
  label: string;
  description: string;
  className?: string;
};

export function StatsCard({
  icon: Icon,
  value,
  label,
  description,
  className,
}: StatsCardProps) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-border bg-card/80 p-5 text-white transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-accent/70",
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-2xl border border-border bg-muted text-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <p className="mt-6 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm font-medium text-white/90">{label}</p>
      <p className="mt-3 text-sm leading-6 text-white/65">{description}</p>
    </article>
  );
}
