import { getEntry } from "@/contexts/cms";
import { beginOperation, endOperation } from "@/observability";
import { findNextPosition, insertLesson } from "./store";
import type { CreateLessonCommand, CreateLessonResult } from "./types";

export async function createLesson(command: CreateLessonCommand): Promise<CreateLessonResult> {
  const handle = beginOperation({
    useCase: "academy.create-lesson",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  // cms.getEntry só retorna entries "published" — só dá pra anexar conteúdo já publicado a uma
  // aula (é o único jeito de ler uma entry exposto pelo barrel de cms hoje).
  const entry = await getEntry({ id: command.cmsEntryId });
  if (!entry.success || !entry.data) {
    const error = {
      code: "academy.lessons.invalid_cms_entry",
      message: `Nenhuma entry publicada encontrada com id "${command.cmsEntryId}".`,
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const position = await findNextPosition(command.courseId);
  const lesson = await insertLesson({
    courseId: command.courseId,
    cmsEntryId: command.cmsEntryId,
    videoUrl: command.videoUrl,
    position,
  });

  endOperation(handle, { success: true });
  return { success: true, data: lesson };
}
