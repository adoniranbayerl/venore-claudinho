import Link from "next/link";
import type { Block } from "@/contexts/cms";
import { getCourseProgress, listCoursesForStudent } from "@/plugins/academy";
import type { CourseForStudentView } from "@/plugins/academy";
import { Progress } from "@/components/ui/progress";

// Progresso por curso não existe como view agregada no plugin (só get-course-progress, por
// curso+aluno) — reaproveitar o handler público N vezes é a forma permitida de compor isso aqui
// sem query nova nem acesso a schema (restrição desta sessão).
async function withProgress(course: CourseForStudentView): Promise<{ course: CourseForStudentView; percent: number | null }> {
  if (!course.enrolled) {
    return { course, percent: null };
  }
  const progress = await getCourseProgress({ courseId: course.id });
  if (!progress.success || progress.data.totalLessons === 0) {
    return { course, percent: null };
  }
  return { course, percent: Math.round((progress.data.completedLessons / progress.data.totalLessons) * 100) };
}

export async function AcademyCourseListBlock({ data }: { data: Block["data"] }) {
  const limitRaw = data.limit;
  const limit = typeof limitRaw === "number" && limitRaw > 0 ? limitRaw : undefined;

  const result = await listCoursesForStudent();
  // Visitante anônimo (sem sessão) recebe erro do handler — bloco some em vez de quebrar a
  // página, mesmo espírito do fallback de block key desconhecida em block-renderer.tsx.
  if (!result.success) {
    return null;
  }

  const courses = limit ? result.data.slice(0, limit) : result.data;
  if (courses.length === 0) {
    return null;
  }

  const withProgressList = await Promise.all(courses.map(withProgress));

  return (
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,17rem),1fr))]">
      {withProgressList.map(({ course, percent }) => (
        <Link
          key={course.id}
          href={`/academy/${course.slug}`}
          className="block rounded-panel border border-border-subtle bg-surface-panel p-4 transition-colors hover:border-border-strong"
        >
          <h3 className="font-semibold text-text-primary">{course.title}</h3>
          {course.description && <p className="mt-1 text-sm text-text-secondary">{course.description}</p>}
          {percent !== null ? (
            <div className="mt-3 space-y-1">
              <Progress value={percent} />
              <p className="text-xs text-text-tertiary">{percent}% concluído</p>
            </div>
          ) : (
            !course.enrolled && <p className="mt-3 text-xs text-text-accent">Matricule-se para começar</p>
          )}
        </Link>
      ))}
    </div>
  );
}
