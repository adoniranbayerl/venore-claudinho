import { eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { courses } from "../../../database/schema";
import type { CourseRecord } from "../../../contracts/types";

export async function findCourseById(id: string): Promise<CourseRecord | null> {
  const [row] = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return (row as CourseRecord) ?? null;
}

export async function applyCourseSettings(input: {
  id: string;
  selfEnrollmentEnabled: boolean;
  publiclyListed: boolean;
}): Promise<CourseRecord> {
  const [row] = await db
    .update(courses)
    .set({ selfEnrollmentEnabled: input.selfEnrollmentEnabled, publiclyListed: input.publiclyListed, updatedAt: sql`now()` })
    .where(eq(courses.id, input.id))
    .returning();

  return row as CourseRecord;
}
