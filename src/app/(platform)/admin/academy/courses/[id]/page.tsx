import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Users } from "lucide-react";
import { listEntries } from "@/contexts/cms";
import { getMedia } from "@/contexts/media";
import { getCachedCourse, listEnrollmentsForCourse, listLessonsByCourse, listQuizProgressForCourse } from "@/plugins/academy";
import { getAcademyPageData } from "@/platform/admin-shell/get-academy-page-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { CourseSettingsForm } from "./_components/course-settings-form";
import { CreateLessonForm } from "./_components/create-lesson-form";
import { EnrollStudentForm } from "./_components/enroll-student-form";
import { PublishCourseButton } from "./_components/publish-course-button";
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

  const [courseResult, lessonsResult, entriesResult, enrollmentsResult, quizProgressResult] = await Promise.all([
    getCachedCourse(id),
    listLessonsByCourse({ courseId: id }),
    listEntries(),
    listEnrollmentsForCourse({ courseId: id }),
    listQuizProgressForCourse({ courseId: id }),
  ]);

  if (!courseResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar curso: {courseResult.error.message}</p>;
  }
  if (!lessonsResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar aulas: {lessonsResult.error.message}</p>;
  }
  if (!entriesResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar entries do CMS: {entriesResult.error.message}</p>;
  }
  if (!enrollmentsResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar matrículas: {enrollmentsResult.error.message}</p>;
  }
  if (!quizProgressResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar progresso de quiz: {quizProgressResult.error.message}</p>;
  }

  const course = courseResult.data;
  if (!course) {
    notFound();
  }

  const coverMediaResult = course.coverMediaId ? await getMedia({ id: course.coverMediaId }) : null;
  const coverMedia =
    coverMediaResult?.success && coverMediaResult.data
      ? {
          id: coverMediaResult.data.id,
          filename: coverMediaResult.data.filename,
          url: coverMediaResult.data.url,
          mimeType: coverMediaResult.data.mimeType,
        }
      : null;

  const lessons = lessonsResult.data;
  const entries = entriesResult.data;
  const entryById = new Map(entries.map((entry) => [entry.id, entry]));
  const enrollments = enrollmentsResult.data;
  const quizProgressByStudent = new Map<string, typeof quizProgressResult.data>();
  for (const entry of quizProgressResult.data) {
    const existing = quizProgressByStudent.get(entry.studentActorId) ?? [];
    existing.push(entry);
    quizProgressByStudent.set(entry.studentActorId, existing);
  }

  const isPublished = course.status === "published";

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
          {isPublished ? "Publicado" : "Rascunho"} · {lessons.length} {lessons.length === 1 ? "aula" : "aulas"}
        </p>
        {course.description && <p className="mt-2 text-sm text-muted-foreground">{course.description}</p>}
        <div className="mt-4 flex items-center gap-3">
          {course.status === "draft" && <PublishCourseButton courseId={course.id} />}
          {course.status === "published" && (
            <Button asChild variant="outline">
              <Link href={`/academy/${course.slug}`} target="_blank">
                Ver como aluno ↗
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Aulas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {lessons.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="size-8" strokeWidth={1.5} />}
              title="Nenhuma aula cadastrada"
              description="Escolha um conteúdo do CMS abaixo para criar a primeira aula."
            />
          ) : (
            <ul className="space-y-1">
              {lessons.map((lesson) => {
                const entry = entryById.get(lesson.cmsEntryId);
                return (
                  <li
                    key={lesson.id}
                    className="flex items-center justify-between gap-2 rounded-control px-2 py-1.5 text-sm hover:bg-muted"
                  >
                    <Link
                      href={`/admin/academy/lessons/${lesson.id}`}
                      className="rounded-sm font-medium text-foreground outline-none ui-motion-base hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {lesson.position}. {entry ? entry.title : "Conteúdo não encontrado"}
                    </Link>
                    {lesson.videoUrl && (
                      <Badge variant="outline" className="shrink-0">
                        vídeo
                      </Badge>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <CreateLessonForm
            courseId={course.id}
            entries={entries.map((entry) => ({ id: entry.id, title: entry.title, slug: entry.slug }))}
          />
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
            selfEnrollmentEnabled={course.selfEnrollmentEnabled}
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
    </div>
  );
}
