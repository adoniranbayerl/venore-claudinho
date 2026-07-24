import Link from "next/link";
import { listCourses } from "@/plugins/academy";
import { getAcademyPageData } from "@/platform/admin-shell/get-academy-page-data";
import { CreateCourseForm } from "./_components/create-course-form";

export default async function AcademyAdminPage() {
  const gate = await getAcademyPageData();

  if (!gate.granted) {
    return (
      <div className="rounded border border-gray-200 bg-white p-8 text-center">
        <h1 className="text-lg font-semibold text-gray-900">Acesso negado</h1>
        <p className="mt-2 text-sm text-gray-600">Você não tem permissão para gerenciar a Academy.</p>
      </div>
    );
  }

  const coursesResult = await listCourses();

  if (!coursesResult.success) {
    return <p className="text-sm text-red-600">Erro ao carregar cursos: {coursesResult.error.message}</p>;
  }

  const courses = coursesResult.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Academy</h1>
        <p className="mt-1 text-sm text-gray-600">Gerencie cursos, aulas e requisitos de conclusão.</p>
      </div>

      <section className="rounded border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-900">Cursos</h2>
        <ul className="mt-3 space-y-1">
          {courses.map((course) => (
            <li key={course.id} className="text-sm text-gray-700">
              <Link href={`/admin/academy/courses/${course.id}`} className="font-medium text-gray-900 hover:underline">
                {course.title}
              </Link>
              <span className="text-gray-500"> · {course.status === "published" ? "publicado" : "rascunho"}</span>
              {course.description && <span className="text-gray-500"> — {course.description}</span>}
            </li>
          ))}
          {courses.length === 0 && <li className="text-sm text-gray-500">Nenhum curso cadastrado.</li>}
        </ul>
        <CreateCourseForm />
      </section>
    </div>
  );
}
