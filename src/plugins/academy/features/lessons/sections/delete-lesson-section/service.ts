import { beginOperation, endOperation } from "@/observability";
import { deleteSectionAndRenumber, findSectionById } from "./store";
import type { DeleteLessonSectionCommand, DeleteLessonSectionResult } from "./types";

export async function deleteLessonSectionService(
  command: DeleteLessonSectionCommand,
): Promise<DeleteLessonSectionResult> {
  const handle = beginOperation({
    useCase: "academy.delete-lesson-section",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const section = await findSectionById(command.id);
  if (!section) {
    const error = {
      code: "academy.lesson_sections.not_found",
      message: `Lesson section "${command.id}" não encontrada.`,
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  // LACUNA CONHECIDA (T1 do modelo de seções): ainda não recusa a exclusão quando há progresso
  // do aluno registrado nesta seção especificamente, porque progresso por seção só passa a
  // existir na T2 — hoje o progresso é só por aula (lesson_text_completions/
  // lesson_video_completions/quiz_attempts, todos com lessonId, não sectionId). Não dá pra
  // inferir "progresso desta seção" a partir do progresso da aula sem gerar falso negativo (ex:
  // aluno completou o vídeo da aula antes desta seção existir). A guarda real entra junto com o
  // schema de progresso por seção na T2.
  await deleteSectionAndRenumber(section.lessonId, section.position, section.id);

  endOperation(handle, { success: true });
  return { success: true, data: { id: section.id } };
}
