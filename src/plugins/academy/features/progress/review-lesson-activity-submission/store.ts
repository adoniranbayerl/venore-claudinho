import { eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { lessonActivitySubmissions } from "../../../database/schema";
import type { LessonActivitySubmissionRecord } from "../../../contracts/types";

export async function findSubmissionById(id: string): Promise<LessonActivitySubmissionRecord | null> {
  const [row] = await db.select().from(lessonActivitySubmissions).where(eq(lessonActivitySubmissions.id, id)).limit(1);
  return (row as LessonActivitySubmissionRecord) ?? null;
}

export async function updateSubmissionReview(
  id: string,
  input: { reviewStatus: string; reviewFeedback: string | null; reviewScore: number | null; reviewedBy: string },
): Promise<LessonActivitySubmissionRecord> {
  const [row] = await db
    .update(lessonActivitySubmissions)
    .set({
      reviewStatus: input.reviewStatus,
      reviewFeedback: input.reviewFeedback,
      reviewScore: input.reviewScore,
      reviewedBy: input.reviewedBy,
      reviewedAt: sql`now()`,
    })
    .where(eq(lessonActivitySubmissions.id, id))
    .returning();

  return row as LessonActivitySubmissionRecord;
}
