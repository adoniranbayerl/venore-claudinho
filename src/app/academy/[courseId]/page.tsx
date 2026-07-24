import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getEntry } from "@/contexts/cms";
import { getCourseForStudent, getCourseProgress } from "@/plugins/academy";
import { getAcademyStudentPageData } from "@/platform/academy-student/get-academy-student-page-data";
import { renderThemedPage } from "@/platform/theme-rendering/render-themed-page";

export const dynamic = "force-dynamic";

export default async function AcademyCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ blocked?: string }>;
}) {
  const { courseId } = await params;
  const { blocked } = await searchParams;
  const gate = await getAcademyStudentPageData();

  if (!gate.granted) {
    redirect("/api/auth/signin");
  }

  const [courseResult, progressResult] = await Promise.all([
    getCourseForStudent({ id: courseId }),
    getCourseProgress({ courseId }),
  ]);

  if (!courseResult.success) {
    return await renderThemedPage({
      sidebarContextualEnabled: false,
      children: <p className="text-sm text-red-600">Erro ao carregar curso: {courseResult.error.message}</p>,
    });
  }
  if (!courseResult.data) {
    notFound();
  }
  if (!progressResult.success) {
    return await renderThemedPage({
      sidebarContextualEnabled: false,
      children: <p className="text-sm text-red-600">Erro ao carregar progresso: {progressResult.error.message}</p>,
    });
  }

  const course = courseResult.data;
  const progress = progressResult.data;

  const entries = await Promise.all(progress.lessons.map((lesson) => getEntry({ id: lesson.cmsEntryId })));
  const entryTitleByLesson = new Map(
    progress.lessons.map((lesson, index) => {
      const entryResult = entries[index];
      const title = entryResult.success && entryResult.data ? entryResult.data.title : lesson.cmsEntryId;
      return [lesson.lessonId, title];
    }),
  );

  return await renderThemedPage({
    sidebarContextualEnabled: false,
    children: (
      <div className="space-y-6">
        {blocked && (
          <p className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            A aula que você tentou acessar está bloqueada. Complete as aulas anteriores para liberá-la.
          </p>
        )}
        <div>
          <Link href="/academy" className="text-xs font-medium text-gray-500 hover:underline">
            ← Cursos
          </Link>
          <h1 className="mt-1 text-xl font-semibold">{course.title}</h1>
          {course.description && <p className="mt-1 text-sm text-gray-600">{course.description}</p>}
        </div>

        <section>
          <h2 className="text-sm font-semibold">Aulas</h2>
          <ul className="mt-3 space-y-2">
            {progress.lessons.map((lesson) => {
              const title = entryTitleByLesson.get(lesson.lessonId);
              // locked precisa vencer completed na prioridade do rótulo: uma aula sem
              // lesson_requirements configurado é "completed" trivialmente mesmo estando
              // "locked" (cadeia anterior não cumprida) — mesma combinação do bug de bloqueio
              // corrigido nesta sessão (docs/venore-docks.md). Mostrar "concluída" nesse caso
              // mentia sobre o estado real da aula.
              const statusLabel = lesson.locked ? "bloqueada" : lesson.completed ? "concluída" : "liberada";
              return (
                <li key={lesson.lessonId} className="flex items-center justify-between rounded border border-gray-200 p-3">
                  <span>
                    {lesson.position}. {title}
                  </span>
                  {lesson.locked ? (
                    <span className="text-xs text-gray-400">{statusLabel}</span>
                  ) : (
                    <Link
                      href={`/academy/${course.id}/${lesson.lessonId}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {statusLabel}
                    </Link>
                  )}
                </li>
              );
            })}
            {progress.lessons.length === 0 && <li className="text-sm text-gray-500">Nenhuma aula cadastrada.</li>}
          </ul>
        </section>
      </div>
    ),
  });
}
