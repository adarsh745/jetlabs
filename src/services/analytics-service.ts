/**
 * Analytics service — computed analytics from student data.
 */
import { BATCHES, TEAMS, STUDENTS, WEEKLY_CHART } from "@/data/mock";
import { riskScore } from "@/lib/scoring";
import type { BatchAnalytics, PerformanceDistribution } from "@/types";

export function getBatchAnalytics(): BatchAnalytics[] {
  return BATCHES.map((b) => {
    const batchStudents = STUDENTS.filter((s) => `${s.dept}-${s.section} ${s.batch}` === b.name || s.batch === b.name.split(" ").pop());
    const avgAttendance = batchStudents.length
      ? batchStudents.reduce((sum, s) => sum + s.attendanceOverall, 0) / batchStudents.length
      : 0;
    const atRiskCount = batchStudents.filter((s) => {
      const risk = riskScore(s);
      return risk.level === "High" || risk.level === "Critical";
    }).length;

    return {
      batchId: b.id,
      batchName: b.name,
      avgProgress: b.avgProgress,
      avgAttendance: Math.round(avgAttendance),
      atRiskCount,
      totalStudents: b.students,
    };
  });
}

export function getPerformanceDistribution(): PerformanceDistribution[] {
  const bands = { Excellent: 0, Good: 0, Average: 0, "At Risk": 0, Critical: 0 };

  STUDENTS.forEach((s) => {
    if (s.cgpa >= 8.5) bands.Excellent++;
    else if (s.cgpa >= 7.0) bands.Good++;
    else if (s.cgpa >= 5.5) bands.Average++;
    else if (s.cgpa >= 4.0) bands["At Risk"]++;
    else bands.Critical++;
  });

  const total = STUDENTS.length;
  return Object.entries(bands).map(([band, count]) => ({
    band,
    count,
    percentage: Math.round((count / total) * 100),
  }));
}

export function getWeeklyChartData() {
  return WEEKLY_CHART;
}

export function getTeamData() {
  return TEAMS;
}
