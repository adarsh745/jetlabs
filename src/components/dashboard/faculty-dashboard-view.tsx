import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardCheck,
  LineChart,
  Users2,
} from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { ProgressWidget } from "@/components/dashboard/progress-widget";
import { StatsCard } from "@/components/dashboard/stats-card";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FacultyDashboardData } from "@/types/aoip";

function riskVariant(risk: string) {
  if (risk === "Low") {
    return "secondary";
  }

  if (risk === "High") {
    return "destructive";
  }

  return "outline";
}

type FacultyDashboardViewProps = {
  data: FacultyDashboardData;
};

export function FacultyDashboardView({ data }: FacultyDashboardViewProps) {
  return (
    <PageContainer
      eyebrow="Faculty dashboard"
      title={data.header.title}
      description={data.header.subtitle}
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/faculty/monitoring/project-health">Project health</Link>
          </Button>
          <Button asChild>
            <Link href="/faculty/review/review-queue">
              Open review queue
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <StatsCard
          label={data.stats[0]?.label ?? "Active teams"}
          value={data.stats[0]?.value ?? "0"}
          detail={data.stats[0]?.detail ?? "No assigned teams yet"}
          tone={data.stats[0]?.tone}
          icon={Users2}
        />
        <StatsCard
          label={data.stats[1]?.label ?? "Pending reviews"}
          value={data.stats[1]?.value ?? "0"}
          detail={data.stats[1]?.detail ?? "No pending review work"}
          tone={data.stats[1]?.tone}
          icon={ClipboardCheck}
        />
        <StatsCard
          label={data.stats[2]?.label ?? "At-risk projects"}
          value={data.stats[2]?.value ?? "0"}
          detail={data.stats[2]?.detail ?? "No projects are at risk"}
          tone={data.stats[2]?.tone}
          icon={AlertTriangle}
        />
        <StatsCard
          label={data.stats[3]?.label ?? "Cohort performance"}
          value={data.stats[3]?.value ?? "0"}
          detail={data.stats[3]?.detail ?? "Performance metrics will appear here"}
          tone={data.stats[3]?.tone}
          icon={LineChart}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <AnalyticsChart
          title="Submission analytics"
          description="Weekly review throughput, submitted evidence packs, and escalations in one operating chart."
          data={data.submissionSeries}
          type="bar"
          series={[
            { key: "submitted", label: "Submitted", color: "var(--color-chart-1)" },
            { key: "reviewed", label: "Reviewed", color: "var(--color-chart-2)" },
            { key: "escalated", label: "Escalated", color: "var(--color-chart-4)" },
          ]}
        />

        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>Quick review access</CardTitle>
            <CardDescription>
              Fast lanes for the work that should not require a full operational detour.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.quickReview.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border bg-muted/40 p-4"
              >
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.detail}
                </p>
                <Button className="mt-4" variant="outline">
                  {item.actionLabel}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AnalyticsChart
          title="Student performance graph"
          description="Cohort score movement against the target performance band for the current cycle."
          data={data.performanceSeries}
          type="line"
          series={[
            { key: "performance", label: "Performance", color: "var(--color-chart-1)" },
            { key: "target", label: "Target", color: "var(--color-chart-3)" },
          ]}
        />

        <AnalyticsChart
          title="Backlog trend analysis"
          description="Open academic backlogs versus clears so faculty can plan intervention bandwidth."
          data={data.backlogSeries}
          type="area"
          series={[
            { key: "open", label: "Open", color: "var(--color-chart-2)" },
            { key: "cleared", label: "Cleared", color: "var(--color-chart-1)" },
          ]}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
          {data.healthIndicators.map((item) => (
            <ProgressWidget key={item.title} {...item} />
          ))}
        </div>

        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>Top performing teams</CardTitle>
            <CardDescription>
              Current leaders by research discipline, delivery consistency, and score stability.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.topTeams.map((team) => (
              <div
                key={team.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{team.team}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{team.domain}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={riskVariant(team.risk)}>{team.risk} risk</Badge>
                  <Badge variant="outline">{team.progress}% progress</Badge>
                  <Badge variant="secondary">{team.score}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <ActivityFeed
        title="Recent academic activity"
        description="Operational changes across the faculty surface that materially affect execution and evaluation."
        items={data.activity}
      />
    </PageContainer>
  );
}
