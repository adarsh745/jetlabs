/**
 * Students API route - GET /api/students
 *
 * Returns student list data for faculty dashboards.
 * Supports pagination and filtering.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiError } from "@/lib/api/response";
import { AuthError, requireRole } from "@/lib/auth/session";
import type { ApiResponse, Student } from "@/types";
import { STUDENTS } from "@/data/mock";

export async function GET(request: NextRequest) {
  try {
    await requireRole("FACULTY", "ADMIN");

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase();
    const batch = searchParams.get("batch");
    const department = searchParams.get("department");
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);

    let filtered = STUDENTS;

    if (search) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(search) ||
          student.roll.toLowerCase().includes(search) ||
          student.project.toLowerCase().includes(search),
      );
    }

    if (batch) {
      filtered = filtered.filter((student) => student.batch === batch);
    }

    if (department) {
      filtered = filtered.filter((student) => student.dept === department);
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    const response: ApiResponse<Student[]> = {
      success: true,
      data,
      meta: { page, limit, total },
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
      message: "Unable to load student data right now.",
      status: 500,
    });
  }
}
