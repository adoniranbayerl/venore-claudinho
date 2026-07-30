import { getCachedEntry } from "@/contexts/cms";
import {
  LessonTrail,
  getCourseProgress,
  listLessonsByCourse,
  type LessonTrailItem,
} from "@/plugins/academy";
import { getAcademyCourseAccess } from "@/platform/academy-student/get-academy-course-access";

export const dynamic = "force-dynamic";

// Slot paralelo @sidebarContextual (item 5 do pedido da sessão) — mesma checagem de acesso da
// página de aula (getAcademyCourseAccess), só que aqui a trilha nunca bloqueia nada: se o acesso
// não permite ver a aula, o slot só não renderiza (a página principal já cuida do redirect).
export default async function LessonTrailSlot({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonId: string }>;
}) {
  const { courseSlug, lessonId } = await params;
  const access = await getAcademyCourseAccess(courseSlug);

  if (access.mode !== "full" && access.mode !== "preview") {
    return null;
  }

  const { course } = access;

  if (access.mode === "preview") {
    const lessonsResult = await listLessonsByCourse({ courseId: course.id });
    if (!lessonsResult.success) return null;

    const entries = await Promise.all(lessonsResult.data.map((lesson) => getCachedEntry(lesson.cmsEntryId)));
    const items: LessonTrailItem[] = lessonsResult.data.map((lesson, index) => {
      const entryResult = entries[index];
      const title = entryResult.success && entryResult.data ? entryResult.data.title : `Aula ${lesson.position}`;
      return {
        id: lesson.id,
        position: lesson.position,
        title,
        state: lesson.id === lessonId ? "current" : "unlocked",
      };
    });

    return <LessonTrail courseSlug={course.slug} items={items} />;
  }

  const progressResult = await getCourseProgress({ courseId: course.id });
  if (!progressResult.success) return null;

  const entries = await Promise.all(progressResult.data.lessons.map((lesson) => getCachedEntry(lesson.cmsEntryId)));
  const items: LessonTrailItem[] = progressResult.data.lessons.map((lesson, index) => {
    const entryResult = entries[index];
    const title = entryResult.success && entryResult.data ? entryResult.data.title : `Aula ${lesson.position}`;
    const state: LessonTrailItem["state"] = lesson.locked
      ? "locked"
      : lesson.completed
        ? "completed"
        : lesson.lessonId === lessonId
          ? "current"
          : "unlocked";
    return { id: lesson.lessonId, position: lesson.position, title, state };
  });

  return <LessonTrail courseSlug={course.slug} items={items} />;
}
