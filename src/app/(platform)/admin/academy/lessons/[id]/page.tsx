import Link from "next/link";
import { notFound } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { getEntry } from "@/contexts/cms";
import { getLesson, getLessonRequirements, listQuizQuestionsByLesson } from "@/plugins/academy";
import { getAcademyPageData } from "@/platform/admin-shell/get-academy-page-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { LessonRequirementsForm } from "./_components/lesson-requirements-form";
import { AddQuizQuestionForm } from "./_components/add-quiz-question-form";

export default async function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gate = await getAcademyPageData();

  if (!gate.granted) {
    return (
      <div className="rounded border border-border-subtle bg-surface-panel p-8 text-center">
        <h1 className="text-lg font-semibold text-text-primary">Acesso negado</h1>
        <p className="mt-2 text-sm text-text-secondary">Você não tem permissão para gerenciar a Academy.</p>
      </div>
    );
  }

  const lessonResult = await getLesson({ id });
  if (!lessonResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar aula: {lessonResult.error.message}</p>;
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
    return <p className="text-sm text-destructive">Erro ao carregar requisitos: {requirementsResult.error.message}</p>;
  }
  if (!questionsResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar perguntas do quiz: {questionsResult.error.message}</p>;
  }
  if (!entryResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar entry do CMS: {entryResult.error.message}</p>;
  }

  const requirements = requirementsResult.data;
  const questions = questionsResult.data;
  const entry = entryResult.data;

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/admin/academy/courses/${lesson.courseId}`} className="text-xs font-medium text-text-tertiary hover:underline">
          ← Curso
        </Link>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-text-primary">
          Aula {lesson.position}: {entry ? entry.title : lesson.cmsEntryId}
        </h1>
        {lesson.videoUrl && (
          <p className="mt-2 text-[11px] font-medium tracking-caps text-text-tertiary uppercase">Com vídeo</p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Requisitos de conclusão</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Perguntas do quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {questions.length === 0 ? (
            <EmptyState
              icon={<HelpCircle className="size-8" strokeWidth={1.5} />}
              title="Nenhuma pergunta cadastrada"
              description="Adicione a primeira pergunta do quiz abaixo."
            />
          ) : (
            <ul className="space-y-2">
              {questions.map((question) => (
                <li key={question.id} className="text-sm text-text-secondary">
                  <p className="font-medium text-text-primary">{question.text}</p>
                  <ul className="mt-1 ml-4 list-disc">
                    {question.options.map((option, index) => (
                      <li key={index} className={index === question.correctOptionIndex ? "font-medium text-success" : ""}>
                        {option}
                        {index === question.correctOptionIndex && " (correta)"}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
          <AddQuizQuestionForm lessonId={id} />
        </CardContent>
      </Card>
    </div>
  );
}
