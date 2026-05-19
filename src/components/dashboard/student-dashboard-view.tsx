import Link from "next/link";
import {
  ArrowRight,
  FileStack,
  Gauge,
  MessageSquareMore,
  Presentation,
  Sparkles,
} from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { ProgressWidget } from "@/components/dashboard/progress-widget";
import { StatsCard } from "@/components/dashboard/stats-card";
import { SubmissionCard } from "@/components/dashboard/submission-card";
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
import { Progress } from "@/components/ui/progress";
import type { StudentDashboardData } from "@/types/aoip";

function priorityVariant(priority: "Low" | "Medium" | "High") {
  if (priority === "High") {
    return "destructive";
  }

  if (priority === "Medium") {
    return "outline";
  }

  return "secondary";
}

type StudentDashboardViewProps = {
  data: StudentDashboardData;
};

export function StudentDashboardView({ data }: StudentDashboardViewProps) {
  return (
    <PageContainer
      eyebrow="Student dashboard"
      title={data.welcome.title}
      description={`${data.welcome.subtitle} ${data.welcome.project} · ${data.welcome.cohort}.`}
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/student/research/problem-market">Explore problem market</Link>
          </Button>
          <Button asChild>
            <Link href="/student/execution/weekly-submissions">
              Weekly submissions
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <StatsCard
          label={data.stats[0]?.label ?? "Project progress"}
          value={data.stats[0]?.value ?? "0%"}
          detail={data.stats[0]?.detail ?? "No project data available yet"}
          tone={data.stats[0]?.tone}
          icon={Gauge}
        />
        <StatsCard
          label={data.stats[1]?.label ?? "Open reviews"}
          value={data.stats[1]?.value ?? "0"}
          detail={data.stats[1]?.detail ?? "No review queue data yet"}
          tone={data.stats[1]?.tone}
          icon={FileStack}
        />
        <StatsCard
          label={data.stats[2]?.label ?? "Performance score"}
          value={data.stats[2]?.value ?? "0"}
          detail={data.stats[2]?.detail ?? "Performance metrics will appear here"}
          tone={data.stats[2]?.tone}
          icon={MessageSquareMore}
        />
        <StatsCard
          label={data.stats[3]?.label ?? "Viva readiness"}
          value={data.stats[3]?.value ?? "0%"}
          detail={data.stats[3]?.detail ?? "Evaluation readiness will appear here"}
          tone={data.stats[3]?.tone}
          icon={Presentation}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>Project progress tracker</CardTitle>
            <CardDescription>
              Research, build, and publication phases tracked in one operating line.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.progressTrackers.map((tracker) => (
              <div
                key={tracker.id}
                className="rounded-2xl border border-border bg-muted/40 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{tracker.phase}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{tracker.owner}</p>
                  </div>
                  <Badge variant={tracker.status === "Completed" ? "secondary" : "outline"}>
                    {tracker.status}
                  </Badge>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Completion</span>
                    <span>{tracker.progress}%</span>
                  </div>
                  <Progress value={tracker.progress} />
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">{tracker.note}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
            {data.scorecards.map((item) => (
              <ProgressWidget key={item.title} {...item} />
            ))}
          </div>

          <Card>
            <CardHeader className="space-y-2">
              <CardTitle>Upcoming deadlines</CardTitle>
              <CardDescription>
                What your team needs to close before the next faculty review window.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.deadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="rounded-2xl border border-border bg-muted/40 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{deadline.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{deadline.owner}</p>
                    </div>
                    <Badge variant={priorityVariant(deadline.priority)}>
                      {deadline.priority}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {deadline.dueLabel}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3>Weekly submission status</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Every sprint pack, revision loop, and final rehearsal step in one place.
            </p>
          </div>
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          {data.submissions.map((submission) => (
            <SubmissionCard key={submission.id} {...submission} />
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <AnalyticsChart
          title="Research progress"
          description="Literature depth, experimentation maturity, and writing readiness are moving together toward paper completion."
          data={data.researchSeries}
          type="line"
          series={[
            { key: "literature", label: "Literature", color: "var(--color-chart-1)" },
            { key: "experimentation", label: "Experimentation", color: "var(--color-chart-2)" },
            { key: "writing", label: "Writing", color: "var(--color-chart-3)" },
          ]}
        />

        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>Faculty feedback</CardTitle>
            <CardDescription>
              The most recent comments shaping your next research and execution moves.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.feedback.map((feedback) => (
              <div
                key={feedback.id}
                className="rounded-2xl border border-border bg-muted/40 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {feedback.faculty}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{feedback.area}</p>
                  </div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {feedback.timestamp}
                  </p>
                </div>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {feedback.note}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>Achievement cards</CardTitle>
            <CardDescription>
              Evidence that the project is converting into visible academic momentum.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
            {data.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="rounded-2xl border border-border bg-muted/40 p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl border border-border bg-card">
                    <Sparkles className="size-4 text-foreground" />
                  </span>
                  <p className="text-sm font-semibold text-foreground">{achievement.title}</p>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {achievement.detail}
                </p>
                <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {achievement.impact}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <ActivityFeed
          title="Team activity feed"
          description="Delivery, review, and evaluation moments captured across the current week."
          items={data.activity}
        />
      </div>
    </PageContainer>
  );
}
