import { findPublishedCourses } from "./store";
import type { ListCoursesForStudentResult } from "./types";

export async function listCoursesForStudent(): Promise<ListCoursesForStudentResult> {
  const courses = await findPublishedCourses();
  return { success: true, data: courses };
}
