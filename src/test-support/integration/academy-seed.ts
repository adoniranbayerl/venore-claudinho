// Helpers de seed para os testes de integração do academy (*.integration.test.ts). Fica fora de
// src/contexts/* e src/plugins/* de propósito: eslint-plugin-boundaries só classifica elementos
// por esses dois padrões de pasta, e este módulo precisa tocar schema de auth/cms diretamente —
// não existe API pública pra criar um usuário (só nasce via evento do DrizzleAdapter, exceção já
// documentada no AGENTS.md), então o insert em auth.users é o único acesso cru necessário. Todo o
// resto passa pelas funções service.ts reais dos use cases, para que o seed também exercite o
// código de produção em vez de duplicar SQL solto pela suíte.
import { randomUUID } from "node:crypto";
import { db } from "@/infrastructure/database/client";
import { users } from "@/contexts/auth/database/schema";
import { createContentType } from "@/contexts/cms/features/content-types/create-content-type/service";
import { createEntry } from "@/contexts/cms/features/entries/create-entry/service";
import { publishEntry } from "@/contexts/cms/features/entries/publish-entry/service";
import type { EntryRecord } from "@/contexts/cms/contracts/types";
import { createCourse } from "@/plugins/academy/features/courses/create-course/service";
import { createLesson } from "@/plugins/academy/features/lessons/create-lesson/service";
import { configureLessonRequirements } from "@/plugins/academy/features/lessons/configure-lesson-requirements/service";
import { addQuizQuestion } from "@/plugins/academy/features/lessons/add-quiz-question/service";
import { enrollStudent } from "@/plugins/academy/features/enrollments/enroll-student/service";
import { markTextRead } from "@/plugins/academy/features/progress/mark-text-read/service";
import { markVideoWatched } from "@/plugins/academy/features/progress/mark-video-watched/service";
import { submitQuizAttempt } from "@/plugins/academy/features/progress/submit-quiz-attempt/service";
import type { SubmitQuizAttemptResult } from "@/plugins/academy/features/progress/submit-quiz-attempt/types";
import type {
  CourseRecord,
  EnrollmentRecord,
  LessonRecord,
  LessonRequirementsRecord,
  QuizQuestionRecord,
} from "@/plugins/academy/contracts/types";
import type { OperationResult } from "@/shared/types";

function unwrap<T>(result: OperationResult<T>): T {
  if (!result.success) {
    throw new Error(`Seed helper falhou: ${result.error.code} — ${result.error.message}`);
  }
  return result.data;
}

export async function seedUser(overrides: Partial<{ email: string; name: string }> = {}): Promise<{ id: string; email: string }> {
  const [row] = await db
    .insert(users)
    .values({
      email: overrides.email ?? `${randomUUID()}@integration.test`,
      name: overrides.name ?? "Integration Test User",
    })
    .returning({ id: users.id, email: users.email });
  return row;
}

export async function seedCourse(
  actorId: string,
  overrides: Partial<{ title: string; description: string; slug: string }> = {},
): Promise<CourseRecord> {
  return unwrap(
    await createCourse({
      title: overrides.title ?? `Curso ${randomUUID()}`,
      description: overrides.description,
      slug: overrides.slug,
      actorId,
    }),
  );
}

// Entry em rascunho — cada chamada cria seu próprio content type (key única) porque
// cms.content_types.key é unique e é truncado a cada teste.
export async function seedDraftEntry(actorId: string, overrides: Partial<{ title: string; slug: string }> = {}): Promise<EntryRecord> {
  const unique = randomUUID();
  const contentType = unwrap(
    await createContentType({ key: `academy-lesson-${unique}`, name: "Academy Lesson (test)", actorId }),
  );
  return unwrap(
    await createEntry({
      contentTypeId: contentType.id,
      title: overrides.title ?? `Entry ${unique}`,
      slug: overrides.slug ?? `entry-${unique}`,
      actorId,
    }),
  );
}

// Entry publicada, pronta pra ser referenciada por uma lesson.
export async function seedPublishedEntry(actorId: string, overrides: Partial<{ title: string; slug: string }> = {}): Promise<EntryRecord> {
  const draft = await seedDraftEntry(actorId, overrides);
  return unwrap(await publishEntry({ id: draft.id, actorId, resolveDefinition: () => null }));
}

// Cria `count` aulas em ordem (posições 1..count), cada uma com sua própria entry publicada —
// é o que o pedido chama de "criar N aulas com posições".
export async function seedLessons(courseId: string, count: number, actorId: string): Promise<LessonRecord[]> {
  const lessons: LessonRecord[] = [];
  for (let i = 0; i < count; i += 1) {
    const entry = await seedPublishedEntry(actorId);
    lessons.push(unwrap(await createLesson({ courseId, cmsEntryId: entry.id, actorId })));
  }
  return lessons;
}

// Aula cujo cmsEntryId aponta pra uma entry ainda em rascunho — cenário do teste de
// publish-course (achado: cms.getEntry não filtra por status hoje, então create-lesson aceita a
// referência mesmo sem publicar; ver academy-seed.ts topo de arquivo / relatório da sessão).
export async function seedLessonWithDraftEntry(courseId: string, actorId: string): Promise<LessonRecord> {
  const entry = await seedDraftEntry(actorId);
  return unwrap(await createLesson({ courseId, cmsEntryId: entry.id, actorId }));
}

// videoUrl precisa existir antes de watchVideoEnabled=true (configure-lesson-requirements
// recusa senão) — seedLessons não passa videoUrl, então esta chamada seta um valor primeiro
// quando necessário.
export async function seedLessonRequirements(
  lessonId: string,
  actorId: string,
  overrides: Partial<{
    readTextEnabled: boolean;
    watchVideoEnabled: boolean;
    quizEnabled: boolean;
    quizPassThresholdPercent: number;
    quizMaxAttempts: number;
    videoUrl: string;
  }> = {},
): Promise<LessonRequirementsRecord> {
  if (overrides.watchVideoEnabled) {
    const { updateLessonService } = await import("@/plugins/academy/features/lessons/update-lesson/service");
    unwrap(await updateLessonService({ id: lessonId, videoUrl: overrides.videoUrl ?? "https://example.test/video.mp4", actorId }));
  }

  return unwrap(
    await configureLessonRequirements({
      lessonId,
      readTextEnabled: overrides.readTextEnabled ?? false,
      watchVideoEnabled: overrides.watchVideoEnabled ?? false,
      quizEnabled: overrides.quizEnabled ?? false,
      quizPassThresholdPercent: overrides.quizPassThresholdPercent,
      quizMaxAttempts: overrides.quizMaxAttempts,
      actorId,
    }),
  );
}

export async function seedQuizQuestion(
  lessonId: string,
  actorId: string,
  overrides: Partial<{ text: string; options: string[]; correctOptionIndex: number }> = {},
): Promise<QuizQuestionRecord> {
  return unwrap(
    await addQuizQuestion({
      lessonId,
      text: overrides.text ?? "Pergunta de teste?",
      options: overrides.options ?? ["A", "B", "C"],
      correctOptionIndex: overrides.correctOptionIndex ?? 0,
      actorId,
    }),
  );
}

export async function seedEnrollment(courseId: string, studentActorId: string, actorId: string): Promise<EnrollmentRecord> {
  return unwrap(await enrollStudent({ courseId, studentActorId, actorId }));
}

// Trio de "registrar progresso" via os use cases reais de progress — cada um já checa
// matrícula + cadeia de bloqueio, então só funciona se a aula estiver de fato acessível
// (é a mesma regra de segurança que os testes de cadeia exercitam).
export async function seedTextRead(lessonId: string, actorId: string) {
  return unwrap(await markTextRead({ lessonId, actorId }));
}

export async function seedVideoWatched(lessonId: string, actorId: string) {
  return unwrap(await markVideoWatched({ lessonId, actorId }));
}

// Não usa `unwrap`: alguns testes querem submeter um attempt errado de propósito (ex: cadeia
// bloqueada, tentativas esgotadas) e verificar o `OperationResult` de erro diretamente.
export async function seedQuizAttempt(
  lessonId: string,
  actorId: string,
  questions: QuizQuestionRecord[],
): Promise<SubmitQuizAttemptResult> {
  const answers = questions.map((question) => ({ questionId: question.id, selectedOptionIndex: question.correctOptionIndex }));
  return submitQuizAttempt({ lessonId, answers, actorId });
}
