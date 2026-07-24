import { findPublishedCourseById } from "./store";
import type { GetCourseForStudentQuery, GetCourseForStudentResult } from "./types";

export async function getCourseForStudent(query: GetCourseForStudentQuery): Promise<GetCourseForStudentResult> {
  const course = await findPublishedCourseById(query.id);
  return { success: true, data: course };
}
