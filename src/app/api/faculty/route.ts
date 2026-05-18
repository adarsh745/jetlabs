/**
 * Faculty API route - GET /api/faculty
 *
 * Returns faculty-specific data: batches, teams, review queue.
 */
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/response";
import { AuthError, requireRole } from "@/lib/auth/session";
import type { ApiResponse, Batch } from "@/types";
import { BATCHES } from "@/data/mock";

export async function GET() {
  try {
    await requireRole("FACULTY", "ADMIN");

    const response: ApiResponse<Batch[]> = {
      success: true,
      data: BATCHES,
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
      message: "Unable to load faculty data right now.",
      status: 500,
    });
  }
}
