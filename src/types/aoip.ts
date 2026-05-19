import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@/types/auth";

export type MetricTone = "neutral" | "positive" | "warning" | "critical";

export type AppShellUser = {
  name?: string | null;
  email: string;
  role: UserRole;
};

export type NavigationItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
  section: string;
  searchPlaceholder?: string;
  badge?: string;
};

export type NavigationSection = {
  label: string;
  items: NavigationItem[];
};

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type DashboardStat = {
  label: string;
  value: string;
  detail: string;
  tone?: MetricTone;
};

export type ProgressSnapshot = {
  title: string;
  value: string;
  progress: number;
  detail: string;
  tone?: MetricTone;
};

export type ActivityFeedItem = {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  tag?: string;
  tone?: MetricTone;
};

export type ChartSeries = {
  key: string;
  label: string;
  color: string;
};

export type StudentSubmissionStatus =
  | "On track"
  | "Awaiting review"
  | "Needs revision"
  | "Ready to submit";

export type StudentDashboardData = {
  welcome: {
    title: string;
    subtitle: string;
    project: string;
    cohort: string;
  };
  stats: DashboardStat[];
  progressTrackers: Array<{
    id: string;
    phase: string;
    owner: string;
    progress: number;
    note: string;
    status: "Completed" | "Active" | "Queued";
  }>;
  submissions: Array<{
    id: string;
    title: string;
    status: StudentSubmissionStatus;
    dueLabel: string;
    progress: number;
    note: string;
  }>;
  deadlines: Array<{
    id: string;
    title: string;
    dueLabel: string;
    owner: string;
    priority: "Low" | "Medium" | "High";
  }>;
  scorecards: ProgressSnapshot[];
  achievements: Array<{
    id: string;
    title: string;
    detail: string;
    impact: string;
  }>;
  feedback: Array<{
    id: string;
    faculty: string;
    note: string;
    area: string;
    timestamp: string;
  }>;
  activity: ActivityFeedItem[];
  researchSeries: Array<{
    week: string;
    literature: number;
    experimentation: number;
    writing: number;
  }>;
};

export type FacultyDashboardData = {
  header: {
    title: string;
    subtitle: string;
  };
  stats: DashboardStat[];
  submissionSeries: Array<{
    week: string;
    submitted: number;
    reviewed: number;
    escalated: number;
  }>;
  performanceSeries: Array<{
    month: string;
    performance: number;
    target: number;
  }>;
  backlogSeries: Array<{
    week: string;
    open: number;
    cleared: number;
  }>;
  quickReview: Array<{
    id: string;
    title: string;
    detail: string;
    actionLabel: string;
  }>;
  healthIndicators: ProgressSnapshot[];
  topTeams: Array<{
    id: string;
    team: string;
    domain: string;
    progress: number;
    risk: string;
    score: string;
  }>;
  activity: ActivityFeedItem[];
};

export type ProblemListing = {
  id: string;
  title: string;
  domain: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  source: "Faculty" | "Industry" | "Research Lab";
  fitScore: number;
  trend: string;
  summary: string;
  tags: string[];
  recommendedBy: string;
  saved: boolean;
};

export type ProblemMarketData = {
  stats: DashboardStat[];
  categories: string[];
  trending: Array<{
    id: string;
    title: string;
    momentum: string;
  }>;
  problems: ProblemListing[];
};

export type ReviewQueueItem = {
  id: string;
  team: string;
  batch: string;
  project: string;
  submissionTitle: string;
  submittedAt: string;
  status: "Pending" | "Re-review" | "SLA risk";
  urgency: "Low" | "Medium" | "High" | "Critical";
  preview: string;
  rubric: string[];
  scoreHint: string;
};

export type ReviewQueueData = {
  stats: DashboardStat[];
  analytics: Array<{
    week: string;
    pending: number;
    completed: number;
    overdue: number;
  }>;
  queue: ReviewQueueItem[];
  templates: string[];
};

export type ProjectHealthTeam = {
  id: string;
  team: string;
  project: string;
  mentor: string;
  completion: number;
  riskScore: number;
  backlogItems: number;
  inactiveDays: number;
  missedSubmissions: number;
  velocity: string;
  alerts: string[];
  contributionHeatmap: number[];
};

export type ProjectHealthData = {
  stats: DashboardStat[];
  velocitySeries: Array<{
    sprint: string;
    planned: number;
    delivered: number;
  }>;
  backlogSeries: Array<{
    sprint: string;
    open: number;
    critical: number;
  }>;
  alerts: ActivityFeedItem[];
  teams: ProjectHealthTeam[];
};

export type ModulePageData = {
  eyebrow: string;
  title: string;
  description: string;
  stats: DashboardStat[];
  focus: ProgressSnapshot[];
  activity: ActivityFeedItem[];
};
