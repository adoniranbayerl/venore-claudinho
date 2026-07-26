import { getEntry } from "@/contexts/cms";
import { beginOperation, endOperation } from "@/observability";
import {
  countQuizQuestionsByLessonIds,
  findCourseById,
  findLessonsWithQuizFlagByCourse,
  markCoursePublished,
} from "./store";
import type { PublishCourseCommand, PublishCourseResult } from "./types";

// Toda checagem roda antes de marcar published, e acumula problema em vez de sair no primeiro
// (item 1 do pedido da sessão) — professor corrige tudo de uma vez em vez de descobrir aula por
// aula a cada nova tentativa de publicar.
async function collectPublishProblems(courseId: string): Promise<string[]> {
  const problems: string[] = [];

  const lessons = await findLessonsWithQuizFlagByCourse(courseId);
  if (lessons.length === 0) {
    problems.push("O curso precisa de pelo menos uma aula.");
    return problems;
  }

  const [entryResults, quizCountByLesson] = await Promise.all([
    Promise.all(lessons.map((lesson) => getEntry({ id: lesson.cmsEntryId }))),
    countQuizQuestionsByLessonIds(lessons.filter((lesson) => lesson.quizEnabled).map((lesson) => lesson.id)),
  ]);

  lessons.forEach((lesson, index) => {
    const entryResult = entryResults[index];
    const entry = entryResult.success ? entryResult.data : null;
    if (!entry || entry.status !== "published") {
      problems.push(`Aula ${lesson.position}: o conteúdo vinculado não está publicado.`);
    }

    if (lesson.quizEnabled && (quizCountByLesson.get(lesson.id) ?? 0) === 0) {
      problems.push(`Aula ${lesson.position}: quiz habilitado sem nenhuma pergunta cadastrada.`);
    }
  });

  return problems;
}

export async function publishCourse(command: PublishCourseCommand): Promise<PublishCourseResult> {
  const handle = beginOperation({
    useCase: "academy.publish-course",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findCourseById(command.id);
  if (!existing) {
    const error = { code: "academy.courses.not_found", message: `Course "${command.id}" não encontrado.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const problems = await collectPublishProblems(command.id);
  if (problems.length > 0) {
    const error = {
      code: "academy.courses.publish_validation_failed",
      message: problems.join(" "),
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const course = await markCoursePublished(command.id);

  endOperation(handle, { success: true });
  return { success: true, data: course };
}
