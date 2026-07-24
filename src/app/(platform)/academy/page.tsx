import Link from "next/link";
import { redirect } from "next/navigation";
import { listCoursesForStudent } from "@/plugins/academy";
import { getAcademyStudentPageData } from "@/platform/academy-student/get-academy-student-page-data";

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
        <h1 className="text-xl font-semibold">Cursos</h1>
        <p className="mt-1 text-sm text-gray-600">Cursos disponíveis para você.</p>
      </div>

      {!coursesResult.success && (
        <p className="text-sm text-red-600">Erro ao carregar cursos: {coursesResult.error.message}</p>
      )}

      {coursesResult.success && (
        <ul className="space-y-3">
          {coursesResult.data.map((course) => {
            // enrolled decide o acesso de verdade (checado de novo no servidor ao abrir o
            // curso); esta badge é só indicação — nunca a única barreira (docs/venore-docks.md).
            const badge = course.enrolled
              ? "matriculado"
              : course.selfEnrollmentEnabled
                ? "matrícula disponível"
                : "acesso restrito";
            return (
              <li key={course.id} className="rounded border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-2">
                  <Link href={`/academy/${course.id}`} className="font-medium hover:underline">
                    {course.title}
                  </Link>
                  <span className="text-xs text-gray-500">{badge}</span>
                </div>
                {course.description && <p className="mt-1 text-sm text-gray-600">{course.description}</p>}
              </li>
            );
          })}
          {coursesResult.data.length === 0 && (
            <li className="text-sm text-gray-500">Nenhum curso disponível no momento.</li>
          )}
        </ul>
      )}
    </div>
  );
}
