import { findPublishedCourseById, findPublishedCourseBySlug } from "./store";
import type { GetCourseForStudentQuery, GetCourseForStudentResult } from "./types";

export async function getCourseForStudent(query: GetCourseForStudentQuery): Promise<GetCourseForStudentResult> {
  const course = "slug" in query ? await findPublishedCourseBySlug(query.slug) : await findPublishedCourseById(query.id);
  return { success: true, data: course };
}
