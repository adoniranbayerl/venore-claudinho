import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, ChevronRight, Users, Video } from "lucide-react";
import { getMediaAsset } from "@/contexts/media";
import {
  getCachedCourse,
  listActivitySubmissionMediaForCourse,
  listEnrollmentsForCourse,
  listLessonsByCourse,
  listQuizProgressForCourse,
} from "@/plugins/academy";
import { getAcademyPageData } from "@/platform/admin-shell/get-academy-page-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { ClearActivityMediaButton } from "./_components/clear-activity-media-button";
import { CourseSettingsForm } from "./_components/course-settings-form";
import { CourseStatusForm } from "./_components/course-status-form";
import { CreateLessonForm } from "./_components/create-lesson-form";
import { EnrollStudentForm } from "./_components/enroll-student-form";
import { ResetQuizAttemptsButton } from "./_components/reset-quiz-attempts-button";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gate = await getAcademyPageData();

  if (!gate.granted) {
    return (
      <div className="rounded-panel border border-border bg-card ui-panel-padding-roomy text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para gerenciar a Academy.</p>
      </div>
    );
  }

  const [courseResult, lessonsResult, enrollmentsResult, quizProgressResult, activityMediaResult] = await Promise.all([
    getCachedCourse(id),
    listLessonsByCourse({ courseId: id }),
    listEnrollmentsForCourse({ courseId: id }),
    listQuizProgressForCourse({ courseId: id }),
    listActivitySubmissionMediaForCourse({ courseId: id }),
  ]);

  if (!courseResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar curso: {courseResult.error.message}</p>;
  }
  if (!lessonsResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar aulas: {lessonsResult.error.message}</p>;
  }
  if (!enrollmentsResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar matrículas: {enrollmentsResult.error.message}</p>;
  }
  if (!quizProgressResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar progresso de quiz: {quizProgressResult.error.message}</p>;
  }
  if (!activityMediaResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar mídia das atividades: {activityMediaResult.error.message}</p>;
  }

  const course = courseResult.data;
  if (!course) {
    notFound();
  }

  const coverMediaResult = course.coverMediaId ? await getMediaAsset({ id: course.coverMediaId }) : null;
  const coverMedia =
    coverMediaResult?.success && coverMediaResult.data
      ? {
          id: coverMediaResult.data.id,
          filename: coverMediaResult.data.filename,
          url: coverMediaResult.data.url,
          contentType: coverMediaResult.data.contentType,
        }
      : null;

  const lessons = lessonsResult.data;
  const enrollments = enrollmentsResult.data;
  const activityMediaCount = activityMediaResult.data.length;
  const quizProgressByStudent = new Map<string, typeof quizProgressResult.data>();
  for (const entry of quizProgressResult.data) {
    const existing = quizProgressByStudent.get(entry.studentActorId) ?? [];
    existing.push(entry);
    quizProgressByStudent.set(entry.studentActorId, existing);
  }

  const STATUS_LABEL: Record<typeof course.status, string> = {
    draft: "Rascunho",
    restricted: "Restrito",
    public: "Público",
  };

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/academy"
          className="rounded-sm text-xs font-medium text-muted-foreground outline-none ui-motion-base hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          ← Academy
        </Link>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{course.title}</h1>
        <p className="mt-2 text-[11px] font-medium tracking-caps text-muted-foreground/56 uppercase">
          {STATUS_LABEL[course.status]} · {lessons.length} {lessons.length === 1 ? "aula" : "aulas"}
        </p>
        {course.description && <p className="mt-2 text-sm text-muted-foreground">{course.description}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <CourseStatusForm courseId={course.id} status={course.status} />
          {course.status !== "draft" && (
            <Button asChild variant="outline">
              <Link href={`/academy/${course.slug}`} target="_blank">
                Ver como aluno ↗
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Aulas</CardTitle>
          {lessons.length > 0 && <span className="text-xs text-muted-foreground/56">{lessons.length}</span>}
        </CardHeader>
        <CardContent className="space-y-4">
          {lessons.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="size-8" strokeWidth={1.5} />}
              title="Nenhuma aula cadastrada"
              description="Preencha o formulário abaixo para criar a primeira aula."
            />
          ) : (
            <div className="overflow-hidden rounded-panel border border-border">
              {lessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/admin/academy/lessons/${lesson.id}`}
                  className="group flex items-center gap-3.5 border-b border-border px-4 py-3.5 outline-none ui-motion-base last:border-b-0 hover:bg-muted/60 focus-visible:bg-muted/60"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-border text-xs font-medium text-muted-foreground tabular-nums">
                    {lesson.position}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{lesson.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <Badge variant={lesson.status === "draft" ? "secondary" : lesson.status === "restricted" ? "outline" : "default"}>
                        {lesson.status === "draft" ? "rascunho" : lesson.status === "restricted" ? "restrito" : "público"}
                      </Badge>
                      {lesson.videoUrl && (
                        <span className="flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                          <Video className="size-3" aria-hidden="true" /> vídeo
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground/56 ui-motion-base group-hover:translate-x-0.5 group-hover:text-foreground"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          )}
          <CreateLessonForm courseId={course.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Matrícula</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <CourseSettingsForm
            courseId={course.id}
            slug={course.slug}
            publiclyListed={course.publiclyListed}
            coverMedia={coverMedia}
          />

          <div>
            <h3 className="text-[11px] font-semibold tracking-caps text-muted-foreground/56 uppercase">
              Matriculados ({enrollments.length})
            </h3>
            {enrollments.length === 0 ? (
              <EmptyState
                className="mt-3"
                icon={<Users className="size-8" strokeWidth={1.5} />}
                title="Nenhum aluno matriculado ainda"
                description="Use o formulário abaixo para matricular um aluno pelo email."
              />
            ) : (
              <ul className="mt-3 space-y-3">
                {enrollments.map((enrollment) => {
                  const studentLabel = enrollment.name ?? enrollment.email ?? enrollment.actorId;
                  const quizProgress = quizProgressByStudent.get(enrollment.actorId) ?? [];
                  return (
                    <li key={enrollment.actorId} className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{studentLabel}</span>
                      {enrollment.email && enrollment.name && <span className="text-muted-foreground/56"> ({enrollment.email})</span>}
                      <Badge variant="secondary" className="ml-2">
                        {enrollment.enrolledBy === "self" ? "auto-matrícula" : "matriculado manualmente"}
                      </Badge>
                      {quizProgress.length > 0 && (
                        <ul className="mt-1 space-y-1 pl-4">
                          {quizProgress.map((entry) => (
                            <li key={entry.lessonId} className="flex items-center gap-2 text-xs text-muted-foreground/56">
                              <span>
                                Aula {entry.lessonPosition}: {entry.attemptsUsed}/{entry.quizMaxAttempts} tentativas
                                {entry.exhausted && " · esgotado"}
                              </span>
                              {entry.exhausted && (
                                <ResetQuizAttemptsButton
                                  courseId={course.id}
                                  lessonId={entry.lessonId}
                                  studentActorId={enrollment.actorId}
                                  studentLabel={studentLabel}
                                />
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            <EnrollStudentForm courseId={course.id} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Mídia das atividades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {activityMediaCount === 0
              ? "Nenhum arquivo enviado pelos alunos nas atividades práticas desta disciplina."
              : `${activityMediaCount} arquivo(s) enviados pelos alunos nas atividades práticas desta disciplina. Ao encerrar a turma, use o botão abaixo para liberar espaço — a nota e o feedback de cada entrega continuam preservados.`}
          </p>
          <ClearActivityMediaButton courseId={course.id} mediaCount={activityMediaCount} />
        </CardContent>
      </Card>
    </div>
  );
}
