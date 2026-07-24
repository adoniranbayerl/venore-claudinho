import Link from "next/link";
import { listCourses } from "@/plugins/academy";
import { getAcademyPageData } from "@/platform/admin-shell/get-academy-page-data";
import { CreateCourseForm } from "./_components/create-course-form";

export default async function AcademyAdminPage() {
  const gate = await getAcademyPageData();

  if (!gate.granted) {
    return (
      <div className="rounded border border-gray-200  p-8 text-center">
        <h1 className="text-lg font-semibold ">Acesso negado</h1>
        <p className="mt-2 text-sm ">Você não tem permissão para gerenciar a Academy.</p>
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
        <h1 className="text-xl font-semibold ">Academy</h1>
        <p className="mt-1 text-sm ">Gerencie cursos, aulas e requisitos de conclusão.</p>
      </div>

      <section className="rounded border  p-4">
        <h2 className="text-sm font-semibold ">Cursos</h2>
        <ul className="mt-3 space-y-1">
          {courses.map((course) => (
            <li key={course.id} className="text-sm text-gray-700">
              <Link href={`/admin/academy/courses/${course.id}`} className="font-medium  hover:underline">
                {course.title}
              </Link>
              <span className=""> · {course.status === "published" ? "publicado" : "rascunho"}</span>
              {course.description && <span className=""> — {course.description}</span>}
            </li>
          ))}
          {courses.length === 0 && <li className="text-sm ">Nenhum curso cadastrado.</li>}
        </ul>
        <CreateCourseForm />
      </section>
    </div>
  );
}
