import { GraduationCap } from "lucide-react";
import { listCourses, listLessonsByCourse } from "@/plugins/academy";
import { getAcademyPageData } from "@/platform/admin-shell/get-academy-page-data";
import { EmptyState } from "@/components/empty-state";
import { AdminCourseCard } from "@/components/academy/admin-course-card";
import { CreateCourseDialog } from "./_components/create-course-dialog";

export default async function AcademyAdminPage() {
  const gate = await getAcademyPageData();

  if (!gate.granted) {
    return (
      <div className="rounded-panel border border-border-subtle bg-surface-panel p-8 text-center">
        <h1 className="text-lg font-semibold text-text-primary">Acesso negado</h1>
        <p className="mt-2 text-sm text-text-secondary">Você não tem permissão para gerenciar a Academy.</p>
      </div>
    );
  }

  const coursesResult = await listCourses();

  if (!coursesResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar cursos: {coursesResult.error.message}</p>;
  }

  const courses = coursesResult.data;
  const lessonCounts = await Promise.all(courses.map((course) => listLessonsByCourse({ courseId: course.id })));
  const lessonCountByCourse = new Map(
    courses.map((course, index) => {
      const result = lessonCounts[index];
      return [course.id, result.success ? result.data.length : 0];
    }),
  );

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Academy</h1>
          <p className="mt-1 text-sm text-text-secondary">Gerencie cursos, aulas e requisitos de conclusão.</p>
        </div>
        {courses.length > 0 && <CreateCourseDialog />}
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="size-8" strokeWidth={1.5} />}
          title="Nenhum curso cadastrado"
          description="Crie o primeiro curso para começar a montar a trilha de aulas."
          action={<CreateCourseDialog />}
        />
      ) : (
        <div className="grid gap-3 sm:gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,17rem),1fr))]">
          {courses.map((course) => (
            <AdminCourseCard key={course.id} course={course} lessonCount={lessonCountByCourse.get(course.id) ?? 0} />
          ))}
        </div>
      )}
    </div>
  );
}
