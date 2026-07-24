import { findLessonRequirements, isLessonComplete } from "../../../shared/lesson-progress";
import { findCourseById, findLessonsByCourse, findQuizAttempts, hasTextCompletion, hasVideoCompletion } from "./store";
import { toLessonProgressView } from "./view";
import type { GetCourseProgressQuery, GetCourseProgressResult, LessonProgressView } from "./types";

export async function getCourseProgress(query: GetCourseProgressQuery): Promise<GetCourseProgressResult> {
  const course = await findCourseById(query.courseId);
  if (!course) {
    return { success: false, error: { code: "academy.courses.not_found", message: `Course "${query.courseId}" não encontrado.` } };
  }

  const lessons = await findLessonsByCourse(query.courseId);

  const lessonViews: LessonProgressView[] = [];
  // "satisfeita" carrega completed E acessível da aula anterior, não só completed — bug
  // corrigido nesta sessão (ver docs/venore-docks.md): uma aula sem lesson_requirements
  // configurado é trivialmente "completed" mesmo estando ela própria locked (porque SUA
  // anterior está incompleta); deixar essa aula "completed" sozinha satisfazer a próxima
  // pulava o bloqueio real da cadeia. Mesma correção espelhada em
  // shared/lesson-progress.ts::isLessonAccessible, usado pelas actions de escrita.
  let previousSatisfied = true; // primeira lesson sempre acessível

  for (const lesson of lessons) {
    const [requirements, textRead, videoWatched, attempts, completed] = await Promise.all([
      findLessonRequirements(lesson.id),
      hasTextCompletion(lesson.id, query.actorId),
      hasVideoCompletion(lesson.id, query.actorId),
      findQuizAttempts(lesson.id, query.actorId),
      isLessonComplete(lesson.id, query.actorId),
    ]);

    const isLocked: boolean = !previousSatisfied;

    lessonViews.push(
      toLessonProgressView({
        lesson,
        locked: isLocked,
        completed,
        requirements,
        textRead,
        videoWatched,
        quizAttempts: attempts,
      }),
    );

    previousSatisfied = completed && !isLocked;
  }

  const completedLessons = lessonViews.filter((l) => l.completed).length;

  return {
    success: true,
    data: {
      courseId: query.courseId,
      lessons: lessonViews,
      completedLessons,
      totalLessons: lessonViews.length,
      courseCompleted: lessonViews.length > 0 && completedLessons === lessonViews.length,
    },
  };
}
