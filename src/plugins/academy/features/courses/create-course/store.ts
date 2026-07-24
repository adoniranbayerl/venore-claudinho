import { db } from "@/infrastructure/database/client";
import { courses } from "../../../database/schema";
import type { CourseRecord } from "../../../contracts/types";

export async function insertCourse(input: { title: string; description?: string; createdBy: string }): Promise<CourseRecord> {
  const [row] = await db
    .insert(courses)
    .values({ title: input.title, description: input.description ?? null, createdBy: input.createdBy })
    .returning();

  return row as CourseRecord;
}
