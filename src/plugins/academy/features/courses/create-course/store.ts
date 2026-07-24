import { db } from "@/infrastructure/database/client";
import { courses } from "../../../database/schema";
import type { CourseRecord } from "../../../contracts/types";

export async function insertCourse(input: {
  title: string;
  description?: string;
  selfEnrollmentEnabled?: boolean;
  publiclyListed?: boolean;
  createdBy: string;
}): Promise<CourseRecord> {
  const [row] = await db
    .insert(courses)
    .values({
      title: input.title,
      description: input.description ?? null,
      createdBy: input.createdBy,
      ...(input.selfEnrollmentEnabled !== undefined && { selfEnrollmentEnabled: input.selfEnrollmentEnabled }),
      ...(input.publiclyListed !== undefined && { publiclyListed: input.publiclyListed }),
    })
    .returning();

  return row as CourseRecord;
}
