import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntry } from "@/contexts/cms";
import { getLesson, getLessonRequirements, listQuizQuestionsByLesson } from "@/plugins/academy";
import { getAcademyPageData } from "@/platform/admin-shell/get-academy-page-data";
import { LessonRequirementsForm } from "./_components/lesson-requirements-form";
import { AddQuizQuestionForm } from "./_components/add-quiz-question-form";

export default async function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  const lessonResult = await getLesson({ id });
  if (!lessonResult.success) {
    return <p className="text-sm text-red-600">Erro ao carregar aula: {lessonResult.error.message}</p>;
  }

  const lesson = lessonResult.data;
  if (!lesson) {
    notFound();
  }

  const [requirementsResult, questionsResult, entryResult] = await Promise.all([
    getLessonRequirements({ lessonId: id }),
    listQuizQuestionsByLesson({ lessonId: id }),
    getEntry({ id: lesson.cmsEntryId }),
  ]);

  if (!requirementsResult.success) {
    return <p className="text-sm text-red-600">Erro ao carregar requisitos: {requirementsResult.error.message}</p>;
  }
  if (!questionsResult.success) {
    return <p className="text-sm text-red-600">Erro ao carregar perguntas do quiz: {questionsResult.error.message}</p>;
  }
  if (!entryResult.success) {
    return <p className="text-sm text-red-600">Erro ao carregar entry do CMS: {entryResult.error.message}</p>;
  }

  const requirements = requirementsResult.data;
  const questions = questionsResult.data;
  const entry = entryResult.data;

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/admin/academy/courses/${lesson.courseId}`} className="text-xs font-medium text-gray-500 hover:underline">
          ← Curso
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-gray-900">
          Aula {lesson.position}: {entry ? entry.title : lesson.cmsEntryId}
        </h1>
        {lesson.videoUrl && <p className="mt-1 text-sm text-gray-600">Vídeo: {lesson.videoUrl}</p>}
      </div>

      <section className="rounded border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-900">Requisitos de conclusão</h2>
        <div className="mt-3">
          {/* key força remount quando requirements muda (após revalidatePath do submit) — o
              formulário guarda estado local (checkbox de quiz controlado, defaultChecked/
              defaultValue dos demais campos) que só é inicializado a partir da prop no mount;
              sem essa key, ele nunca resincroniza com o banco até um reload manual (bug corrigido
              nesta sessão — docs/venore-docks.md). */}
          <LessonRequirementsForm
            key={JSON.stringify(requirements)}
            lessonId={id}
            hasVideoUrl={lesson.videoUrl !== null}
            requirements={requirements}
          />
        </div>
      </section>

      <section className="rounded border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-900">Perguntas do quiz</h2>
        <ul className="mt-3 space-y-2">
          {questions.map((question) => (
            <li key={question.id} className="text-sm text-gray-700">
              <p className="font-medium text-gray-900">{question.text}</p>
              <ul className="mt-1 ml-4 list-disc">
                {question.options.map((option, index) => (
                  <li key={index} className={index === question.correctOptionIndex ? "font-medium text-green-700" : ""}>
                    {option}
                    {index === question.correctOptionIndex && " (correta)"}
                  </li>
                ))}
              </ul>
            </li>
          ))}
          {questions.length === 0 && <li className="text-sm text-gray-500">Nenhuma pergunta cadastrada.</li>}
        </ul>
        <AddQuizQuestionForm lessonId={id} />
      </section>
    </div>
  );
}
