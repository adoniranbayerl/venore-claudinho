import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getEntry, getEntryBody, getEntryComposition } from "@/contexts/cms";
import { getCourseProgress, getLesson, listQuizQuestionsByLesson, listQuizQuestionsForStudent } from "@/plugins/academy";
import { getAcademyCourseAccess } from "@/platform/academy-student/get-academy-course-access";
import { BlockRenderer } from "@/components/page-builder/block-renderer";
import { LessonVideoEmbed } from "./_components/lesson-video-embed";
import { MarkProgressButton } from "./_components/mark-progress-button";
import { QuizForm } from "./_components/quiz-form";

export const dynamic = "force-dynamic";

export default async function AcademyLessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseSlug: string; lessonId: string }>;
  searchParams: Promise<{ blocked?: string }>;
}) {
  const { courseSlug, lessonId } = await params;
  const { blocked } = await searchParams;
  const access = await getAcademyCourseAccess({ courseSlug });

  if (access.mode === "unauthenticated") {
    redirect("/api/auth/signin");
  }
  if (access.mode === "not-found") {
    notFound();
  }
  // URL antiga por id (UUID) ainda resolve o curso — redireciona pra URL canônica por slug em vez
  // de renderizar aqui (item 2 do pedido da sessão: "/academy/<uuid antigo> redireciona").
  if (access.mode === "redirect") {
    redirect(`/academy/${access.slug}/${lessonId}`);
  }
  // Sem matrícula (e sem preview de professor), não existe motivo legítimo pra estar numa URL de
  // aula específica — mesma disciplina do bloqueio de lock-chain: checado no servidor, não só
  // escondido na UI (docs/venore-docks.md, item 5 do pedido desta sessão).
  if (access.mode === "restricted" || access.mode === "enroll-available") {
    redirect(`/academy/${courseSlug}`);
  }

  const { course } = access;

  if (access.mode === "preview") {
    const lessonResult = await getLesson({ id: lessonId });
    if (!lessonResult.success) {
      return <p className="text-sm text-destructive">Erro ao carregar aula: {lessonResult.error.message}</p>;
    }
    const lesson = lessonResult.data;
    if (!lesson || lesson.courseId !== course.id) {
      notFound();
    }

    const [entryResult, quizResult] = await Promise.all([
      getEntry({ id: lesson.cmsEntryId }),
      listQuizQuestionsByLesson({ lessonId }),
    ]);

    if (!entryResult.success) {
      return <p className="text-sm text-destructive">Erro ao carregar conteúdo: {entryResult.error.message}</p>;
    }

    const entry = entryResult.data;
    const questions = quizResult.success ? quizResult.data : [];
    const previewCompositionResult = entry ? await getEntryComposition({ id: entry.id }) : null;
    const previewComposition = previewCompositionResult?.success ? previewCompositionResult.data : null;

    return (
      <div className="space-y-6">
        <p className="rounded border border-info-border bg-info-soft p-3 text-sm text-info">
          Modo de visualização (professor) — sem ações de progresso.
        </p>
        <div>
          <Link href={`/academy/${course.slug}`} className="text-xs font-medium text-text-tertiary hover:underline">
            ← Curso
          </Link>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{entry ? entry.title : `Aula ${lesson.position}`}</h1>
        </div>

        {entry &&
          (previewComposition ? (
            <BlockRenderer blocks={previewComposition} mode="published" />
          ) : (
            <article className="prose max-w-none">
              <p>{getEntryBody(entry.data)}</p>
            </article>
          ))}

        {lesson.videoUrl && (
          <section>
            <h2 className="text-sm font-semibold">Vídeo</h2>
            <div className="mt-2">
              <LessonVideoEmbed url={lesson.videoUrl} />
            </div>
          </section>
        )}

        {questions.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold">Quiz ({questions.length} pergunta(s))</h2>
            <ul className="mt-2 space-y-2">
              {questions.map((question) => (
                <li key={question.id} className="rounded border border-border-subtle p-3 text-sm">
                  {question.text}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  const progressResult = await getCourseProgress({ courseId: course.id });
  if (!progressResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar progresso: {progressResult.error.message}</p>;
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
      redirect(`/academy/${course.slug}/${currentLesson.lessonId}?blocked=1`);
    }
    redirect(`/academy/${course.slug}?blocked=1`);
  }

  const [entryResult, quizResult] = await Promise.all([
    getEntry({ id: lesson.cmsEntryId }),
    lesson.requirements.quizEnabled
      ? listQuizQuestionsForStudent({ lessonId })
      : Promise.resolve({ success: true as const, data: [] }),
  ]);

  if (!entryResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar conteúdo: {entryResult.error.message}</p>;
  }

  const entry = entryResult.data;
  const compositionResult = entry ? await getEntryComposition({ id: entry.id }) : null;
  const composition = compositionResult?.success ? compositionResult.data : null;
  const attemptsExhausted =
    lesson.requirements.quizMaxAttempts !== null &&
    !lesson.requirements.quizPassed &&
    lesson.requirements.quizAttemptsUsed >= lesson.requirements.quizMaxAttempts;

  return (
    <div className="space-y-6">
      {blocked && (
        <p className="rounded border border-warning-border bg-warning-soft p-3 text-sm text-warning">
          A aula que você tentou acessar está bloqueada. Esta é sua aula liberada atual.
        </p>
      )}
      <div>
        <Link href={`/academy/${course.slug}`} className="text-xs font-medium text-text-tertiary hover:underline">
          ← Curso
        </Link>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{entry ? entry.title : `Aula ${lesson.position}`}</h1>
      </div>

      {entry &&
        (composition ? (
          <BlockRenderer blocks={composition} mode="published" />
        ) : (
          <article className="prose max-w-none">
            <p>{getEntryBody(entry.data)}</p>
          </article>
        ))}

      {lesson.videoUrl && (
        <section>
          <h2 className="text-sm font-semibold">Vídeo</h2>
          <div className="mt-2">
            <LessonVideoEmbed url={lesson.videoUrl} />
          </div>
        </section>
      )}

      <section className="flex flex-wrap gap-4">
        {lesson.requirements.readTextEnabled &&
          (lesson.requirements.textRead ? (
            <p className="text-sm text-text-secondary">Texto lido ✓</p>
          ) : (
            <MarkProgressButton courseSlug={course.slug} lessonId={lessonId} kind="text" label="Marcar texto como lido" />
          ))}

        {lesson.requirements.watchVideoEnabled &&
          (lesson.requirements.videoWatched ? (
            <p className="text-sm text-text-secondary">Vídeo assistido ✓</p>
          ) : (
            <MarkProgressButton
              courseSlug={course.slug}
              lessonId={lessonId}
              kind="video"
              label="Marcar vídeo como assistido"
            />
          ))}
      </section>

      {lesson.requirements.quizEnabled && (
        <section>
          <h2 className="text-sm font-semibold">Quiz</h2>
          {lesson.requirements.quizPassed ? (
            <p className="mt-2 text-sm text-text-secondary">Você já passou neste quiz.</p>
          ) : !quizResult.success ? (
            <p className="mt-2 text-sm text-destructive">Erro ao carregar o quiz: {quizResult.error.message}</p>
          ) : (
            <div className="mt-2">
              <QuizForm
                courseSlug={course.slug}
                lessonId={lessonId}
                questions={quizResult.data}
                attemptsExhausted={attemptsExhausted}
              />
            </div>
          )}
        </section>
      )}
    </div>
  );
}
