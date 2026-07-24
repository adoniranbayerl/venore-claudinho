import { getCurrentUser } from "@/contexts/auth";
import { getCourseForStudent } from "./service";
import type { GetCourseForStudentQuery, GetCourseForStudentResult } from "./types";

export async function getCourseForStudentHandler(query: GetCourseForStudentQuery): Promise<GetCourseForStudentResult> {
  if (query.id.trim().length === 0) {
    return { success: false, error: { code: "academy.courses.invalid_id", message: "id não pode ser vazio." } };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: { code: "academy.progress.unauthenticated", message: "É necessário estar autenticado para executar esta ação." },
    };
  }

  return getCourseForStudent(query);
}
