import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getEntry } from "@/contexts/cms";
import { getCourseProgress, listLessonsByCourse } from "@/plugins/academy";
import { getAcademyCourseAccess } from "@/platform/academy-student/get-academy-course-access";
import { EnrollSelfButton } from "./_components/enroll-self-button";

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
  const access = await getAcademyCourseAccess({ courseId });

  if (access.mode === "unauthenticated") {
    redirect("/api/auth/signin");
  }
  if (access.mode === "not-found") {
    notFound();
  }

  const { course } = access;

  const header = (
    <div>
      <Link href="/academy" className="text-xs font-medium text-gray-500 hover:underline">
        ← Cursos
      </Link>
      <h1 className="mt-1 text-xl font-semibold">{course.title}</h1>
      {course.description && <p className="mt-1 text-sm text-gray-600">{course.description}</p>}
    </div>
  );

  if (access.mode === "restricted") {
    return (
      <div className="space-y-6">
        {header}
        <p className="rounded border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          Acesso restrito. Este curso não permite matrícula automática — fale com um administrador para ser
          matriculado.
        </p>
      </div>
    );
  }

  if (access.mode === "enroll-available") {
    return (
      <div className="space-y-6">
        {header}
        <EnrollSelfButton courseId={course.id} />
      </div>
    );
  }

  if (access.mode === "preview") {
    const lessonsResult = await listLessonsByCourse({ courseId });
    if (!lessonsResult.success) {
      return <p className="text-sm text-red-600">Erro ao carregar aulas: {lessonsResult.error.message}</p>;
    }
    const lessons = lessonsResult.data;
    const entries = await Promise.all(lessons.map((lesson) => getEntry({ id: lesson.cmsEntryId })));
    const entryTitleByLesson = new Map(
      lessons.map((lesson, index) => {
        const entryResult = entries[index];
        const title = entryResult.success && entryResult.data ? entryResult.data.title : lesson.cmsEntryId;
        return [lesson.id, title];
      }),
    );

    return (
      <div className="space-y-6">
        {header}
        <p className="rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          Modo de visualização (professor) — todas as aulas aparecem liberadas, sem acompanhamento de progresso.
        </p>
        <section>
          <h2 className="text-sm font-semibold">Aulas</h2>
          <ul className="mt-3 space-y-2">
            {lessons.map((lesson) => (
              <li key={lesson.id} className="flex items-center justify-between rounded border border-gray-200 p-3">
                <span>
                  {lesson.position}. {entryTitleByLesson.get(lesson.id)}
                </span>
                <Link href={`/academy/${course.id}/${lesson.id}`} className="text-sm font-medium hover:underline">
                  visualizar
                </Link>
              </li>
            ))}
            {lessons.length === 0 && <li className="text-sm text-gray-500">Nenhuma aula cadastrada.</li>}
          </ul>
        </section>
      </div>
    );
  }

  const progressResult = await getCourseProgress({ courseId });
  if (!progressResult.success) {
    return <p className="text-sm text-red-600">Erro ao carregar progresso: {progressResult.error.message}</p>;
  }

  const progress = progressResult.data;
  const entries = await Promise.all(progress.lessons.map((lesson) => getEntry({ id: lesson.cmsEntryId })));
  const entryTitleByLesson = new Map(
    progress.lessons.map((lesson, index) => {
      const entryResult = entries[index];
      const title = entryResult.success && entryResult.data ? entryResult.data.title : lesson.cmsEntryId;
      return [lesson.lessonId, title];
    }),
  );

  return (
    <div className="space-y-6">
      {blocked && (
        <p className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          A aula que você tentou acessar está bloqueada. Complete as aulas anteriores para liberá-la.
        </p>
      )}
      {header}

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
  );
}
