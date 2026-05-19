"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/session";
import { toggleProblemBookmark } from "@/lib/services/problem-market-service";

const toggleBookmarkSchema = z.object({
  problemId: z.string().min(1, "Problem ID is required."),
});

export async function toggleProblemBookmarkAction(input: unknown) {
  const session = await requireRole("STUDENT", "FACULTY", "ADMIN");
  const parsed = toggleBookmarkSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid bookmark payload.",
    };
  }

  try {
    const result = await toggleProblemBookmark(
      {
        userId: session.user.id,
        role: session.user.role,
      },
      parsed.data.problemId,
    );

    revalidatePath("/student/research/problem-market");
    revalidatePath("/student/dashboard");

    return {
      success: true,
      bookmarked: result.bookmarked,
    };
  } catch {
    return {
      success: false,
      message: "Unable to update bookmarks right now.",
    };
  }
}
