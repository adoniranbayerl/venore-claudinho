import { and, desc, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { courses } from "../../../database/schema";
import type { CourseRecord } from "../../../contracts/types";

// status "public" + publiclyListed (não só "restricted", que exige matrícula manual pelo admin —
// não faz sentido anunciar pra visitante anônimo um curso que ele não consegue entrar sozinho).
export async function findPublicListedCourses(): Promise<CourseRecord[]> {
  const rows = await db
    .select()
    .from(courses)
    .where(and(eq(courses.status, "public"), eq(courses.publiclyListed, true)))
    .orderBy(desc(courses.createdAt));
  return rows as CourseRecord[];
}
