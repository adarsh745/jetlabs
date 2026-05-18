/**
 * Analytics API route - GET /api/analytics
 *
 * Returns analytics data for the dashboard.
 * Returns placeholder data until the analytics tables are connected.
 */
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/response";
import { AuthError, requireRole } from "@/lib/auth/session";
import type { ApiResponse, BatchAnalytics } from "@/types";
import { BATCHES } from "@/data/mock";

export async function GET() {
  try {
    await requireRole("FACULTY", "ADMIN");

    const data: BatchAnalytics[] = BATCHES.map((batch) => ({
      batchId: batch.id,
      batchName: batch.name,
      avgProgress: batch.avgProgress,
      avgAttendance: 75,
      atRiskCount: batch.pendingReviews,
      totalStudents: batch.students,
    }));

    const response: ApiResponse<BatchAnalytics[]> = {
      success: true,
      data,
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
      message: "Unable to load analytics right now.",
      status: 500,
    });
  }
}
