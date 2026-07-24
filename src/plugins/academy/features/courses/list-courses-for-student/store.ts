import { desc, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { courses } from "../../../database/schema";
import type { CourseRecord } from "../../../contracts/types";

export async function findPublishedCourses(): Promise<CourseRecord[]> {
  const rows = await db
    .select()
    .from(courses)
    .where(eq(courses.status, "published"))
    .orderBy(desc(courses.createdAt));
  return rows as CourseRecord[];
}
