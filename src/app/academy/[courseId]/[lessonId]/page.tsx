import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getEntry, getEntryBody } from "@/contexts/cms";
import { getCourseProgress, listQuizQuestionsForStudent } from "@/plugins/academy";
import { getAcademyStudentPageData } from "@/platform/academy-student/get-academy-student-page-data";
import { renderThemedPage } from "@/platform/theme-rendering/render-themed-page";
import { MarkProgressButton } from "./_components/mark-progress-button";
import { QuizForm } from "./_components/quiz-form";

export const dynamic = "force-dynamic";

export default async function AcademyLessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
  searchParams: Promise<{ blocked?: string }>;
}) {
  const { courseId, lessonId } = await params;
  const { blocked } = await searchParams;
  const gate = await getAcademyStudentPageData();

  if (!gate.granted) {
    redirect("/api/auth/signin");
  }

  const progressResult = await getCourseProgress({ courseId });
  if (!progressResult.success) {
    return await renderThemedPage({
      sidebarContextualEnabled: false,
      children: <p className="text-sm text-red-600">Erro ao carregar progresso: {progressResult.error.message}</p>,
    });
  }

  const progress = progressResult.data;
  const lesson = progress.lessons.find((item) => item.lessonId === lessonId);
  if (!lesson) {
    notFound();
  }

  // Bloqueio checado no servidor antes de montar qualquer conteúdo da aula — não é só a
  // listagem do curso escondendo o link (docs/venore-docks.md, item 3 do pedido desta sessão).
  if (lesson.locked) {
    const currentLesson = progress.lessons.find((item) => !item.locked && !item.completed);
    if (currentLesson) {
      redirect(`/academy/${courseId}/${currentLesson.lessonId}?blocked=1`);
    }
    redirect(`/academy/${courseId}?blocked=1`);
  }

  const [entryResult, quizResult] = await Promise.all([
    getEntry({ id: lesson.cmsEntryId }),
    lesson.requirements.quizEnabled
      ? listQuizQuestionsForStudent({ lessonId })
      : Promise.resolve({ success: true as const, data: [] }),
  ]);

  if (!entryResult.success) {
    return await renderThemedPage({
      sidebarContextualEnabled: false,
      children: <p className="text-sm text-red-600">Erro ao carregar conteúdo: {entryResult.error.message}</p>,
    });
  }

  const entry = entryResult.data;
  const attemptsExhausted =
    lesson.requirements.quizMaxAttempts !== null &&
    !lesson.requirements.quizPassed &&
    lesson.requirements.quizAttemptsUsed >= lesson.requirements.quizMaxAttempts;

  return await renderThemedPage({
    sidebarContextualEnabled: false,
    children: (
      <div className="space-y-6">
        {blocked && (
          <p className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            A aula que você tentou acessar está bloqueada. Esta é sua aula liberada atual.
          </p>
        )}
        <div>
          <Link href={`/academy/${courseId}`} className="text-xs font-medium text-gray-500 hover:underline">
            ← Curso
          </Link>
          <h1 className="mt-1 text-xl font-semibold">{entry ? entry.title : `Aula ${lesson.position}`}</h1>
        </div>

        {entry && (
          <article className="prose max-w-none">
            <p>{getEntryBody(entry.data)}</p>
          </article>
        )}

        {lesson.videoUrl && (
          <section>
            <h2 className="text-sm font-semibold">Vídeo</h2>
            <a href={lesson.videoUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
              {lesson.videoUrl}
            </a>
          </section>
        )}

        <section className="flex flex-wrap gap-4">
          {lesson.requirements.readTextEnabled &&
            (lesson.requirements.textRead ? (
              <p className="text-sm text-gray-600">Texto lido ✓</p>
            ) : (
              <MarkProgressButton courseId={courseId} lessonId={lessonId} kind="text" label="Marcar texto como lido" />
            ))}

          {lesson.requirements.watchVideoEnabled &&
            (lesson.requirements.videoWatched ? (
              <p className="text-sm text-gray-600">Vídeo assistido ✓</p>
            ) : (
              <MarkProgressButton courseId={courseId} lessonId={lessonId} kind="video" label="Marcar vídeo como assistido" />
            ))}
        </section>

        {lesson.requirements.quizEnabled && (
          <section>
            <h2 className="text-sm font-semibold">Quiz</h2>
            {lesson.requirements.quizPassed ? (
              <p className="mt-2 text-sm text-gray-600">Você já passou neste quiz.</p>
            ) : !quizResult.success ? (
              <p className="mt-2 text-sm text-red-600">Erro ao carregar o quiz: {quizResult.error.message}</p>
            ) : (
              <div className="mt-2">
                <QuizForm
                  courseId={courseId}
                  lessonId={lessonId}
                  questions={quizResult.data}
                  attemptsExhausted={attemptsExhausted}
                />
              </div>
            )}
          </section>
        )}
      </div>
    ),
  });
}
