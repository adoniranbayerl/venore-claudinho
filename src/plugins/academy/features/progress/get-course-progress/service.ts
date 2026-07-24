import { findLessonRequirements, isLessonComplete } from "../../../shared/lesson-progress";
import { findCourseById, findLessonsByCourse, findQuizAttempts, hasTextCompletion, hasVideoCompletion } from "./store";
import { toLessonProgressView } from "./view";
import type { GetCourseProgressQuery, GetCourseProgressResult } from "./types";

export async function getCourseProgress(query: GetCourseProgressQuery): Promise<GetCourseProgressResult> {
  const course = await findCourseById(query.courseId);
  if (!course) {
    return { success: false, error: { code: "academy.courses.not_found", message: `Course "${query.courseId}" não encontrado.` } };
  }

  const lessons = await findLessonsByCourse(query.courseId);

  const lessonViews = [];
  let previousComplete = true; // primeira lesson sempre acessível

  for (const lesson of lessons) {
    const [requirements, textRead, videoWatched, attempts, completed] = await Promise.all([
      findLessonRequirements(lesson.id),
      hasTextCompletion(lesson.id, query.actorId),
      hasVideoCompletion(lesson.id, query.actorId),
      findQuizAttempts(lesson.id, query.actorId),
      isLessonComplete(lesson.id, query.actorId),
    ]);

    lessonViews.push(
      toLessonProgressView({
        lesson,
        locked: !previousComplete,
        completed,
        requirements,
        textRead,
        videoWatched,
        quizAttempts: attempts,
      }),
    );

    previousComplete = completed;
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
