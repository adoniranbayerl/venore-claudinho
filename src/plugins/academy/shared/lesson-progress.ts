import {
  findLessonRequirements,
  findPreviousLessonByPosition,
  hasPassingQuizAttempt,
  hasTextCompletion,
  hasVideoCompletion,
} from "./lesson-progress-store";
import type { LessonRecord } from "../contracts/types";

export { findLessonRequirements } from "./lesson-progress-store";

// Sem linha em lesson_requirements = nenhum requisito habilitado = completa trivialmente
// (decisão registrada no plano da sessão que criou este arquivo — docs/venore-docks.md não
// cobre esse caso explicitamente).
export async function isLessonComplete(lessonId: string, actorId: string): Promise<boolean> {
  const requirements = await findLessonRequirements(lessonId);
  if (!requirements) return true;

  if (requirements.readTextEnabled && !(await hasTextCompletion(lessonId, actorId))) {
    return false;
  }

  if (requirements.watchVideoEnabled && !(await hasVideoCompletion(lessonId, actorId))) {
    return false;
  }

  if (requirements.quizEnabled && !(await hasPassingQuizAttempt(lessonId, actorId))) {
    return false;
  }

  return true;
}

// Aula sem antecessora (menor position do curso) sempre acessível; as demais exigem a anterior
// completa (item 4 do pedido: "aula só é acessível se a aula anterior estiver completa").
export async function isLessonAccessible(lesson: LessonRecord, actorId: string): Promise<boolean> {
  const previous = await findPreviousLessonByPosition(lesson.courseId, lesson.position);
  if (!previous) return true;

  return isLessonComplete(previous.id, actorId);
}
