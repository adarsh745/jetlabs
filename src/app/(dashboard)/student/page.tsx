"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { KpiCard, StatCard } from "@/components/dashboard/kpi-card";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Calendar,
  FileText,
  Github,
  Upload,
} from "lucide-react";
import { PAPER_SECTIONS, SUBMISSIONS } from "@/data/mock";

// Chart data — will come from API in production
const chartData = [
  { w: "W1", done: 3, target: 4 },
  { w: "W2", done: 4, target: 4 },
  { w: "W3", done: 3, target: 4 },
  { w: "W4", done: 4, target: 4 },
  { w: "W5", done: 2, target: 4 },
];

const milestones = [
  { w: 1, label: "Problem & literature", state: "done" as const },
  { w: 2, label: "Dataset & baseline", state: "done" as const },
  { w: 3, label: "Improved model", state: "done" as const },
  { w: 4, label: "Frontend prototype", state: "current" as const },
  { w: 5, label: "Integration", state: "todo" as const },
  { w: 6, label: "Final paper draft", state: "todo" as const },
];

export default function StudentDashboardPage() {
  const paperAvg = Math.round(
    PAPER_SECTIONS.reduce((a, b) => a + b.progress, 0) / PAPER_SECTIONS.length,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground text-sm">
            Week 4 of 8 - Crop Disease Detection with CNN
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/student/paper">
              <FileText className="size-4 mr-1.5" /> Continue paper
            </Link>
          </Button>
          <Button asChild>
            <Link href="/student/submissions">
              <Upload className="size-4 mr-1.5" /> Submit week 4
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard label="Overall progress" value="58%" hint="+12% this week" tone="default">
          <Progress value={58} className="mt-3" />
        </KpiCard>
        <KpiCard
          label="Paper completion"
          value={`${paperAvg}%`}
          hint="6 of 11 sections drafted"
          tone="default"
        >
          <Progress value={paperAvg} className="mt-3" />
        </KpiCard>
        <KpiCard label="On-time streak" value="3 wks" hint="Don't break it" tone="success" />
        <KpiCard
          label="Pending faculty comments"
          value="2"
          hint="1 revision requested"
          tone="warn"
        />
      </div>

      {/* Weekly roadmap + Faculty comments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly roadmap</CardTitle>
            <CardDescription>Your 8-week structured execution plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-2">
              {milestones.map((m) => (
                <div
                  key={m.w}
                  className={`p-3 rounded-lg border ${
                    m.state === "done"
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900"
                      : m.state === "current"
                        ? "bg-primary/5 border-primary/40"
                        : "bg-muted/40 border-border"
                  }`}
                >
                  <div className="text-xs text-muted-foreground">Week {m.w}</div>
                  <div className="text-sm mt-1 leading-tight">{m.label}</div>
                  <div className="mt-2">
                    {m.state === "done" && (
                      <CheckCircle2 className="size-4 text-emerald-600" />
                    )}
                    {m.state === "current" && (
                      <Clock className="size-4 text-primary" />
                    )}
                    {m.state === "todo" && (
                      <AlertCircle className="size-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 h-48">
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="w" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={24} />
                  <Tooltip />
                  <Area
                    dataKey="target"
                    name="Target"
                    stroke="var(--muted-foreground)"
                    strokeDasharray="4 4"
                    fill="transparent"
                  />
                  <Area
                    dataKey="done"
                    name="Completed"
                    stroke="var(--chart-1)"
                    fill="var(--chart-1)"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Faculty comments</CardTitle>
            <CardDescription>Latest feedback from your faculty reviewer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {SUBMISSIONS.filter((s) => s.facultyComment)
              .slice(0, 3)
              .map((s) => (
                <div key={s.id} className="flex gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback>FR</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Faculty reviewer</span>
                      <Badge
                        variant={s.status === "approved" ? "secondary" : "outline"}
                        className="text-xs h-5"
                      >
                        Week {s.week} - {s.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {s.facultyComment}
                    </p>
                  </div>
                </div>
              ))}
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/student/submissions">
                View all submissions <ArrowRight className="size-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Paper progress + Submission calendar + Activity timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>IEEE paper progress</CardTitle>
            <CardDescription>Section-wise completion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {PAPER_SECTIONS.slice(0, 6).map((s) => (
              <div key={s.key}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{s.name}</span>
                  <span className="text-muted-foreground">{s.progress}%</span>
                </div>
                <Progress value={s.progress} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submission calendar</CardTitle>
            <CardDescription>Past 6 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="w" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} width={20} />
                  <Tooltip />
                  <Bar
                    name="Completed"
                    dataKey="done"
                    fill="var(--chart-2)"
                    radius={4}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <StatCard label="On time" value="4" />
              <StatCard label="Revisions" value="1" />
              <StatCard label="Streak" value="3 weeks" />
              <StatCard label="Avg score" value="8.4 / 10" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity timeline</CardTitle>
            <CardDescription>Recent project events</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="relative border-l border-border ml-2 space-y-4">
              {[
                {
                  t: "Today",
                  e: "Started building React frontend",
                  i: <Upload className="size-3" />,
                },
                {
                  t: "2d ago",
                  e: "Pushed model v2 to GitHub",
                  i: <Github className="size-3" />,
                },
                {
                  t: "3d ago",
                  e: "Faculty approved Week 2 ✓",
                  i: <CheckCircle2 className="size-3" />,
                },
                {
                  t: "5d ago",
                  e: "Added 3 references to paper",
                  i: <FileText className="size-3" />,
                },
                {
                  t: "1w ago",
                  e: "Submitted Week 2 update",
                  i: <Calendar className="size-3" />,
                },
              ].map((a, i) => (
                <li key={i} className="ml-4">
                  <span className="absolute -left-1.5 size-3 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    {a.i}
                  </span>
                  <div className="text-xs text-muted-foreground">{a.t}</div>
                  <div className="text-sm">{a.e}</div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
