import Link from "next/link";
import { notFound } from "next/navigation";
import { listEntries } from "@/contexts/cms";
import { getCourse, listLessonsByCourse } from "@/plugins/academy";
import { getAcademyPageData } from "@/platform/admin-shell/get-academy-page-data";
import { CreateLessonForm } from "./_components/create-lesson-form";
import { PublishCourseButton } from "./_components/publish-course-button";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gate = await getAcademyPageData();

  if (!gate.granted) {
    return (
      <div className="rounded border border-gray-200 bg-white p-8 text-center">
        <h1 className="text-lg font-semibold text-gray-900">Acesso negado</h1>
        <p className="mt-2 text-sm text-gray-600">Você não tem permissão para gerenciar a Academy.</p>
      </div>
    );
  }

  const [courseResult, lessonsResult, entriesResult] = await Promise.all([
    getCourse({ id }),
    listLessonsByCourse({ courseId: id }),
    listEntries(),
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

  const course = courseResult.data;
  if (!course) {
    notFound();
  }

  const lessons = lessonsResult.data;
  const entries = entriesResult.data;
  const entryById = new Map(entries.map((entry) => [entry.id, entry]));

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/academy" className="text-xs font-medium text-gray-500 hover:underline">
          ← Academy
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-gray-900">{course.title}</h1>
        <p className="mt-1 text-xs text-gray-500">
          Status: {course.status === "published" ? "publicado" : "rascunho"}
        </p>
        {course.description && <p className="mt-1 text-sm text-gray-600">{course.description}</p>}
        {course.status === "draft" && (
          <div className="mt-3">
            <PublishCourseButton courseId={course.id} />
          </div>
        )}
      </div>

      <section className="rounded border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-900">Aulas</h2>
        <ul className="mt-3 space-y-2">
          {lessons.map((lesson) => {
            const entry = entryById.get(lesson.cmsEntryId);
            return (
              <li key={lesson.id} className="text-sm text-gray-700">
                <Link href={`/admin/academy/lessons/${lesson.id}`} className="font-medium text-gray-900 hover:underline">
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
    </div>
  );
}
