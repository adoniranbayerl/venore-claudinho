import { and, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { courses } from "../../../database/schema";
import type { CourseRecord } from "../../../contracts/types";

export async function findPublishedCourseById(id: string): Promise<CourseRecord | null> {
  const [row] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.id, id), eq(courses.status, "published")))
    .limit(1);
  return (row as CourseRecord) ?? null;
}

export async function findPublishedCourseBySlug(slug: string): Promise<CourseRecord | null> {
  const [row] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.slug, slug), eq(courses.status, "published")))
    .limit(1);
  return (row as CourseRecord) ?? null;
}
