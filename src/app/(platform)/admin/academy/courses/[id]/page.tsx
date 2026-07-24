import Link from "next/link";
import { notFound } from "next/navigation";
import { listEntries } from "@/contexts/cms";
import { getCourse, listEnrollmentsForCourse, listLessonsByCourse, listQuizProgressForCourse } from "@/plugins/academy";
import { getAcademyPageData } from "@/platform/admin-shell/get-academy-page-data";
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
      <div className="rounded border p-8 text-center">
        <h1 className="text-lg font-semibold text-gray-900">Acesso negado</h1>
        <p className="mt-2 text-sm text-gray-600">Você não tem permissão para gerenciar a Academy.</p>
      </div>
    );
  }

  const [courseResult, lessonsResult, entriesResult, enrollmentsResult, quizProgressResult] = await Promise.all([
    getCourse({ id }),
    listLessonsByCourse({ courseId: id }),
    listEntries(),
    listEnrollmentsForCourse({ courseId: id }),
    listQuizProgressForCourse({ courseId: id }),
  ]);

  if (!courseResult.success) {
    return <p className="text-sm text-red-600">Erro ao carregar curso: {courseResult.error.message}</p>;
  }
  if (!lessonsResult.success) {
    return <p className="text-sm text-red-600">Erro ao carregar aulas: {lessonsResult.error.message}</p>;
  }
  if (!entriesResult.success) {
    return <p className="text-sm text-red-600">Erro ao carregar entries do CMS: {entriesResult.error.message}</p>;
  }
  if (!enrollmentsResult.success) {
    return <p className="text-sm text-red-600">Erro ao carregar matrículas: {enrollmentsResult.error.message}</p>;
  }
  if (!quizProgressResult.success) {
    return <p className="text-sm text-red-600">Erro ao carregar progresso de quiz: {quizProgressResult.error.message}</p>;
  }

  const course = courseResult.data;
  if (!course) {
    notFound();
  }

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

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/academy" className="text-xs font-medium  hover:underline">
          ← Academy
        </Link>
        <h1 className="mt-1 text-xl font-semibold ">{course.title}</h1>
        <p className="mt-1 text-xs ">
          Status: {course.status === "published" ? "publicado" : "rascunho"}
        </p>
        {course.description && <p className="mt-1 text-sm text-gray-600">{course.description}</p>}
        <div className="mt-3 flex items-center gap-3">
          {course.status === "draft" && <PublishCourseButton courseId={course.id} />}
          {course.status === "published" && (
            <Link
              href={`/academy/${course.id}`}
              target="_blank"
              className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium "
            >
              Ver como aluno ↗
            </Link>
          )}
        </div>
      </div>

      <section className="rounded border border-gray-200  p-4">
        <h2 className="text-sm font-semibold">Aulas</h2>
        <ul className="mt-3 space-y-2">
          {lessons.map((lesson) => {
            const entry = entryById.get(lesson.cmsEntryId);
            return (
              <li key={lesson.id} className="text-sm text-gray-700">
                <Link href={`/admin/academy/lessons/${lesson.id}`} className="font-medium  hover:underline">
                  {lesson.position}. {entry ? entry.title : lesson.cmsEntryId}
                </Link>
                {lesson.videoUrl && <span className="text-gray-500"> · vídeo</span>}
              </li>
            );
          })}
          {lessons.length === 0 && <li className="text-sm text-gray-500">Nenhuma aula cadastrada.</li>}
        </ul>
        <CreateLessonForm
          courseId={course.id}
          entries={entries.map((entry) => ({ id: entry.id, title: entry.title, slug: entry.slug }))}
        />
      </section>

      <section className="rounded border border-gray-200  p-4">
        <h2 className="text-sm font-semibold text-gray-900">Matrícula</h2>
        <div className="mt-3">
          <CourseSettingsForm
            courseId={course.id}
            selfEnrollmentEnabled={course.selfEnrollmentEnabled}
            publiclyListed={course.publiclyListed}
          />
        </div>

        <h3 className="mt-6 text-sm font-semibold text-gray-900">Matriculados ({enrollments.length})</h3>
        <ul className="mt-3 space-y-3">
          {enrollments.map((enrollment) => {
            const studentLabel = enrollment.name ?? enrollment.email ?? enrollment.actorId;
            const quizProgress = quizProgressByStudent.get(enrollment.actorId) ?? [];
            return (
              <li key={enrollment.actorId} className="text-sm text-gray-700">
                {studentLabel}
                {enrollment.email && enrollment.name && <span className="text-gray-500"> ({enrollment.email})</span>}
                <span className="text-gray-500"> · {enrollment.enrolledBy === "self" ? "auto-matrícula" : "matriculado manualmente"}</span>
                {quizProgress.length > 0 && (
                  <ul className="mt-1 space-y-1 pl-4">
                    {quizProgress.map((entry) => (
                      <li key={entry.lessonId} className="flex items-center gap-2 text-xs text-gray-500">
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
          {enrollments.length === 0 && <li className="text-sm text-gray-500">Nenhum aluno matriculado ainda.</li>}
        </ul>
        <EnrollStudentForm courseId={course.id} />
      </section>
    </div>
  );
}
