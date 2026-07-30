import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { courses } from "../../../database/schema";
import type { CourseRecord } from "../../../contracts/types";

export async function findCourseBySlug(slug: string): Promise<CourseRecord | null> {
  const [row] = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
  return (row as CourseRecord) ?? null;
}

export async function insertCourse(input: {
  title: string;
  description?: string;
  slug: string;
  selfEnrollmentEnabled?: boolean;
  publiclyListed?: boolean;
  coverMediaId?: string;
  createdBy: string;
}): Promise<CourseRecord> {
  const [row] = await db
    .insert(courses)
    .values({
      title: input.title,
      description: input.description ?? null,
      slug: input.slug,
      createdBy: input.createdBy,
      ...(input.selfEnrollmentEnabled !== undefined && { selfEnrollmentEnabled: input.selfEnrollmentEnabled }),
      ...(input.publiclyListed !== undefined && { publiclyListed: input.publiclyListed }),
      ...(input.coverMediaId !== undefined && { coverMediaId: input.coverMediaId }),
    })
    .returning();

  return row as CourseRecord;
}
