import { beginOperation, endOperation } from "@/observability";
import { findQuizQuestionById, updateQuizQuestion } from "./store";
import type { UpdateQuizQuestionCommand, UpdateQuizQuestionResult } from "./types";

export async function updateQuizQuestionService(command: UpdateQuizQuestionCommand): Promise<UpdateQuizQuestionResult> {
  const handle = beginOperation({
    useCase: "academy.update-quiz-question",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findQuizQuestionById(command.id);
  if (!existing) {
    const error = { code: "academy.quiz.not_found", message: `Quiz question "${command.id}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const finalOptions = command.options ?? existing.options;
  const finalCorrectIndex = command.correctOptionIndex ?? existing.correctOptionIndex;

  if (finalCorrectIndex < 0 || finalCorrectIndex >= finalOptions.length) {
    const error = {
      code: "academy.quiz.invalid_correct_option",
      message: "correctOptionIndex precisa apontar pra uma opção existente.",
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const question = await updateQuizQuestion(command.id, {
    text: command.text,
    options: command.options,
    correctOptionIndex: command.correctOptionIndex,
  });

  endOperation(handle, { success: true });
  return { success: true, data: question };
}
