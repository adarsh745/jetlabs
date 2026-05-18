/**
 * Student service — data access layer for student operations.
 *
 * When Prisma is connected, this replaces mock data calls.
 * Each function returns typed data matching the API response shape.
 */
import { STUDENTS } from "@/data/mock";
import type { Student } from "@/types";
import { riskScore } from "@/lib/scoring";

export function getStudentById(id: string): Student | undefined {
  return STUDENTS.find((s) => s.id === id);
}

export function getStudentsByBatch(batch: string): Student[] {
  return STUDENTS.filter((s) => s.batch === batch);
}

export function getStudentsByDepartment(dept: string): Student[] {
  return STUDENTS.filter((s) => s.dept === dept);
}

export function getAtRiskStudents(): Student[] {
  return STUDENTS.filter((s) => {
    const risk = riskScore(s);
    return risk.level === "High" || risk.level === "Critical";
  });
}

export function searchStudents(query: string): Student[] {
  const q = query.toLowerCase();
  return STUDENTS.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.roll.toLowerCase().includes(q) ||
      s.project.toLowerCase().includes(q),
  );
}
