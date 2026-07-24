import { beginOperation, endOperation } from "@/observability";
import { findLessonById, insertQuizQuestion } from "./store";
import type { AddQuizQuestionCommand, AddQuizQuestionResult } from "./types";

export async function addQuizQuestion(command: AddQuizQuestionCommand): Promise<AddQuizQuestionResult> {
  const handle = beginOperation({
    useCase: "academy.add-quiz-question",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const lesson = await findLessonById(command.lessonId);
  if (!lesson) {
    const error = { code: "academy.lessons.not_found", message: `Lesson "${command.lessonId}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const question = await insertQuizQuestion({
    lessonId: command.lessonId,
    text: command.text,
    options: command.options,
    correctOptionIndex: command.correctOptionIndex,
  });

  endOperation(handle, { success: true });
  return { success: true, data: question };
}
