import { beginOperation, endOperation } from "@/observability";
import { findLessonRequirements, isLessonAccessible } from "../../../shared/lesson-progress";
import { findLessonById, insertTextCompletionIfMissing } from "./store";
import type { MarkTextReadCommand, MarkTextReadResult } from "./types";

export async function markTextRead(command: MarkTextReadCommand): Promise<MarkTextReadResult> {
  const handle = beginOperation({
    useCase: "academy.mark-text-read",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const lesson = await findLessonById(command.lessonId);
  if (!lesson) {
    const error = { code: "academy.lessons.not_found", message: `Lesson "${command.lessonId}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const accessible = await isLessonAccessible(lesson, command.actorId);
  if (!accessible) {
    const error = {
      code: "academy.progress.lesson_locked",
      message: "A aula anterior ainda não foi completada.",
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const requirements = await findLessonRequirements(command.lessonId);
  if (!requirements?.readTextEnabled) {
    const error = {
      code: "academy.progress.requirement_not_enabled",
      message: "Esta lesson não exige confirmação de leitura de texto.",
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  await insertTextCompletionIfMissing(command.lessonId, command.actorId);

  endOperation(handle, { success: true });
  return { success: true, data: { lessonId: command.lessonId, completed: true } };
}
