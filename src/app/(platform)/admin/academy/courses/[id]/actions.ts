"use server";

import { revalidatePath } from "next/cache";
import { findUserByEmail } from "@/contexts/auth";
import {
  configureLessonRequirements,
  createLesson,
  enrollStudent,
  listActivitySubmissionMediaForCourse,
  publishCourse,
  resetQuizAttempts,
  setLessonStatus,
  unpublishCourse,
  updateCourseSettings,
  type PublishCourseTargetStatus,
} from "@/plugins/academy";
import { deleteMediaSafely } from "@/platform/media-lifecycle/delete-media-safely";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";

export type CourseActionState = { error: string | null };

const PLUGIN_DISABLED_ERROR = "O plugin Academy está desabilitado.";

// Mesmo padrão de /admin/cms/actions.ts: erro do handler devolvido de verdade via
// useActionState, nunca descartado silenciosamente (docs/venore-docks.md). Checagem de plugin
// ativo (Fase 6) repetida em cada Server Action porque ela é invocável direto, sem passar pela
// página/gate que a lista — authorizeActor sozinho não sabe que o plugin foi desabilitado.
export async function createLessonAction(_prevState: CourseActionState, formData: FormData): Promise<CourseActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const courseId = String(formData.get("courseId") ?? "");
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  const coverMediaId = String(formData.get("coverMediaId") ?? "").trim();

  const result = await createLesson({
    courseId,
    title: String(formData.get("title") ?? ""),
    body: body || undefined,
    videoUrl: videoUrl || undefined,
    coverMediaId: coverMediaId || undefined,
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  // Requisitos são opcionais na criação (mesmo padrão de composição de 2 handlers já usado em
  // enrollStudentAction): só chama configureLessonRequirements se o professor marcou algum
  // requisito no form de criação — senão a aula fica sem requisitos, ajustável depois na página
  // da aula (LessonRequirementsForm).
  const quizEnabled = formData.get("quizEnabled") === "on";
  const readTextEnabled = formData.get("readTextEnabled") === "on";
  const watchVideoEnabled = formData.get("watchVideoEnabled") === "on";
  if (readTextEnabled || watchVideoEnabled || quizEnabled) {
    const quizPassThresholdPercent = String(formData.get("quizPassThresholdPercent") ?? "").trim();
    const quizMaxAttempts = String(formData.get("quizMaxAttempts") ?? "").trim();

    const requirementsResult = await configureLessonRequirements({
      lessonId: result.data.id,
      readTextEnabled,
      watchVideoEnabled,
      quizEnabled,
      quizPassThresholdPercent: quizEnabled && quizPassThresholdPercent ? Number(quizPassThresholdPercent) : undefined,
      quizMaxAttempts: quizEnabled && quizMaxAttempts ? Number(quizMaxAttempts) : undefined,
      // Sem toggle no form de criação ainda (LessonRequirementsForm, editável depois na página da
      // aula, é quem cobre activityEnabled hoje) — ver Known Gaps.
      activityEnabled: false,
    });

    if (!requirementsResult.success) {
      return { error: requirementsResult.error.message };
    }
  }

  revalidatePath("/admin/academy");
  revalidatePath(`/admin/academy/courses/${courseId}`);
  revalidatePath(`/admin/academy/lessons/${result.data.id}`);
  return { error: null };
}

// Um único form/action pro seletor de status do curso (CourseStatusForm) em vez de dois botões —
// draft passa por unpublishCourse (sem validação de conteúdo), restricted/public por publishCourse
// (valida aulas/quiz antes). O barrel expõe as duas operações separadas pra quem quiser chamá-las
// direto; esta action só decide qual delas usar a partir do <select>.
export async function setCourseStatusAction(_prevState: CourseActionState, formData: FormData): Promise<CourseActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  const result = status === "draft" ? await unpublishCourse({ id }) : await publishCourse({ id, status: status as PublishCourseTargetStatus });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/academy");
  revalidatePath(`/admin/academy/courses/${id}`);
  revalidatePath("/academy");
  revalidatePath(`/academy/${result.data.slug}`);
  return { error: null };
}

export async function updateCourseSettingsAction(
  _prevState: CourseActionState,
  formData: FormData,
): Promise<CourseActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const id = String(formData.get("id") ?? "");
  const coverMediaId = String(formData.get("coverMediaId") ?? "").trim();

  const result = await updateCourseSettings({
    id,
    slug: String(formData.get("slug") ?? "") || undefined,
    publiclyListed: formData.get("publiclyListed") === "on",
    coverMediaId: coverMediaId || null,
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/courses/${id}`);
  revalidatePath("/academy");
  revalidatePath(`/academy/${result.data.slug}`);
  return { error: null };
}

export async function enrollStudentAction(_prevState: CourseActionState, formData: FormData): Promise<CourseActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const courseId = String(formData.get("courseId") ?? "");
  const email = String(formData.get("email") ?? "").trim();

  const userResult = await findUserByEmail({ email });
  if (!userResult.success) {
    return { error: userResult.error.message };
  }

  const result = await enrollStudent({ courseId, studentActorId: userResult.data.id });
  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/courses/${courseId}`);
  return { error: null };
}

export async function resetQuizAttemptsAction(
  _prevState: CourseActionState,
  formData: FormData,
): Promise<CourseActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const courseId = String(formData.get("courseId") ?? "");
  const lessonId = String(formData.get("lessonId") ?? "");
  const studentActorId = String(formData.get("studentActorId") ?? "");

  const result = await resetQuizAttempts({ lessonId, studentActorId });
  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/courses/${courseId}`);
  return { error: null };
}

export type ClearActivityMediaActionState = { error: string | null; clearedCount: number | null };

// Composição fora de academy e media (mesmo motivo de platform/media-lifecycle/delete-media-safely.ts,
// regra 11/14 do documento de arquitetura): academy só sabe listar quais mediaId pertencem às
// entregas de atividade do curso (list-activity-submission-media-for-course, sem cruzar pra
// media); quem decide APAGAR é este ponto de composição no app, que já tem acesso aos dois lados.
// Soft-delete (não purge) de propósito: fica em /admin/media/trash, reversível até o sweep
// automático (media.softDeleteGraceDays) ou uma purga manual — "limpar" não deveria ser
// irreversível na primeira tentativa. confirmed:true porque a intenção aqui já É apagar mídia em
// uso (a única "confirmação" que falta é o clique do professor no botão, coberto pelo diálogo
// client-side em clear-activity-media-button.tsx).
export async function clearActivitySubmissionMediaAction(
  _prevState: ClearActivityMediaActionState,
  formData: FormData,
): Promise<ClearActivityMediaActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR, clearedCount: null };
  }

  const courseId = String(formData.get("courseId") ?? "");

  const mediaResult = await listActivitySubmissionMediaForCourse({ courseId });
  if (!mediaResult.success) {
    return { error: mediaResult.error.message, clearedCount: null };
  }

  const uniqueMediaIds = [...new Set(mediaResult.data.map((item) => item.mediaId))];
  let clearedCount = 0;
  for (const mediaId of uniqueMediaIds) {
    const deleteResult = await deleteMediaSafely({ id: mediaId, confirmed: true });
    if (deleteResult.success) clearedCount++;
  }

  revalidatePath(`/admin/academy/courses/${courseId}`);
  return { error: null, clearedCount };
}

export async function setLessonStatusAction(_prevState: CourseActionState, formData: FormData): Promise<CourseActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const id = String(formData.get("id") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const status = String(formData.get("status") ?? "") as "draft" | "restricted" | "public";

  const result = await setLessonStatus({ id, status });
  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/courses/${courseId}`);
  revalidatePath(`/admin/academy/lessons/${id}`);
  revalidatePath("/academy");
  return { error: null };
}
