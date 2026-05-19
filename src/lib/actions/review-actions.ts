"use server";

import { ReviewDecision } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/session";
import { submitSubmissionReview } from "@/lib/services/review-service";

const reviewActionSchema = z.object({
  submissionId: z.string().min(1, "Submission ID is required."),
  decision: z.nativeEnum(ReviewDecision),
  score: z.number().min(0).max(100),
  comments: z.string().trim().min(12).max(2000),
});

export async function submitReviewAction(input: unknown) {
  const session = await requireRole("FACULTY", "ADMIN");
  const parsed = reviewActionSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid review payload.",
    };
  }

  try {
    await submitSubmissionReview({
      viewer: {
        userId: session.user.id,
        role: session.user.role,
      },
      ...parsed.data,
    });

    revalidatePath("/faculty/review/review-queue");
    revalidatePath("/faculty/monitoring/project-health");
    revalidatePath("/faculty/dashboard");
    revalidatePath("/student/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "SUBMISSION_NOT_FOUND") {
      return {
        success: false,
        message: "The selected submission is no longer available in your review scope.",
      };
    }

    return {
      success: false,
      message: "Unable to submit the review right now.",
    };
  }
}
