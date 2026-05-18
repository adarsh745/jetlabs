/**
 * Roadmap API route - GET /api/roadmap
 *
 * Returns roadmap and milestone data for the student dashboard.
 */
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/response";
import { AuthError, requireRole } from "@/lib/auth/session";
import type { ApiResponse, Milestone } from "@/types";

// Placeholder data until roadmap records are loaded from Prisma.
const MILESTONES: Milestone[] = [
  { week: 1, label: "Problem & literature", state: "done" },
  { week: 2, label: "Dataset & baseline", state: "done" },
  { week: 3, label: "Improved model", state: "done" },
  { week: 4, label: "Frontend prototype", state: "current" },
  { week: 5, label: "Integration", state: "todo" },
  { week: 6, label: "Final paper draft", state: "todo" },
];

export async function GET() {
  try {
    await requireRole("STUDENT");

    const response: ApiResponse<Milestone[]> = {
      success: true,
      data: MILESTONES,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError({
        code: error.code,
        message: error.message,
        status: error.status,
      });
    }

    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Unable to load roadmap data right now.",
      status: 500,
    });
  }
}
