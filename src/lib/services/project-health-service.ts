import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getTeamScopeWhere, type ViewerContext } from "@/lib/permissions";
import { calculateTeamHealth } from "@/lib/services/project-health-engine";
import {
  average,
  buildActivityItem,
  clampPercentage,
  mapHealthTone,
} from "@/lib/services/shared";
import type { ProjectHealthData, ProjectHealthTeam } from "@/types/aoip";

const healthTeamInclude = {
  faculty: {
    select: {
      id: true,
      name: true,
    },
  },
  students: {
    orderBy: {
      createdAt: "asc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          performance: {
            select: {
              score: true,
            },
          },
        },
      },
    },
  },
  project: {
    include: {
      analytics: {
        orderBy: {
          sequence: "asc",
        },
      },
      milestones: {
        orderBy: {
          position: "asc",
        },
      },
    },
  },
  submissions: {
    orderBy: {
      submittedAt: "desc",
    },
    include: {
      reviews: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  },
  activityEvents: {
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
  },
} satisfies Prisma.TeamInclude;

type HealthTeamRecord = Prisma.TeamGetPayload<{
  include: typeof healthTeamInclude;
}>;

type TeamHealthSnapshot = {
  team: HealthTeamRecord;
  riskScore: number;
  healthStatus: HealthTeamRecord["project"]["healthStatus"];
  velocity: string;
  alerts: string[];
  inactiveDays: number;
  missedSubmissions: number;
  backlogItems: number;
  completion: number;
  averageContribution: number;
};

function daysSince(date: Date | null | undefined) {
  if (!date) {
    return 30;
  }

  return Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)));
}

function getLatestActivityDate(team: HealthTeamRecord) {
  const dates = [
    team.activityEvents[0]?.createdAt,
    team.submissions[0]?.submittedAt,
    ...team.students.map((member) => member.lastActiveAt),
  ].filter((value): value is Date => Boolean(value));

  if (dates.length === 0) {
    return null;
  }

  return dates.sort((left, right) => right.getTime() - left.getTime())[0];
}

function getMissedSubmissions(team: HealthTeamRecord) {
  const expectedCycles = team.project.analytics.at(-1)?.sequence ?? 0;
  const weeklySubmissions = team.submissions.filter(
    (submission) => submission.type === "WEEKLY",
  ).length;

  return Math.max(0, expectedCycles - weeklySubmissions);
}

function contributionBand(value: number) {
  return Math.max(1, Math.min(5, Math.round(value / 20)));
}

function buildContributionHeatmap(team: HealthTeamRecord, inactiveDays: number) {
  const latestSnapshot = team.project.analytics.at(-1);
  const memberBands = team.students.map((member) =>
    contributionBand(member.contributionScore),
  );
  const operationalBands = [
    latestSnapshot
      ? contributionBand(
          (latestSnapshot.deliveredPoints / Math.max(1, latestSnapshot.plannedPoints)) *
            100,
        )
      : 1,
    latestSnapshot
      ? Math.max(1, 5 - Math.min(4, latestSnapshot.criticalBacklogCount))
      : 1,
    inactiveDays <= 2 ? 5 : inactiveDays <= 5 ? 4 : inactiveDays <= 8 ? 3 : inactiveDays <= 12 ? 2 : 1,
  ];
  const values = [...memberBands, ...operationalBands];

  while (values.length < 5) {
    values.push(average(values));
  }

  return values.slice(0, 5);
}

function buildTeamHealthSnapshot(team: HealthTeamRecord): TeamHealthSnapshot {
  const latestActivityDate = getLatestActivityDate(team);
  const inactiveDays = daysSince(latestActivityDate);
  const missedSubmissions = getMissedSubmissions(team);
  const backlogItems = team.project.analytics.at(-1)?.openBacklogCount ?? 0;
  const completion = clampPercentage(team.project.progress);
  const averageContribution = average(
    team.students.map((member) => member.contributionScore),
  );
  const revisionCount = team.submissions.filter(
    (submission) =>
      submission.status === "REVISION_REQUIRED" || submission.status === "REJECTED",
  ).length;
  const pendingReviewCount = team.submissions.filter(
    (submission) =>
      submission.status === "PENDING_REVIEW" || submission.status === "UNDER_REVIEW",
  ).length;

  const health = calculateTeamHealth({
    progress: completion,
    averageContribution,
    inactiveDays,
    missedSubmissions,
    revisionCount,
    pendingReviewCount,
  });

  return {
    team,
    riskScore: health.riskScore,
    healthStatus: health.healthStatus,
    velocity: health.velocity,
    alerts: health.alerts,
    inactiveDays,
    missedSubmissions,
    backlogItems,
    completion,
    averageContribution,
  };
}

async function syncProjectHealth(teamSnapshot: TeamHealthSnapshot) {
  await db.project.update({
    where: {
      id: teamSnapshot.team.projectId,
    },
    data: {
      riskScore: teamSnapshot.riskScore,
      healthStatus: teamSnapshot.healthStatus,
      progress: teamSnapshot.completion,
    },
  });
}

function aggregateSnapshots(teams: HealthTeamRecord[]) {
  const bucket = new Map<
    string,
    {
      planned: number;
      delivered: number;
      open: number;
      critical: number;
    }
  >();

  for (const team of teams) {
    for (const snapshot of team.project.analytics) {
      const current = bucket.get(snapshot.label) ?? {
        planned: 0,
        delivered: 0,
        open: 0,
        critical: 0,
      };

      current.planned += snapshot.plannedPoints;
      current.delivered += snapshot.deliveredPoints;
      current.open += snapshot.openBacklogCount;
      current.critical += snapshot.criticalBacklogCount;

      bucket.set(snapshot.label, current);
    }
  }

  return [...bucket.entries()].map(([label, value]) => ({
    sprint: label,
    planned: value.planned,
    delivered: value.delivered,
    open: value.open,
    critical: value.critical,
  }));
}

export async function getProjectHealthData(
  viewer: ViewerContext,
): Promise<ProjectHealthData> {
  const teams = await db.team.findMany({
    where: getTeamScopeWhere(viewer),
    orderBy: [{ batch: "asc" }, { name: "asc" }],
    include: healthTeamInclude,
  });

  const snapshots = teams.map(buildTeamHealthSnapshot);
  await Promise.all(snapshots.map(syncProjectHealth));

  const aggregatedSnapshots = aggregateSnapshots(teams);
  const highRiskTeams = snapshots.filter((snapshot) => snapshot.healthStatus === "HIGH");
  const mediumRiskTeams = snapshots.filter(
    (snapshot) => snapshot.healthStatus === "MEDIUM",
  );
  const totalMissedSubmissions = snapshots.reduce(
    (sum, snapshot) => sum + snapshot.missedSubmissions,
    0,
  );
  const averageVelocity = average(
    aggregatedSnapshots.map((snapshot) =>
      snapshot.planned === 0
        ? 100
        : clampPercentage((snapshot.delivered / snapshot.planned) * 100),
    ),
  );

  return {
    stats: [
      {
        label: "Healthy projects",
        value: `${snapshots.filter((snapshot) => snapshot.healthStatus === "LOW").length}`,
        detail: `${snapshots.length} monitored team workspaces`,
        tone: "positive",
      },
      {
        label: "Attention needed",
        value: `${highRiskTeams.length + mediumRiskTeams.length}`,
        detail: `${highRiskTeams.length} high-risk teams require escalation`,
        tone: highRiskTeams.length > 0 ? "critical" : "warning",
      },
      {
        label: "Missed submissions",
        value: `${totalMissedSubmissions}`,
        detail: "Expected weekly evidence packs not yet received",
        tone: totalMissedSubmissions > 0 ? "warning" : "positive",
      },
      {
        label: "Delivery velocity",
        value: `${averageVelocity}%`,
        detail: "Average delivered points against planned workload",
        tone: averageVelocity >= 80 ? "positive" : averageVelocity >= 60 ? "warning" : "critical",
      },
    ],
    velocitySeries: aggregatedSnapshots.map((snapshot) => ({
      sprint: snapshot.sprint,
      planned: snapshot.planned,
      delivered: snapshot.delivered,
    })),
    backlogSeries: aggregatedSnapshots.map((snapshot) => ({
      sprint: snapshot.sprint,
      open: snapshot.open,
      critical: snapshot.critical,
    })),
    alerts: snapshots
      .filter((snapshot) => snapshot.alerts.length > 0)
      .sort((left, right) => right.riskScore - left.riskScore)
      .slice(0, 6)
      .map((snapshot) =>
        buildActivityItem({
          id: snapshot.team.id,
          title: `${snapshot.team.name} requires intervention`,
          detail: snapshot.alerts[0] ?? "Review workload is trending unsafe.",
          date:
            snapshot.team.activityEvents[0]?.createdAt ??
            snapshot.team.submissions[0]?.submittedAt ??
            snapshot.team.updatedAt,
          tag: `${snapshot.team.batch} · ${snapshot.team.project.title}`,
          tone: mapHealthTone(snapshot.healthStatus),
        }),
      ),
    teams: snapshots.map<ProjectHealthTeam>((snapshot) => ({
      id: snapshot.team.id,
      team: snapshot.team.name,
      project: snapshot.team.project.title,
      mentor: snapshot.team.faculty.name,
      completion: snapshot.completion,
      riskScore: snapshot.riskScore,
      backlogItems: snapshot.backlogItems,
      inactiveDays: snapshot.inactiveDays,
      missedSubmissions: snapshot.missedSubmissions,
      velocity: snapshot.velocity,
      alerts:
        snapshot.alerts.length > 0
          ? snapshot.alerts
          : ["Project is operating inside the healthy delivery band."],
      contributionHeatmap: buildContributionHeatmap(
        snapshot.team,
        snapshot.inactiveDays,
      ),
    })),
  };
}

export async function syncProjectHealthForTeam(teamId: string) {
  const team = await db.team.findUnique({
    where: {
      id: teamId,
    },
    include: healthTeamInclude,
  });

  if (!team) {
    return null;
  }

  const snapshot = buildTeamHealthSnapshot(team);
  await syncProjectHealth(snapshot);
  return snapshot;
}
