import Link from "next/link";
import { AlertTriangle, ArrowRight, HeartPulse, ShieldAlert, Workflow } from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { StatsCard } from "@/components/dashboard/stats-card";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DataTable, type DataTableColumn } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ProjectHealthData, ProjectHealthTeam } from "@/types/aoip";

function riskVariant(score: number) {
  if (score >= 75) {
    return "destructive";
  }

  if (score >= 45) {
    return "outline";
  }

  return "secondary";
}

function heatmapClass(value: number) {
  if (value >= 5) {
    return "bg-white";
  }

  if (value >= 4) {
    return "bg-white/75";
  }

  if (value >= 3) {
    return "bg-white/[0.45]";
  }

  if (value >= 2) {
    return "bg-white/[0.25]";
  }

  return "bg-white/[0.12]";
}

type ProjectHealthBoardProps = {
  data: ProjectHealthData;
};

export function ProjectHealthBoard({ data }: ProjectHealthBoardProps) {
  const columns: DataTableColumn<ProjectHealthTeam>[] = [
    {
      key: "team",
      header: "Team",
      cell: (team) => (
        <div className="space-y-1">
          <p className="font-medium text-foreground">{team.team}</p>
          <p className="text-sm text-muted-foreground">{team.project}</p>
        </div>
      ),
    },
    {
      key: "mentor",
      header: "Mentor",
      cell: (team) => <span className="text-sm text-muted-foreground">{team.mentor}</span>,
    },
    {
      key: "completion",
      header: "Completion",
      cell: (team) => (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{team.completion}%</span>
            <Badge variant={riskVariant(team.riskScore)}>{team.velocity}</Badge>
          </div>
          <Progress value={team.completion} />
        </div>
      ),
    },
    {
      key: "risk",
      header: "Risk",
      cell: (team) => (
        <div className="space-y-2">
          <Badge variant={riskVariant(team.riskScore)}>{team.riskScore} / 100</Badge>
          <p className="text-xs text-muted-foreground">
            {team.backlogItems} backlog · {team.missedSubmissions} missed
          </p>
        </div>
      ),
    },
    {
      key: "heatmap",
      header: "Contribution heatmap",
      cell: (team) => (
        <div className="grid grid-cols-5 gap-1">
          {team.contributionHeatmap.map((value, index) => (
            <span
              key={`${team.id}-${index}`}
              className={cn("size-4 rounded-sm", heatmapClass(value))}
            />
          ))}
        </div>
      ),
    },
    {
      key: "alerts",
      header: "Alerts",
      cell: (team) => (
        <div className="space-y-2">
          {team.alerts.map((alert) => (
            <p key={alert} className="text-sm text-muted-foreground">
              {alert}
            </p>
          ))}
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      eyebrow="Faculty monitoring"
      title="Project Health"
      description="Risk scoring, backlog pressure, contribution density, and velocity signals fused into one faculty intervention board."
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/faculty/review/review-queue">Open review queue</Link>
          </Button>
          <Button>
            Sync intervention board
            <ArrowRight className="size-4" />
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <StatsCard
          label={data.stats[0]?.label ?? "Healthy projects"}
          value={data.stats[0]?.value ?? "0"}
          detail={data.stats[0]?.detail ?? "No project health data yet"}
          tone={data.stats[0]?.tone}
          icon={HeartPulse}
        />
        <StatsCard
          label={data.stats[1]?.label ?? "Attention needed"}
          value={data.stats[1]?.value ?? "0"}
          detail={data.stats[1]?.detail ?? "No intervention signals yet"}
          tone={data.stats[1]?.tone}
          icon={AlertTriangle}
        />
        <StatsCard
          label={data.stats[2]?.label ?? "Missed submissions"}
          value={data.stats[2]?.value ?? "0"}
          detail={data.stats[2]?.detail ?? "No missed delivery windows"}
          tone={data.stats[2]?.tone}
          icon={ShieldAlert}
        />
        <StatsCard
          label={data.stats[3]?.label ?? "Delivery velocity"}
          value={data.stats[3]?.value ?? "0%"}
          detail={data.stats[3]?.detail ?? "No velocity data yet"}
          tone={data.stats[3]?.tone}
          icon={Workflow}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <AnalyticsChart
          title="Project velocity"
          description="Planned versus delivered work each sprint so faculty can see where execution is slipping."
          data={data.velocitySeries}
          type="bar"
          series={[
            { key: "planned", label: "Planned", color: "var(--color-chart-3)" },
            { key: "delivered", label: "Delivered", color: "var(--color-chart-1)" },
          ]}
        />

        <AnalyticsChart
          title="Backlog status"
          description="Open backlog pressure and critical blockers across the current operating window."
          data={data.backlogSeries}
          type="area"
          series={[
            { key: "open", label: "Open", color: "var(--color-chart-2)" },
            { key: "critical", label: "Critical", color: "var(--color-chart-4)" },
          ]}
        />
      </div>

      <ActivityFeed
        title="Faculty alerts"
        description="The most meaningful health changes requiring attention right now."
        items={data.alerts}
      />

      <DataTable
        columns={columns}
        data={data.teams}
        getRowId={(team) => team.id}
        emptyState={
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">No monitored teams found.</p>
            <p className="text-sm text-muted-foreground">Project health data will appear here once teams are onboarded.</p>
          </div>
        }
      />
    </PageContainer>
  );
}
