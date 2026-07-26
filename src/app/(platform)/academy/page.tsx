import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";
import {
  getCourseProgress,
  listCoursesForStudent,
  listLessonsByCourse,
  type CourseForStudentView,
} from "@/plugins/academy";
import { getAcademyStudentPageData } from "@/platform/academy-student/get-academy-student-page-data";
import { EmptyState } from "@/components/empty-state";
import { StudentCourseCard } from "@/components/academy/student-course-card";

export const dynamic = "force-dynamic";

export default async function AcademyCoursesPage() {
  const gate = await getAcademyStudentPageData();

  if (!gate.granted) {
    redirect("/api/auth/signin");
  }

  const coursesResult = await listCoursesForStudent();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Cursos</h1>
        <p className="mt-1 text-sm text-text-secondary">Cursos disponíveis para você.</p>
      </div>

      {!coursesResult.success && (
        <p className="text-sm text-destructive">Erro ao carregar cursos: {coursesResult.error.message}</p>
      )}

      {coursesResult.success && coursesResult.data.length === 0 && (
        <EmptyState
          icon={<BookOpen className="size-8" strokeWidth={1.5} />}
          title="Nenhum curso disponível no momento"
          description="Volte mais tarde — novos cursos aparecem aqui assim que forem publicados."
        />
      )}

      {coursesResult.success && coursesResult.data.length > 0 && (
        <CourseGrid courses={coursesResult.data} />
      )}
    </div>
  );
}

async function CourseGrid({ courses }: { courses: CourseForStudentView[] }) {
  const [lessonCounts, progresses] = await Promise.all([
    Promise.all(courses.map((course) => listLessonsByCourse({ courseId: course.id }))),
    Promise.all(
      courses.map((course) => (course.enrolled ? getCourseProgress({ courseId: course.id }) : Promise.resolve(null))),
    ),
  ]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course, index) => {
        const lessonCountResult = lessonCounts[index];
        const lessonCount = lessonCountResult.success ? lessonCountResult.data.length : 0;
        const progressResult = progresses[index];
        const progressPercent =
          progressResult && progressResult.success && progressResult.data.totalLessons > 0
            ? Math.round((progressResult.data.completedLessons / progressResult.data.totalLessons) * 100)
            : null;

        return (
          <StudentCourseCard key={course.id} course={course} lessonCount={lessonCount} progressPercent={progressPercent} />
        );
      })}
    </div>
  );
}
