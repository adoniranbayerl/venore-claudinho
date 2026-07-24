import { isEnrolled } from "../../../shared/enrollment";
import { findLessonRequirements, isLessonComplete } from "../../../shared/lesson-progress";
import { findActiveAttempts } from "../../../shared/quiz-attempts";
import { findCourseById, findLessonsByCourse, hasTextCompletion, hasVideoCompletion } from "./store";
import { toLessonProgressView } from "./view";
import type { GetCourseProgressQuery, GetCourseProgressResult, LessonProgressView } from "./types";

// "Progresso" só faz sentido pra quem está matriculado — visualização de professor (sem
// matrícula) usa listLessonsByCourse/getLesson (barrel admin) em vez desta função (plano da
// sessão de matrícula, item 4).
export async function getCourseProgress(query: GetCourseProgressQuery): Promise<GetCourseProgressResult> {
  const course = await findCourseById(query.courseId);
  if (!course) {
    return { success: false, error: { code: "academy.courses.not_found", message: `Course "${query.courseId}" não encontrado.` } };
  }

  const enrolled = await isEnrolled(query.courseId, query.actorId);
  if (!enrolled) {
    return {
      success: false,
      error: { code: "academy.enrollments.not_enrolled", message: "É necessário estar matriculado neste curso." },
    };
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
      findActiveAttempts(lesson.id, query.actorId),
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
