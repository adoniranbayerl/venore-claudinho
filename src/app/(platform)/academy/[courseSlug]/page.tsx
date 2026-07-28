import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { getEntry } from "@/contexts/cms";
import { calculateProgressPercent, getCourseProgress, listLessonsByCourse } from "@/plugins/academy";
import { getAcademyCourseAccess } from "@/platform/academy-student/get-academy-course-access";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Progress } from "@/components/ui/progress";
import { EnrollSelfButton } from "./_components/enroll-self-button";

export const dynamic = "force-dynamic";

export default async function AcademyCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ courseSlug: string }>;
  searchParams: Promise<{ blocked?: string }>;
}) {
  const { courseSlug } = await params;
  const { blocked } = await searchParams;
  const access = await getAcademyCourseAccess({ courseSlug });

  if (access.mode === "unauthenticated") {
    redirect("/api/auth/signin");
  }
  if (access.mode === "not-found") {
    notFound();
  }
  // URL antiga por id (UUID) ainda resolve o curso — redireciona pra URL canônica por slug em vez
  // de renderizar aqui (item 2 do pedido da sessão: "/academy/<uuid antigo> redireciona").
  if (access.mode === "redirect") {
    redirect(`/academy/${access.slug}`);
  }

  const { course } = access;

  const header = (
    <div>
      <Link href="/academy" className="text-xs font-medium text-muted-foreground/56 hover:underline">
        ← Cursos
      </Link>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{course.title}</h1>
      {course.description && <p className="mt-2 text-sm text-muted-foreground">{course.description}</p>}
    </div>
  );

  if (access.mode === "restricted") {
    return (
      <div className="space-y-6">
        {header}
        <p className="rounded border border-border bg-muted p-4 text-sm text-muted-foreground">
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
        <EnrollSelfButton courseId={course.id} courseSlug={course.slug} />
      </div>
    );
  }

  if (access.mode === "preview") {
    const lessonsResult = await listLessonsByCourse({ courseId: course.id });
    if (!lessonsResult.success) {
      return <p className="text-sm text-destructive">Erro ao carregar aulas: {lessonsResult.error.message}</p>;
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
        <p className="rounded border border-border bg-secondary p-3 text-sm text-secondary-foreground">
          Modo de visualização (professor) — todas as aulas aparecem liberadas, sem acompanhamento de progresso.
        </p>
        <section>
          <h2 className="text-[11px] font-semibold tracking-caps text-muted-foreground/56 uppercase">Aulas</h2>
          {lessons.length === 0 ? (
            <EmptyState className="mt-3" title="Nenhuma aula cadastrada" />
          ) : (
            <ul className="mt-3 space-y-2">
              {lessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className="flex items-center justify-between rounded-panel border border-border bg-card p-3"
                >
                  <span className="text-sm">
                    {lesson.position}. {entryTitleByLesson.get(lesson.id)}
                  </span>
                  <Link href={`/academy/${course.slug}/${lesson.id}`} className="text-sm font-medium hover:underline">
                    visualizar
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    );
  }

  const progressResult = await getCourseProgress({ courseId: course.id });
  if (!progressResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar progresso: {progressResult.error.message}</p>;
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

  const progressPercent = calculateProgressPercent(progress.completedLessons, progress.totalLessons);

  return (
    <div className="space-y-6">
      {blocked && (
        <p className="rounded border border-warning-border bg-warning-soft p-3 text-sm text-warning">
          A aula que você tentou acessar está bloqueada. Complete as aulas anteriores para liberá-la.
        </p>
      )}
      {header}

      {progress.totalLessons > 0 && (
        <div className="space-y-1.5 rounded-panel border border-border bg-card p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">
              {progress.completedLessons} de {progress.totalLessons}{" "}
              {progress.totalLessons === 1 ? "aula concluída" : "aulas concluídas"}
            </span>
            <span className="text-muted-foreground/56">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} />
          {progress.completedLessons === 0 && (
            <p className="text-xs text-muted-foreground/56">Você ainda não começou este curso.</p>
          )}
        </div>
      )}

      <section>
        <h2 className="text-[11px] font-semibold tracking-caps text-muted-foreground/56 uppercase">Aulas</h2>
        {progress.lessons.length === 0 ? (
          <EmptyState className="mt-3" title="Nenhuma aula cadastrada" />
        ) : (
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
                <li
                  key={lesson.lessonId}
                  className="flex items-center justify-between rounded-panel border border-border bg-card p-3"
                >
                  <span className="text-sm">
                    {lesson.position}. {title}
                  </span>
                  {lesson.locked ? (
                    <Badge variant="outline" className="gap-1">
                      <Lock className="size-3" />
                      {statusLabel}
                    </Badge>
                  ) : (
                    <Link
                      href={`/academy/${course.slug}/${lesson.lessonId}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {statusLabel}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
