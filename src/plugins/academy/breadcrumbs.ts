import { cache } from "react";
import type { BreadcrumbSegmentDefinition } from "@/platform/breadcrumbs/types";
import { staticBreadcrumbSegment, dynamicBreadcrumbSegment } from "@/platform/breadcrumbs/define-segment";
import { getCachedEntry } from "@/contexts/cms";
import { getCourseForStudentHandler } from "./features/courses/get-course-for-student/handler";
import { getCourseHandler } from "./features/courses/get-course/handler";
import { getLessonHandler } from "./features/lessons/get-lesson/handler";

// Mesmo motivo do comentário em contexts/cms/breadcrumbs.ts: cache() só dedupe objeto por
// referência, então o wrapper recebe o id/slug como string. Estes três são a peça que garante
// reuso de verdade: platform/academy-student/get-academy-course-access.ts (composição
// auth+rbac+academy usada pelas páginas públicas da Academy) importa `getCachedCourseForStudent`
// DAQUI em vez de chamar o handler cru — mesma função cacheada, mesmo slug, uma query só no
// request, sem platform/academy-student precisar saber que existe um breadcrumb. Reexportados por
// ./index.ts pra as páginas admin (courses/[id], lessons/[id]) chamarem no lugar do handler cru.
export const getCachedCourseForStudent = cache((slug: string) => getCourseForStudentHandler({ slug }));
export const getCachedCourse = cache((id: string) => getCourseHandler({ id }));
export const getCachedLesson = cache((id: string) => getLessonHandler({ id }));

async function resolveLessonEntryTitle(lessonId: string): Promise<string | null> {
  const lessonResult = await getCachedLesson(lessonId);
  if (!lessonResult.success || !lessonResult.data) return null;
  const entryResult = await getCachedEntry(lessonResult.data.cmsEntryId);
  return entryResult.success && entryResult.data ? entryResult.data.title : null;
}

export const academyBreadcrumbSegments: BreadcrumbSegmentDefinition[] = [
  // --- Público (aluno) ---
  staticBreadcrumbSegment({ key: "academy.public.list", segments: ["academy"], label: "Academy" }),
  dynamicBreadcrumbSegment({
    key: "academy.public.course",
    segments: ["academy", ":courseSlug"],
    paramName: "courseSlug",
    resolveLabel: async (slug) => {
      const result = await getCachedCourseForStudent(slug);
      return result.success && result.data ? result.data.title : null;
    },
  }),
  dynamicBreadcrumbSegment({
    key: "academy.public.lesson",
    segments: ["academy", ":courseSlug", ":lessonId"],
    paramName: "lessonId",
    resolveLabel: resolveLessonEntryTitle,
  }),

  // --- Admin ---
  staticBreadcrumbSegment({ key: "academy.admin.overview", segments: ["admin", "academy"], label: "Academy" }),
  dynamicBreadcrumbSegment({
    key: "academy.admin.course",
    segments: ["admin", "academy", "courses", ":id"],
    paramName: "id",
    resolveLabel: async (id) => {
      const result = await getCachedCourse(id);
      return result.success && result.data ? result.data.title : null;
    },
  }),
  dynamicBreadcrumbSegment({
    key: "academy.admin.lesson",
    segments: ["admin", "academy", "lessons", ":id"],
    paramName: "id",
    resolveLabel: resolveLessonEntryTitle,
  }),
];
